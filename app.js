
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , passport = require ('passport')
  , googleStrategy = require('passport-google-oauth').Strategy
  , yandexStrategy = require('passport-yandex').Strategy
  , mongoose = require('mongoose')
  , User = require('./models/users');

var app = express();


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: '3 petits chatons font font font' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('PORT',3000);
  app.set("dburl", "mongodb://localhost/chemangia");
   app.set("appurl","http://localhost:3000");
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

//Various init
mongoose.connect(app.get('dburl'));

passport.serializeUser(User.serialize);
passport.deserializeUser(User.deserialize);
// Google authentication
passport.use(new googleStrategy({
   callbackURL: app.get("appurl") +'/auth/google/return',
   consumerKey : "514098463016.apps.googleusercontent.com" ,
   consumerSecret : "v3cRHMTgsnRjrGpafoSGerg1"
},
function(accessToken, refreshToken, profile, done) {
   process.nextTick(function() {
      return User.deserialize(profile.id, done);
   });
}
));
// Yandex authentication
passport.use(new yandexStrategy({
   clientID : "72a2703dde4f4ccc8142a8468d21ae40",
   clientSecret : "0a44c0348ccb469d8c27193aef84eb6d",
   callbackURL : app.get("appurl") + "/auth/yandex/return"
},
function(token, tokenSecret, profile, done) {
   process.nextTick(function() {
      console.log(profile);
      var mail = profile.emails[0].value;
      return User.deserialize(mail, done);
   });
}
));
// Routes

app.get('/', routes.index);
app.get('/secret', ensureAuthenticated, routes.secret);
// Google authentication
app.get('/auth/google', 
      passport.authenticate('google',
         { scope: 'https://www.google.com/m8/feeds https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'},
         function(req,res) {}));
app.get('/auth/google/return', 
      passport.authenticate('google', 
         { successRedirect: '/',
         failureRedirect: '/login' }));
//Yandex authentication
app.get('/auth/yandex', 
      passport.authenticate('yandex',
         function(req,res) {}));
app.get('/auth/yandex/return', 
      passport.authenticate('yandex', 
         { successRedirect: '/',
         failureRedirect: '/login' }));


app.get('/logout', function(req, res){
     req.logout();
     res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
     if (req.isAuthenticated()) { return next(); }
       res.redirect('/login');
}

app.listen(app.get("PORT"));
console.log("Express server listening on port %d in %s mode", app.get("PORT"), app.settings.env);
