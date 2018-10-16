/**
 * Import the other Node packages
 */
let channelVideos = require("yt-channel-videos")('AIzaSyCY7gLGo-iqtU6N2XsbKNA4mrmZPG02MI8');
let getYoutubeSubtitles = require("@joegesualdo/get-youtube-subtitles-node");
let cacheCore = require("flat-cache");
let cache = cacheCore.load("collection");
const EventEmitter = require("events");
const util = require("util");

/**
 * App Settings
 */
let videoNumberLimit = 3;
// PowerfulJRE, presonusaudio, MichaelSealey, PowerfulJRE or SpectreSoundStudios
let channelName = "MichaelSealey"; 

/**
 * Event Handlers
 */
const EventNotifier = new Notifier();

function Notifier() {
  EventEmitter.call(this);
}

/**
 * Utilities
 */
function once(fn, context) { 
	var result;

	return function() { 
		if(fn) {
			result = fn.apply(context || this, arguments);
			fn = null;
		}

		return result;
	};
}

util.inherits(Notifier, EventEmitter);

/**
 * YouTube Channel Query
 */
function queryYoutube() {
  console.log("\n" + "Requesting videos from " + channelName + "...");

  channelVideos.allUploads(channelName)
  .then((videos) => {

    let videoList = [];
    let i = 0;

    for(let videoItem of videos.items) {
      if(videoNumberLimit != 0 && i < videoNumberLimit) {
        // Build an array of the video watch IDs
        videoList.push(videoItem.snippet.resourceId.videoId);
        i++; // Only count videos we find an ID for
      }
    }

    // Clear the cache
    cacheCore.clearCacheById("collection");
    // Store the watch ids
    cache.setKey("video-ids", { ids: videoList });
    // All done now
    console.log("Success! " + i + " videos added from channel." + "\n");
    // Save the new array
    cache.save( true );
    // Bye now
    return EventNotifier.emit("video-list-complete");

  }, (err) => {
    // Rejected
    return console.log(err);
  })
}

/**
 * Caption Query
 */
function captionQuery(videoListArray) {
  console.log("Requesting captions...");

  let wordArray = [];

  for(let id of videoListArray.ids) {
    getYoutubeSubtitles(id, {type: "auto"})
    .then((data) => {

      for(let captions of data) {
        for(let wordAndTime of captions.words) {
          if(wordAndTime.word != 0) {
            wordArray.push(wordAndTime.word);
          }
        }
      }

      // Setup the cache
      cache.setKey("captions", { words: wordArray });

      // Update the cache each round of iteration
      cache.save( true );      
  
    }, (err) => {
      console.log("Error: " + err);
    });
  }

  let wordCount = cache.getKey("captions").words.length;
  console.log("Success! " + wordCount + " words found." + "\n");

  // Finished collecting words
  return EventNotifier.emit("word-list-complete");
}

let cleanCacheOnce = once(function() {
  return cacheCore.clearAll();
});

async function init() {
  cleanCacheOnce();
  return await queryYoutube();
}

/**
 * App Initialization
 */
init();

// Wait for the fun
EventNotifier.on("video-list-complete", () => {
  let list = cache.getKey("video-ids");
  return captionQuery(list);
});  

EventNotifier.on("word-list-complete", () => {
  let cap = cache.getKey("captions");
  console.log(cap.words);
  return cacheCore.clearCacheById("collection");
});