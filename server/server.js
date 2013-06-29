Meteor.publish("users", function(){
  return Users.find();
});

Meteor.methods({
  addUser: function(userName, userId){
    console.log("adding user");
    Users.insert({userName: userName, userId: userId});
  }
});
