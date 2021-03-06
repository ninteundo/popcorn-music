var index; //should give this a better name
audioPlayer = new Audio();

var wrapUp = function(){
  console.log('warp');
      var room = Rooms.findOne({name: Session.get("roomName")});

      var currPlayer = room.currPlayer;

      console.log('curplayer', currPlayer);
      console.log("session id", Session.get("userId"));
      //if were the current player then add an event listener to the end of the song
      if(room.currPlayer === Session.get("userId")){
        audioPlayer.addEventListener("ended",  function(){
         console.log("song ended");
         Meteor.call("startNextSong", Session.get("roomName"));
       });
      }
    };
var playSong = function(songId){
  console.log("songid" + songId);

  var playingSong = Songs.find(songId).fetch()[0];
  if(playingSong){


         console.log('valid');

           //if the song has already started but we arent listening to it
/*           if(playingSong.startTime > 0){
             console.log("start time set syncing");
             audioPlayer.src = playingSong.url;
             audioPlayer.load();

             console.log(playingSong.startTime);

             var offset = (Date.now() - playingSong.startTime)/1000;
             offset = Math.round(offset*10)/10; //round to the nears 10ths place

             console.log("offset");
            
             $(audioPlayer).bind('canplay', function() {
                 audioPlayer.currentTime = offset; // jumps to 29th secs
                 audioPlayer.play();
             });

           //if the song has not started and the player doesn't have a source
           } 
           else{*/
             console.log("in else");
             console.log(playingSong);
             audioPlayer.src = playingSong.url;
             audioPlayer.play();
          // }
             //
             wrapUp();
            }
};

Meteor.startup(function() {
  Meteor.subscribe('songs');
  Meteor.subscribe('rooms');
  Meteor.subscribe('playlists');
  Meteor.subscribe('alerts');

  Meteor.autosubscribe(function() {
    Alerts.find().observe({
      added: function(item){
        console.log(item);
      }
    });
  });

  //Plays a song if first user and no song is playing
  Deps.autorun(function(){
    var nextSong = Session.get('nextSong');
    var room = Rooms.findOne({name: Session.get("roomName")});

    if(!room)
      return;

    if(!room.currPlayer && nextSong){
      console.log('no currPlayer, playing new song');
      Meteor.call('updateRoom', {name: room.name}, {$set: {currPlayer: Session.get('userId')}},
        function(){        playSong(nextSong);}
                 );
    }

    Session.set('alert', '');

  });

  //nextPlayer selected
  Deps.autorun(function(){
    var nextPlayer = Session.get('nextPlayer');
    console.log(nextPlayer);

    Session.set('alert', '');
  });

  //for search
  Deps.autorun(function() {
    Meteor.subscribe('users', Session.get('roomName'));
    Meteor.subscribe('messages', Session.get('roomName'));
    if (Songs.find().count() > 0) {
      index = lunr(function() {
        this.field('title', {
          boost: 10
        });
        this.field('album', {
          boost: 10
        });
        this.ref('_id');
      });

      songs = Songs.find().fetch();
      for (var i in songs) {
        song = {};
        song['_id'] = songs[i]['_id'];
        song['title'] = songs[i]['title'];
        index.add(song);
      }
    }
  });

  Deps.autorun(function(){
    var room = Rooms.findOne({name: Session.get("roomName")});

    //HACK
    if(!room)
      return;
      
    if(Session.get("userId")===room.currPlayer && Session.get("nextSong")){
      
      Meteor.call("updateSong", Session.get("nextSong"), Session.get("roomName"));
//      playSong(room.currSong);
   
    }else{
      Session.set('alert', 'Select a song.');
    }

    console.log(room);

  });

  Deps.autorun(function(){
    var room = Rooms.findOne({name: Session.get("roomName")});
    if(room){
      console.log(room);
    var song = Songs.findOne({songId:room.currSong});
    if(song){
                             
      if(audioPlayer.src != song.location)
       playSong(song.id);
      }
    }
  });

});

// Define some handlers
var okcancel_events = function(selector) {
  return 'keyup ' + selector + ', keydown ' + selector + ', focusout ' + selector;
};

