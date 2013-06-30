
Meteor.publish("users", function(roomName){
  return Users.find({roomName: roomName});
});


Meteor.setInterval(function(){

  var filter = {};

  // ProTip: unless you need it, don't send lastSeen down as it'll make your 
  // templates constantly re-render (and use bandwidth)
//   var connected =  Meteor.presences.find(filter, {fields: {state: true, userId: true}}).fetch();
  var connected =  Meteor.presences.find(filter, {userId: 1}).fetch();
  var users = Users.find({}, {userId:1}).fetch();

  var d = _.difference(users, connected);

  console.log(connected.length, users.length, d.length);
 
  //i know this is a slow ass search, my appologize 
//  for(var b=0; b<users.length; b++)
 //   for(var a=0; a<connected.length; a++)
  //     console.log(connected[a].userId);
 
//  console.log("users");
 //   console.log("users" + users[b].userId);

  console.log("difference");
  for(var z=0; z<d.length; z++)
    Users.remove({userId: d[z].userId});



//  _.each(difference, function(el){
    //Users.remove({userId: el.userId});
//  });

}, 1000*100);

Meteor.publish('playlists', function(){
  return Playlists.find();
});

Meteor.publish('messages', function(roomName){
  return Messages.find({roomName: roomName});
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
      reputation: 0,
      timeJoined:Date.now()
    });
  },

  appointUser: function(userId, roomName){
    //Set all the current selector users to false
    Users.update({roomName: roomName}, {$set: {canSearch:false}});

    //Set the userid to be the selector
    Users.update({_id: userId, roomName: roomName}, {$set: {canSearch:true}});
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
  addToChat: function(userName, userId, roomName, text){
    Messages.insert({
      userId: userId,
      userName: userName,
      text: text,
      roomName: roomName,
      time:Date.now()
    });
  },
  selectSong: function(songId, userId){
    console.log("selecting song");
    user = Users.findOne(userId, {$inc: {reputation: 1}});

    console.log("inside select song");
    Songs.update({currentlyPlaying:true}, {$set: {currentlyPlaying:false, startTime:0}}); 
    Songs.update({_id: songId}, {$set: {currentlyPlaying:true, startTime:Date.now()}});
  },
  
  setSongStartTime: function(songId){
    Songs.update({_id: songId}, {$set: {startTime:Date.now()}});
  },
  updateRoom: function(selector, modifier) {
    Rooms.update(selector, modifier);
  },
  findOneRoomWithUrl: function(selector) {
    return Rooms.findOne(selector);
  }
});
