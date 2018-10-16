/**
 * Import the other Node packages
 */
var channelVideos = require("yt-channel-videos")('AIzaSyCY7gLGo-iqtU6N2XsbKNA4mrmZPG02MI8');
var getYoutubeSubtitles = require("@joegesualdo/get-youtube-subtitles-node");
var flatCache = require('flat-cache')
var cache = flatCache.load('cacheId');

/**
 * App Settings
 */
var videoNumberLimit = 3;
var channelName = "PowerfulJRE"; // PowerfulJRE or SpectreSoundStudios

function queryVideosList() {
  channelVideos.allUploads(channelName)
  .then((videos) => {

    var videoList = [];
    var i = 0;

    // Setup the cache
    flatCache.clearCacheById('cacheId');
    cache.setKey('key', { ids: videoList });

    for(var videoItem of videos.items) {
      if(videoNumberLimit != 0 && i < videoNumberLimit) {
        // Video Title: videoItem.snippet.title
        // Video Watch ID: videoItem.snippet.resourceId.videoId
        // Log each video added
        console.log("Added: " + videoItem.snippet.title);
        // Build an array of the video watch IDs
        videoList.push(videoItem.snippet.resourceId.videoId);
        // Only count videos we find an ID for
        i++;
      }
    }

    // All done now
    console.log("All done adding videos!");
    return true;

  }, (err) => {
    // Rejected
    return console.log(err);
  })
}

async function callTheChannel() {
  console.log("Ring, ring ...");
  var x = await queryVideosList();

  console.log(x);

}

callTheChannel();