// Creates an event handler for interpreting "escape", "return", and "blur"
// on a text field and calling "ok" or "cancel" callbacks.
var make_okcancel_handler = function(options) {
  var ok = options.ok || function() {};
  var cancel = options.cancel || function() {};

  return function(evt) {
    if (evt.type === "keydown" && evt.which === 27) {
      // escape = cancel
      cancel.call(this, evt);
    } else if (evt.type === "keyup" && evt.which === 13) {
      // blur/return/enter = ok/submit if non-empty
      var value = String(evt.target.value || "");
      if (value)
        ok.call(this, value, evt);
      else
        cancel.call(this, evt);
    }
  };
};

function nameToUrl(name) {
  return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

Template.index.nameExists = function() {
  return Session.get('nameExists');
};

Template.index.roomNotExists = function() {
  return Session.get('roomNotExists');
};

Template.index.events({
  'click #newRoomButton': function() {
    var name = $('#roomName').val();
    var url = nameToUrl(name);
    // if (Rooms.find({
    //   url: url
    // }).count() !== 0) {
    //   Session.set('nameExists', true);
    // } else {
    //   Rooms.insert({
    //     name: name,
    //     url: url,
    //     currPlayer: Session.get("userId")
    //   });
Session.set('roomName', url);
      Meteor.Router.to('/room/' + url);
  }
});

//Name
Template.getName.events = {};

Template.getName.events[okcancel_events('#userNameInput')] = make_okcancel_handler({
  'ok': function(text, event) {
    console.log("inside ok function");

    Session.set("userName", $("#userNameInput").val());
    Session.set("userId", Meteor.uuid());
    $("#userNameInput").remove(); 

    // If there is no player in the room, set this player as the
    // current player
    if (Users.find({roomName: Session.get('roomName')}).count() == 0) {
      Meteor.call('updateRoom', {name: Session.get('roomName')},
        {$set: {currentPlayerId: Session.get('userId')}});
    }

    Meteor.call("addUser",
      Session.get("userName"),
      Session.get("userId"),
      Session.get("roomName"));
  }
});



//Search
Template.searchBar.getSongs = function(){
  var text = $('#searchBar').val();

  if (!text || text.length == 0) {
    Session.set('filteredSongs', Songs.find().fetch());
  }

  return Session.get('filteredSongs');
};

Template.song.isCurrentSong = function(){
  if(this._id === Session.get('nextSong')){
    return 'highlight';
  }
  return '';
};

//Toolbar
Template.toolbar.allowedToPick = function(){
  var x = Users.find({userId: Session.get("userId")}, {canSearch:1});
  
  return (x && x.canSearch);
};

Template.toolbar.alertContent = function(){
  return Session.get('alert');
};

Template.toolbar.alert = function(){
  var message = Session.get('alert');
  if(message && message.length > 0){
    return true;
  }else{
    return false;
  }
};

Template.toolbar.nameNotSet = function(){
  var message = Session.get('userId');
  if(message && message.length > 0){
    return false;
  }else{
    return true;
  }
};

Template.toolbar.events({
  'click #removeAlert': function(event){
    Session.set('alert', '');
  }
});

Template.searchBar.events({
  'keyup': function(event) {
    var text = $('#searchBar').val();

    if (!text || text.length == 0) {
      Session.set('filteredSongs', Songs.find().fetch());
      return;
    }

    results = index.search(text);
    displays = [];
    for (var i in results) {
      id = results[i].ref;
      song = Songs.findOne({
        _id: id
      });
      displays.push(song);
    }
    console.log('display', displays);
    Session.set('filteredSongs', displays);
  },

  'click tr': function(event){
    var id = this._id;
    Session.set('nextSong', id);
  }
});

Template.chat.messages = function() {
  return Messages.find().fetch();
};

Template.chat.events({
  'keydown #chatInput': function(event) {

    if (event.keyCode == 13) {
      var value = $('#chatInput').val();
      Meteor.call('addToChat',
        Session.get("userName"),
        Session.get("userId"),
        Session.get('roomName'),
        value);
      $('#chatInput').val('');
    }
  }
});

