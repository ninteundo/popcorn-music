Meteor.startup(function() {
  Meteor.subscribe('users');
  Meteor.subscribe('songs');
  Deps.autorun(function() {
    if (Songs.find().count() > 0) {
      var index = lunr(function() {
        this.field('title', {boost: 10});
        this.ref('id');
      });

      songs = Songs.find().fetch()
      for (i in songs) {
        song = {};
        song['id'] = i;
        song['title'] = songs[i]['title'];
        console.log(song);
        index.add(song);
      }

      console.log(index);
      console.log(index.search('Run'));
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
