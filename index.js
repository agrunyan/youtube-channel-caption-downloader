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
        // Print each ID to the console
        // This is where the captions need to be pulled
        console.log(itemID);
      }

    } else {
      return console.log("Expecting an array, but didn't get one.");
    }

  }, (err) => {
    return console.log(err);
  });

}

/**
 * Let's go!
 */
return run(channelNameToUse);
