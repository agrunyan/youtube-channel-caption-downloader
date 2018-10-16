/**
 * Import the other Node packages
 */
let channelVideos = require("yt-channel-videos")('AIzaSyCY7gLGo-iqtU6N2XsbKNA4mrmZPG02MI8');
let getYoutubeSubtitles = require("@joegesualdo/get-youtube-subtitles-node");
let cacheCore = require('flat-cache')
let cache = cacheCore.load('collection');
const EventEmitter = require('events');
const util = require('util');

/**
 * App Settings
 */
let videoNumberLimit = 10;
let channelName = "MichaelSealey"; // PowerfulJRE, presonusaudio, MichaelSealey, PowerfulJRE or SpectreSoundStudios

/**
 * Event Handlers
 */
function Notifier() {
  EventEmitter.call(this);
}
util.inherits(Notifier, EventEmitter);
const EventNotifier = new Notifier();

/**
 * Utilities
 */


/**
 * YouTube Channel Query
 */
function queryYoutube() {
  channelVideos.allUploads(channelName)
  .then((videos) => {

    let videoList = [];
    let i = 0;

    for(let videoItem of videos.items) {
      if(videoNumberLimit != 0 && i < videoNumberLimit) {
        // Build an array of the video watch IDs
        videoList.push(videoItem.snippet.resourceId.videoId);
        EventNotifier.emit("video-added");
        console.log("Added: " + videoItem.snippet.title);
        i++; // Only count videos we find an ID for
      }
    }

    // Store the watch ids
    cache.setKey("video-ids", { ids: videoList });
    // All done now
    console.log("\n" + i + "YouTube videos added from channel..." + "\n");
    // Save the new array
    cache.save( true );
    // Bye now
    return EventNotifier.emit('video-list-complete');

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

  for(let id of videoListArray.ids) {
    getYoutubeSubtitles(id, {type: "auto"})
    .then((data) => {
  
      let wordArray = [];

      for(let captions of data) {
        for(let wordAndTime of captions.words) {
          if(wordAndTime.word != 0) {
            wordArray.push(wordAndTime.word);
          }
        }
      }

    // Cache
    cache.setKey("captions", { words: wordArray });
    cache.save( true );
  
    }, (err) => {
      console.log("Error: " + err);
    });
  }

  // Done
  return EventNotifier.emit("word-list-complete");
}

async function init() {
  console.log("\n" + "Calling " + channelName + "'s YouTube Channel for their last" + videoNumberLimit + "videos..." + "\n");
  cacheCore.clearCacheById("collection"); // Clear the cache
  return await queryYoutube();
}

/**
 * Run
 */
init();

EventNotifier.on("video-list-complete", () => {
  let videos = cache.getKey("video-ids");
  captionQuery(videos);
});  

EventNotifier.on("word-list-complete", () => {
  let captions = cache.getKey("captions");
  let wordCount = captions.words.length;

  console.log(wordCount + "" + "\n");
  console.log(captions.words + "\n"); // Generally followed by errors printed to the console, if any
});  