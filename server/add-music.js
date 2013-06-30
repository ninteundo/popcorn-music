var fs = Meteor.require('fs');
var walk = Meteor.require('walkdir');
var mm = Meteor.require('musicmetadata');
// var Fiber = Meteor.require('fibers');

// Meteor.bindEnvironment(function() {

// });

if (Songs.find().count() === 0) {
  walk('./public/music/', Meteor.bindEnvironment(function(path, stat) {
    var parser = new mm(fs.createReadStream(path));
    parser.on('metadata', Meteor.bindEnvironment(function(result) {
      console.log(path);
      var parts = path.split('/')
      result['url'] = '/' + parts[parts.length - 2] + '/' + parts[parts.length - 1]
      Songs.insert(result);
    }, function(err) {

    }));
  }, function(err) {

  }));
}