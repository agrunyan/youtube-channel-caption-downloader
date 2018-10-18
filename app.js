"use strict";

/**
 * Import the other Node packages
 */
let channelVideos = require("yt-channel-videos")('AIzaSyCY7gLGo-iqtU6N2XsbKNA4mrmZPG02MI8');
let getYoutubeSubtitles = require("@joegesualdo/get-youtube-subtitles-node");
let cacheCore = require("flat-cache");
let cache = cacheCore.load("collection");
let sentiment = require("sentiyapa.js");
let sentimentAnalyzer = new sentiment.Sentiyapa(); // Sentiment analysis

const chalk = require("chalk");
const EventEmitter = require("events");
const util = require("util");
const log = console.log;

sentimentAnalyzer.init();

/**
 * App Settings
 * 
 * YouTube channels to test with:
 * PowerfulJRE, presonusaudio, MichaelSealey, PowerfulJRE or SpectreSoundStudios
 * 
 */
let videoNumberLimit = 25;
let channelName = "MichaelSealey"; 

/**
 * Utilities
 */
const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function init() {
  await app();
}

/**
 * Event Handlers
 */
function Notifier() {
  EventEmitter.call(this);
}
util.inherits(Notifier, EventEmitter);
const EventNotifier = new Notifier();

// Runs when the word array built from the captions is finished
EventNotifier.on("words-array-ready", () => {
  let cachedWords = cache.getKey("word-array");  // Returns the cache object with an array of words
  let wordString = cachedWords.join(" ");
  let wordScore = sentimentAnalyzer.score(wordString);

  return console.log(wordScore);
}); 

/**
 * Business logic
 */
function app() {
  log(chalk.yellow("\n" + "Requesting videos from " + channelName + "..." + "\n"));

  channelVideos.allUploads(channelName)
  .then((videos) => {

    var videoList = [];
    var x = 0;

    for(let videoItem of videos.items) {
      if(videoNumberLimit != 0 && x < videoNumberLimit) {
        // Build an array of the video watch IDs
        videoList.push(videoItem.snippet.resourceId.videoId);
        console.log("Added: " + videoItem.snippet.title);
        x++; // Only count videos we find an ID for
      }
    }

    // Done building array of video IDs
    log(chalk.green("\n" + "Yay! " + x + " videos added from channel." + "\n"));
    
  /**
   * Caption Query
   */
    log(chalk.yellow("Requesting captions..." + "\n"));

    var wordArray = [];
    var i = 0;
  
    for(let id of videoList) {
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
        log("So far " + chalk.green(numberWithCommas(wordArray.length)) + " words have been found."); 
        i++;
  
        // Exit when finished
        if(i == videoNumberLimit) {

          cache.setKey("word-array", { words: wordArray });
          cache.save(); // This will also clear any previous cache

          return EventNotifier.emit("words-array-ready");
        }
  
      }, (err) => {
        log(chalk.red("Error: " + err));
        i++; // Even if there aren't captions, still count it
      })
    } 

  }, (err) => {
    // Rejected
    console.log(err);
  })
}

/**
 * App Initialization
 */
init();
