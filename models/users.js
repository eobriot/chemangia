var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
   email : String
});

var User = mongoose.model('User', userSchema);

function findOrCreate(email, callback) {
   User.findOne({'email' : email}, function(err, user) {
      if (err) {
         console.log(err);
      }
      if (user == null) {
         user = new User({email : email});

         user.save(function(err, userSaved) {
            if (err) {
               console.log("Error saving new user");
            }
         });
      }
      callback(null, { email : user.email});
   });
};

function serialize(user, done) {
   done(null, user.email);
};

function deserialize(email, done) {
   findOrCreate(email, function(err, user) {
      done(err, user);
   })
};

module.exports = {
   findOrCreate : findOrCreate,
   User : User,
   serialize : serialize,
   deserialize : deserialize
}
