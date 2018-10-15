var chai = require('chai');
var channelVids = require('./index');
var config = require('./config.json');
var expect = chai.expect;
var assert = chai.assert;

describe('yt-channel-videos', function() {
  this.timeout(5000);
  var chan = channelVids(config.key);
  it('should get channel playlistId', function() {
    expect(true).to.be.true;
  });
  it('should be a function', function() {
    expect(channelVids).to.be.instanceof(Function);
  });
  it('should throw error when key unprovided', function() {
    expect(channelVids).to.throw(Error);
  });
  it('should not throw error when key provided', function() {
    expect(channelVids.bind(null,config.key)).to.not.throw(Error);
  });

  describe('uploadsId', function() {
    var playlistPromise;
    beforeEach(function() {
      playlistPromise = chan.uploadsId('xpantherx');
    });
    it('should be a Promise', function() {
      expect(playlistPromise).to.be.instanceof(Promise);
    });
    it('should resolve to playlistId string', function() {
      return playlistPromise.then(function(res) {
        assert.isString(res);
      });
    });
    it('should error if no such channel', function() {
      var invalidChannel = chan.uploadsId('!@#$%');
      return invalidChannel.catch(function(err) {
        expect(err).to.be.instanceof(Error);
      });
    });
  });

  describe('playlistPage', function() {
    var playlistId = 'UUr5F2ScU7YbLnDRHw0-KtSQ'; // xpantherx uploads
    var pagePromise = chan.playlistPage(playlistId);
    it('should be a Promise', function() {
      expect(pagePromise).to.be.instanceof(Promise);
    });
    it('should resolve to a playlist page response', function() {
      return pagePromise.then(function(res) {
        expect(res).to.have.property('items');
        expect(res).to.have.property('pageToken');
      });
    });
    it('should receive 50 items per page by default', function() {
      return pagePromise.then(function(res) {
        expect(res.items).to.have.length(50);
      });
    });
    it('should allow receiving fewer than 50 items per page', function() {
      return chan.playlistPage(playlistId,null, 15)
      .then(function(res) {
        expect(res.items).to.have.length(15);
      });
    });
  });

  describe('allUploads', function() {
    var allUploadsPromise = chan.allUploads('xpantherx');
    it('should be a Promise', function() {
      expect(allUploadsPromise).to.be.instanceof(Promise);
    });
    it('should resolve to all uploads', function() {
      return allUploadsPromise.then(function(res) {
        expect(res).to.have.property('pageCount');
        expect(res).to.have.property('videoCount');
        expect(res).to.have.property('items');
        expect(res.videoCount).to.be.closeTo(res.pageCount * 50, 50);
      });
    });
  });

  describe('uploadsAfterDate', function() {
    var date = new Date(2015, 0, 1);
    var uploadsAfterDate = chan.uploadsAfterDate('xpantherx', date);
    it('should return only videos uploaded after given date', function() {
      return uploadsAfterDate.then(function(res) {
        assert.isTrue(res.items.every(function(item) {
          var itemDate = new Date(item.snippet.publishedAt);
          return itemDate > date;
        }));
      });
    });
  });

  describe('uploadsAfterVideo', function() {
    var videoId = '_qmmB8kB5O0';
    var uploadsAfterVideo = chan.uploadsAfterVideo('xpantherx', videoId);
    it('should return only videos uploaded after given videoId', function() {
      return uploadsAfterVideo.then(function(res) {
        assert.isTrue(res.items.every(function(item) {
          return item.snippet.resourceId.videoId !== videoId;
        }));
      });
    });
  });
});
