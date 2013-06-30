Meteor.Router.add({
  '/': 'index',
  '/room/:url': {to: 'room', and: function(url) {
      Session.set('roomName', url);
      Meteor.call('createRoom', url, Session.get("userId"));
  }}
});
