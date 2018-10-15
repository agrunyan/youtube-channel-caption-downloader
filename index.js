var channelVideos = require("yt-channel-videos")('AIzaSyCY7gLGo-iqtU6N2XsbKNA4mrmZPG02MI8');
var videoNumberLimit = 1;
var channelNameToUse = "PowerfulJRE"; // PowerfulJRE or SpectreSoundStudios

function run(channelName) {
  channelVideos.allUploads(channelName)
  .then((videos) => {

    var videoList = [];
    var i = 0;

    for(var videoID of videos.items) {
      if(i < videoNumberLimit) {
        videoList.push(videoID.snippet.resourceId.videoId);
      }
      i++;
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(videoList);
      }, 300)
    })

  }, (reason) => {

    // Rejected
    return console.log(reason);

  })
  .then((videoList) => {

    if(Array.isArray(videoList)) {
      for (var itemID of videoList) {

        getSubtitles({
          videoID: itemID
        }).then(function(captions) {
          return console.log(captions);
        }, (reason) => {
          return console.log(reason + "\n");
        });
      }

    } else {
      console.log("Expecting an array, but didn't get one.");
    }

  }, (reason) => {
    console.log(reason + "\n");
  });

}

/**
 * Let's go!
 */
return run(channelNameToUse);
