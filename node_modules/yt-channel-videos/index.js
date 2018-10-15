var yt = require('googleapis').youtube('v3');
var EventEmitter = require('events').EventEmitter;

module.exports = channelVideos;


/*
 * Initialize channel videos object with API key
 *
 * @param {String} key
 * @return {Object} channelVideos object
 */
function channelVideos(key) {
  if (!key) throw new Error('Please initialize with a YouTube API key');
  return {
    uploadsId: uploadsId,
    playlistPage: playlistPage,
    pagesUntil: pagesUntil,
    allUploads: allUploads,
    uploadsAfterDate: uploadsAfterDate,
    uploadsAfterVideo: uploadsAfterVideo
  };


  /*
   * Make Promise for the playlistId of uploads for specified channel
   *
   * @param {String} channel
   * @return {Promise} Promise for playlistId
   */
  function uploadsId(channel) {
    return new Promise(function(resolve, reject) {
      var options = {
        part: 'contentDetails',
        forUsername: channel,
        auth: key
      };
      yt.channels.list(options,function(err, data) {
        if (err) reject(err);
        if (data.items.length === 0) return reject(Error('Channel has no uploads'));
        resolve(data.items[0].contentDetails.relatedPlaylists.uploads);
      });
    });
  }


  /*
   * Make Promise for a page of video snippets from a playlist
   *
   * @param {String} playlistId
   * @param {String} pageToken
   * @param {Number} max (optional)
   * @return {Promise} Promise for one page of video snippets from playlist
   */
  function playlistPage(playlistId, pageToken, max) {
    var options = {
      part: 'snippet',
      playlistId: playlistId,
      auth: key
    };
    if (max < 50) {
      options.maxResults = max;
    }
    else {
      options.maxResults = 50;
    }
    if (pageToken) {
      options.pageToken = pageToken;
    }
    return new Promise(function(resolve, reject) {
      yt.playlistItems.list(options, function(err, data) {
        if (err) reject(err);
        resolve({
          pageToken: data.nextPageToken,
          items: data.items
        });
      });
    });
  }


  /* Make promise for all pages until some condition is met
   *
   * @param {String} playlistId
   * @param {Function} condition
   * @return {Promise} Promise for object of all video snippets before condition
   */
  function pagesUntil(playlistId, condition) {
    var emitter = new EventEmitter();
    var resultPages = {
      videoCount: 0,
      pageCount: 0,
      items: []
    };
    return new Promise(function(resolve, reject) {
      emitter.on('complete', function() {
        resolve(resultPages);
      });
      emitter.on('continue', function(pageToken) {
        playlistPage(playlistId,pageToken).then(function(res) {
          resultPages.pageCount++;
          resultPages.videoCount += res.items.length;
          resultPages.items = resultPages.items.concat(res.items);
          if (condition(res)) return emitter.emit('complete');
          emitter.emit('continue', res.pageToken);
        }).catch(function(err) {
          reject(err);
        });
      });
      emitter.emit('continue');
    });
  }


  /* Make promise for all uploads on given YouTube channel
   *
   * @param {String} channel
   * @return {Promise} Promise for object of all uploads
   */
  function allUploads(channel) {
    return new Promise(function (resolve, reject) {
      uploadsId(channel)
      .then(function(playlistId) {
        return pagesUntil(playlistId, function(page) {
          return !page.pageToken;
        });
      }).then(function(res) {
        resolve(res);
      }).catch(function(err) {
        reject(err);
      });
    });
  }


  /* Make promise for all uploads after a given date
   *
   * @param {String} channel
   * @param {Date} date
   * @return {Promise} Promise for object of uploads after date on channel
   */
  function uploadsAfterDate(channel, date) {
    return new Promise(function (resolve, reject) {
      uploadsId(channel)
      .then(function(playlistId) {
        return pagesUntil(playlistId, function(page) {
          return page.items.some(function(item) {
            var itemDate = new Date(item.snippet.publishedAt);
            return itemDate < date;
          });
        });
      }).then(function(res) {
        res.items = res.items.filter(function(item) {
          var itemDate = new Date(item.snippet.publishedAt);
          return itemDate > date;
        });
        resolve(res);
      }).catch(function(err) {
        reject(err);
      });
    });
  }


  /* Make promise for all uploads after a given videoId
   *
   * @param {String} channel
   * @param {String} videoId
   * @return {Promise} Promise for object of uploads after video
   */
  function uploadsAfterVideo(channel, videoId) {
    return new Promise(function (resolve, reject) {
      uploadsId(channel)
      .then(function(playlistId) {
        return pagesUntil(playlistId, function(page) {
          return page.items.some(function(item) {
            return item.snippet.resourceId.videoId === videoId;
          });
        });
      }).then(function(res) {
        for(var i=0; i<res.items.length; i++) {
          if (res.items[i].snippet.resourceId.videoId === videoId) {
            res.items = res.items.slice(0,i);
            resolve(res);
          }
        }
        resolve(res);
      }).catch(function(err) {
        reject(err);
      });
    });
  }
}
