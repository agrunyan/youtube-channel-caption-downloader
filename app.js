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
let videoNumberLimit = 13;
// PowerfulJRE, presonusaudio, MichaelSealey, PowerfulJRE or SpectreSoundStudios
let channelName = "SpectreSoundStudios"; 

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

    // Store the watch ids
    cache.setKey("video-ids", { ids: videoList });
    // All done now
    console.log("Success! " + i + " videos added from channel." + "\n");
    // Save the new array
    cache.save( true );
    // Exit
    EventNotifier.emit("video-list-complete");

  }, (err) => {
    // Rejected
    console.log(err);
  })
}

/**
 * Caption Query
 */
function captionQuery(videoListArray, callBack) {
  console.log("Requesting captions..." + "\n");

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

      // For each round
      console.log("So far " + wordArray.length + " words have been found."); 

    }, (err) => {
      console.log("Error: " + err);
    })
    .then(_ => new Promise(resolve =>
      setTimeout(function () {
        resolve();
      }, Math.random() * 1000)
    ));
  }

  callBack(wordArray);
}

async function init() {
  return await queryYoutube();
}

/**
 * App Initialization
 */
init();

/**
 * Utilities
 */
util.inherits(Notifier, EventEmitter);

/**
 * Event Handlers
 */
function Notifier() {
  EventEmitter.call(this);
}

const EventNotifier = new Notifier();

// Wait for the fun
EventNotifier.on("video-list-complete", () => {
  let list = cache.getKey("video-ids");

  captionQuery(list, function(wordArray) {
    console.log( wordArray );
  });

});  

