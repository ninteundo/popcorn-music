var index;

Meteor.startup(function() {
  Meteor.subscribe('songs');
  Meteor.subscribe('messages');
  Meteor.subscribe('rooms');
  Meteor.subscribe('playlists');
  Deps.autorun(function() {
    Meteor.subscribe('users', Session.get('roomName'));
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
    name = $('#roomName').val()
    url = nameToUrl(name);
    if (Rooms.find({
      url: url
    }).count() !== 0) {
      Session.set('nameExists', true);
    } else {
      Rooms.insert({
        name: name,
        url: url
      });
      Meteor.Router.to('/room/' + url);
    }
  },
  'click #joinRoomButton': function() {
    Session.set('nameExists', false);
    Session.set('roomNotExists', false);
    name = $('#roomName').val()
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


Template.getName.events = {};

Template.getName.events[okcancel_events('#userNameInput')] = make_okcancel_handler({
  'ok': function(text, event) {
    Session.set("userName", $("#userNameInput").val());
    Session.set("userId", Meteor.uuid());
    $("#userNameInput").remove(); //.val("Thanks!");

    Meteor.call("addUser",
      Session.get("userName"),
      Session.get("userId"),
      Session.get("roomName"));
  }
});

Template.searchBar.getSongs = function() {
  var text = $('#searchBar').val();

  if (!text || text.length == 0) {
    Session.set('filteredSongs', Songs.find().fetch());
  }

  return Session.get('filteredSongs');
};

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

  'click tr': function(event) {}
});

Template.chat.messages = function() {
  return Messages.find().fetch();
};

Template.chat.events({
  'keydown #chatInput': function(event) {

    if (event.keyCode == 13) {
      var value = $('#chatInput').val();
      Meteor.call('addToChat', Session.get("userName"), Session.get("userId"), value);
      $('#chatInput').val('');
    }
  }
});