var index; //should give this a better name
var audioPlayer;


Meteor.startup(function() {
  Meteor.subscribe('users');
  Meteor.subscribe('songs');

  //Check if theres a song playing and if there is start playing at the same position 
  var currSong = Songs.findOne({playing:true}); // add room id here
  if(currSong != null){
    audioPlayer = new Audio(currSong.location);
    
    var offset = (Date.now() - currSong.startTime)/1000;
    
    audioPlayer.currentTime = offset;
    audioPlayer.play();
  }

  Deps.autorun(function() {
    if (Songs.find().count() > 0) {
      index = lunr(function() {
        this.field('title', {boost: 10});
        this.ref('_id');
      });

      songs = Songs.find().fetch()
      for (i in songs) {
        song = {};
        song['_id'] = songs[i]['_id'];
        song['title'] = songs[i]['title'];
        index.add(song);
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

//Name
Template.getName.events = {};

Template.getName.events[okcancel_events('#userNameInput')] = make_okcancel_handler({
  'ok': function(text, event) {
    Session.set("userName", $("#userNameInput").val());
    Session.set("userId", Meteor.uuid());
    $("#userNameInput").remove();//.val("Thanks!");

    Meteor.call("addUser", Session.get("userName"), Session.get("userId"));
  }
});

//Search
Template.searchBar.events({
  'keyup': function(event) {
    text = $('#searchBar').val();
    results = index.search(text);
    displays = []
    for (i in results) {
      id = results[i].ref
      song = Songs.findOne({_id: id})
      displays.push(song['title'] + ' -- ' + song['artist']);
    }
    $("#searchBar").autocomplete({
      source: displays
    });
  }
});

//Song
Template.song = function(){
  var currSongFromDb = Songs.find({currentlyPlaying: true});
  var currSongFromSessionId  = Session.get("currentSong");

  if(currSongFromDb.songId != currSongFromSessionId){

    Session.set("currentSong", currSongFromDb.songId);
    audioPlayer = new Audio(currentSongFromDb.location);
    audioPlayer.play();

  }

  return currSongFromDb;
};
