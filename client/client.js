var index;

Meteor.startup(function() {
  Meteor.subscribe('users');
<<<<<<< HEAD
  Meteor.subscribe('playlist');
});
=======
  Meteor.subscribe('songs');
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
        console.log(song);
        index.add(song);
      }
>>>>>>> fc311e2d005917722948dc6499b04e8507809336

      console.log(index);
      console.log(index.search('C'));
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


Template.getName.events = {};

Template.getName.events[okcancel_events('#userNameInput')] = make_okcancel_handler({
  'ok': function(text, event) {
    Session.set("userName", $("#userNameInput").val());
    Session.set("userId", Meteor.uuid());
    $("#userNameInput").remove();//.val("Thanks!");

    Meteor.call("addUser", Session.get("userName"), Session.get("userId"));
  }
});

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
