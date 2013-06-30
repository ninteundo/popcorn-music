Meteor.publish("users", function(roomName){
  return Users.find({roomName: roomName});
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

Meteor.publish('rooms', function() {
  return Rooms.find();
});

Meteor.methods({
  addUser: function(userName, userId, roomName){
    console.log("adding user");
    Users.insert({
      userName: userName,
      userId: userId,
      roomName: roomName,
      playCount:0,
      timeJoined:Date.now()
    });
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
