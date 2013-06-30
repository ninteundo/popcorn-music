var fs = Meteor.require('fs');
var walk = Meteor.require('walkdir');
var mm = Meteor.require('musicmetadata');

if (Songs.find().count() === 0) {
  walk('./public/music', Meteor.bindEnvironment(function(path, stat) {
    var parts = path.split('/');
    // Check if the first character is '.'
    if ((parts[parts.length - 1].substring(0, 1) == ".") ||
      (fs.lstatSync(path).isDirectory())) {
      // Do nothing
    } else {
      var parser = new mm(fs.createReadStream(path));
      parser.on('metadata', Meteor.bindEnvironment(function(result) {
        result['url'] = '/music/' + parts[parts.length - 2] + '/' + parts[parts.length - 1];
        result.picture = undefined;
        Songs.insert(result);
      }, function(err) {
        console.log("error in add-music.js 1" + err);
      }));
    }
  }, function(err) {
    console.log("err in add-music.js 2" + err);
  }));
}
