
let channelVideos = require("yt-channel-videos")('AIzaSyCY7gLGo-iqtU6N2XsbKNA4mrmZPG02MI8');
let getYoutubeSubtitles = require("@joegesualdo/get-youtube-subtitles-node");
let cacheCore = require("flat-cache");
let cache = cacheCore.load("collection");
let Sentiment = require("sentiment");
let sentiment = new Sentiment();

const chalk = require("chalk");;
const log = console.log;

/**
 * Utilities
 */
const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * App Settings
 * YouTube channels to test with:
 * PowerfulJRE, presonusaudio, MichaelSealey, or SpectreSoundStudios
 */

class CaptionAnalyzer {
  constructor(x,y) {
    this.numberOfVideos = x;
    this.youtubeChannelName = y;
    this.Run();
  }

  async Run() {
    if(this.numberOfVideos === "undefined" || this.youtubeChannelName === "undefined") {
      return console.error("Number of videos and/or channel name is not defined.");
    }
    return await this.ProcessCaptions();
  }  

  ProcessCaptions() {
    /**
     * Step #1
     */
    log(chalk.yellow("\n" + "Requesting videos from " + this.youtubeChannelName + "..." + "\n"));

    channelVideos.allUploads(this.youtubeChannelName)
      .then((videos) => {
    
        var videoList = [];
        var x = 0;
    
        for(let videoItem of videos.items) {
          if(this.numberOfVideos != 0 && x < this.numberOfVideos) {
            // Build an array of the video watch IDs
            videoList.push(videoItem.snippet.resourceId.videoId);
            let title = videoItem.snippet.title;
            console.log(chalk.green("#" + (x + 1) + " ") + title.substring(0, 50) + "...");
            x++; // Only count videos we find an ID for
          }
        }
    
      log(chalk.green("\n" + "Yay! " + x + " videos added from channel." + "\n"));
      log(chalk.yellow("Requesting captions..." + "\n"));
    
      /**
       * Step #2
       */

      var i = 0;

      for(let id of videoList) {
        this.RequestCaptions(id, i++);
      }

    }, (err) => {
      // Rejected
      log(err);
    })
  }

  RequestCaptions(z, n) {
    var wordArray = [];

    getYoutubeSubtitles(z, {type: "auto"})
    .then((data) => {

      for(let captions of data) {
        for(let wordAndTime of captions.words) {
          if(wordAndTime.word != 0) {
            wordArray.push(wordAndTime.word);
          }
        }
      }

      // For each round
      log("So far " + chalk.blue(numberWithCommas(wordArray.length)) + " words have been found."); 

      // Once we've run through the list of videos, report back
      if((n + 1) == this.numberOfVideos) {
        return this.Report(wordArray);
      }

    }, (err) => {
      // Log the error
      log(chalk.red("Error: " + err));
    })
  }

  Report(y) {
    let wordString = y.join(" ");

    /**
     * AFINN is a list of words rated for valence with an integer between minus five (negative) and plus five
     * (positive). Sentiment analysis is performed by cross-checking the string tokens(words, emojis) with the
     * AFINN list and getting their respective scores. The comparative score is simply: sum of each token /
     * number of tokens.
     */
    let analyzer = sentiment.analyze(wordString);

    if(wordString != 0) {
      var result =
        "\n" +
        "\n" + "Score: " + chalk.green(analyzer.score) +
        "\n" + "Comparative Score: " + chalk.green.underline(analyzer.comparative.toFixed(4)) +
        "\n" + "Words Recognized: " + chalk.green(analyzer.words.length) +
        "\n";
    } else {
      var result = "\n" + chalk.yellow("Sorry, no captions available to analyze.");
    }
    
    // Final result and end of script
    return log(result);
  }
}

/**
 * Run
 */
return new CaptionAnalyzer("10", "SpectreSoundStudios");