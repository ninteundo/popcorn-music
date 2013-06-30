Meteor.Router.add({
  '/': 'index',
  '/room/:url': {to: 'room', and: function(url) {
    // Directly go to this room won't work because
    // Rooms is not loaded yet
    var room = Rooms.findOne({url: url});
    Session.set('roomName', room.name);
  }}
});