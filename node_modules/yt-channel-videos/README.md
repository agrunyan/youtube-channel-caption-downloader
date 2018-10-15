[![Build Status](https://travis-ci.org/CrockAgile/yt-channel-videos.svg?branch=master)](https://travis-ci.org/CrockAgile/yt-channel-videos)

# yt-channel-videos 
Retrieve snippet data for all of a channel's videos

## Install
```
npm install -S yt-channel-videos
```

## Example
```javascript
var channelVids = require('yt-channel-videos')('YOUTUBE-API-KEY-HERE');

channelVids.allUploads('YOUTUBE-CHANNEL-NAME-HERE')
.then(function(videos) {
  console.log(videos); // { videoCount: X, pageCount: Y, items: [...] }
});

channelVids.uploadsAfterDate('CHANNEL-NAME', new Date(2015, 0, 1))
.then(function(newVideos) {
  // use new videos
});
```

## License
MIT
