var index; //should give this a better name
audioPlayer = new Audio();

Meteor.startup(function() {
  Meteor.subscribe('songs');
  Meteor.subscribe('rooms');
  Meteor.subscribe('playlists');

  var playingSong = Songs.find({currentlyPlaying:true}).fetch();
  if(playingSong.length > 0){
  }
    

  
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
    //Song
    var playingSong = Songs.find({currentlyPlaying: true}).fetch();

    if(playingSong.length > 0){
      console.log("length more then 0");
      var playingSong = playingSong[0];

        //If the player has a source
        if(audioPlayer.src === ""){

          console.log("src empty");
          console.log("playingSong start time" + playingSong.startTime);
          Meteor.call("updateSongStartTime", playingSong.songId);

          //if the song has already started but we arent listening to it
          if(playingSong.startTime > 0){

            console.log("syncing to currently playing song");
            audioPlayer.src = playingSong.url;
            audioPlayer.load();

            console.log(playingSong.startTime);

            var offset = (Date.now() - playingSong.startTime)/1000;
            offset = Math.round(offset*10)/10; //round to the nears 10ths place
            console.log("offset after round" + offset);
            console.log("duration" + audioPlayer.duration);

            //if the song has played past the duration and for some reason the ended event wasnt called 
            
            if(offset > audioPlayer.duration){
              console.log("song has played past the duration");
              audioPlayer.src = playingSong.url;
              audioPlayer.play();
            }
            $(audioPlayer).bind('canplay', function() {
              console.log('inside bind');
                audioPlayer.currentTime = offset; // jumps to 29th secs
                audioPlayer.play()
            });

            audioPlayer.canplay = function(){
              console.log("inside on can play through");
              audioPlayer.currentTime = offset;
              audioPlayer.play();
            };
          }
          //if the song has not started and the player doesn't have a source
          else{
            console.log("start time undefined");
            audioPlayer.src = playingSong.url;
            audioPlayer.play();
          }
        }
        // if the player does have a source (something is loaded and playing or done playing)
        else{
          //if the current song has ended
          if(audioPlayer.duration === audioPlayer.currentTime || audioPlayer.currentTime === 0){
            console.log("current song ended");
            audioPlayer.src = playingSong.url;
            audioPlayer.play();
          }
          else{
            //if the current song is playing and we are listening to it
            console.log("creating event listener");
            audioPlayer.addEventListener("ended",  function(){
              console.log("song ended");
              audioPlayer.src = playingSong.url;
              audioPlayer.play();
             });
          }
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
    Session.set('nameExists', false);
    Session.set('roomNotExists', false);
    var name = $('#roomName').val();
    url = nameToUrl(name);
    if (Rooms.find({
      url: url
    }).count() !== 0) {
      Session.set('nameExists', true);
    } else {
      Rooms.insert({
        name: name,
        url: url,
        currPlayer: Session.get("userId")
      });
      Meteor.Router.to('/room/' + url);
    }
  },
  'click #joinRoomButton': function() {
    Session.set('nameExists', false);
    Session.set('roomNotExists', false);
    var name = $('#roomName').val();
    url = nameToUrl(name);
    if (Rooms.find({
      url: url
    }).count() !== 0) {
      Meteor.Router.to('/room/' + url);
    } else {
      Session.set('roomNotExists', true);
    }
  }
});

//Name
Template.getName.events = {};

Template.getName.events[okcancel_events('#userNameInput')] = make_okcancel_handler({
  'ok': function(text, event) {
    Session.set("userName", $("#userNameInput").val());
    Session.set("userId", Meteor.uuid());
    $("#userNameInput").remove(); //.val("Thanks!");

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
    room = Rooms.findOne({roomName: Session.get('roomName')});
    if (Session.get('userId') === room.currentPlayerId) {
      Meteor.call('selectSong', id, Session.get('userId'));
      Session.set('nextSong', id);
    }
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

