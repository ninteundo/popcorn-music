Meteor.publish("users", function(){
  return Users.find();
});

Meteor.publish('playlists', function(){
  return Playlists.find();
});

Meteor.publish('messages', function(){
  return Messages.find();
});

Meteor.publish('songs', function(){
  return Songs.find();
});

Meteor.methods({
  addUser: function(userName, userId){
    console.log("adding user");
    Users.insert({userName: userName, userId: userId, playCount:0, timeJoined:Date.now()});
  },
  removeUser: function(userId){
    console.log('removeUser');
    console.log("removing user" + userId);
    Users.remove({userId: userId});
  },
  addSongToPlaylist: function(songId, userId){
    console.log("adding song to playlist");
    Playlists.insert({songId: songId, userId:userId, time:Date.now()});
    Users.update({userId:userId}, {$inc: {playCount: 1}});
  },
  addToChat: function(userName, userId, text){
    Messages.insert({userId: userId, userName:userName, text:text, time:Date.now()});
  },
  selectSong: function(songId){
    console.log("inside select song");
    Songs.update({currentlyPlaying:true}, {$set: {currentlyPlaying:false, timeStarted:0}}); 
    Songs.update({_id: songId}, {$set: {currentlyPlaying:true, timeStarted:Date.now()}});
  }
});
