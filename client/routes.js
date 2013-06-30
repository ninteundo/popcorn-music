Meteor.Router.add({
  '/': 'index',
  '/room/:name': {to: 'room', and: function(name) {
    Session.set('roomName', name);
  }}
});