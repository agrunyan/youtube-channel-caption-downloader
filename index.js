var channelVideos = require("yt-channel-videos")('AIzaSyCY7gLGo-iqtU6N2XsbKNA4mrmZPG02MI8');
var getYoutubeSubtitles = require("@joegesualdo/get-youtube-subtitles-node");
var videoNumberLimit = 10;
var channelName = "SpectreSoundStudios"; // PowerfulJRE or SpectreSoundStudios

async function run() {
  channelVideos.allUploads(channelName)
  .then((videos) => {

    var videoList = [];
    var i = 0;

    for(var videoID of videos.items) {
      if(videoNumberLimit != 0 && i < videoNumberLimit) {
        videoList.push(videoID.snippet.resourceId.videoId);
        i++; // Only count videos we find an ID for
      }
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(videoList);
      }, 300)
    })

  }, (err) => {

    // Rejected
    return console.log(err);

  })
  .then((videoList) => {

    var wordArray = [];
    function finalWordList(itemID) {
      getYoutubeSubtitles(itemID, {type: "auto"})
      .then((data) => {

        for(var captions of data) {
          for(var wordAndTime of captions.words) {
            if(wordAndTime.word != 0) {
              wordArray.push(wordAndTime.word);
            }
          }
        }

      }, (err) => {
        console.error(err);
      });
    }

    if(Array.isArray(videoList)) {
      for (var itemID of videoList) {
        finalWordList(itemID);
      }
    }

  }, (err) => {
    // Rejected
    return console.log(err);
  });
}

/**
 * Let's go!
 */
run();

