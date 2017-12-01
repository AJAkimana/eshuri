const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FbStrategy = require('passport-facebook').Strategy;
// load up the user model
const User = require('../models/User');

var ConfigAuth = require('./auth');
module.exports = function(passport) {

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  }); 

//____________________Local login_________________//
passport.use('local.signin', new LocalStrategy(
  {
    usernameField: 'email', 
    passwordField: 'password',
    passReqToCallback: true
  }
  ,(req, email, password, done) => {
  User.findOne({ email: email.toLowerCase().trim() }, (err, user) => {    
    if(err) return done(err, false, { msg: 'Service not available.' });
    else if (!user) return done(null, false, { msg: 'Invalid email or password.' });
    user.comparePassword(password,email, (err, isMatch) => {
      // if(!user.isValidated) return done(null, false, { msg: 'Please validate your account first. No email received ?\n Resend validation code' });
      if(!user.isEnabled) return done(null, false, { msg: 'Please wait for your account validation' });
      else if (isMatch)return done(null, user);
      return done(null, false, { msg: 'Invalid email or password'});
    });
  });
}));
/**
 * Sign up using Email and Password.  New Account
 */
 //Check: https://goo.gl/zzuMVv
passport.use('local.signup', new LocalStrategy(
  { 
    usernameField: 'email', 
    passwordField: 'password',
    passReqToCallback: true
  },(req, email, password, done) => {
    email = req.body.email.toLowerCase().trim();
    name=req.body.name.toLowerCase().trim();
    URN =req.body.URN.toLowerCase().trim();
    User
      .aggregate([
        { $match:{email:email} },
        { $group:{_id:{email:"$email"}}},
        { $limit:1}
      ],function(err, resultats){
        if(err) return done(err, false, { msg: 'Service not available' });
        else if(resultats.length > 0 && resultats[0]._id.email==email)
          return done(null, false, { msg: 'This email is already registered' });
          // We get the access level to be sure HE is not SUPER ADMIN haha
        // Remember SUper admin and admins dont create themeselves their accounts, they 
        // register as teachers
        var type =Number(req.body.type)+2;
        if(type <=2) return done(null, false, { msg: 'You are not authorized to do this..'});
        else if(type > 5) return done(null, false, { msg: 'You are not authorized to do this' });

        var access_level=100; 
        var isEnabled=false;
        // PEople that are permitted to register by themselves
        switch(type){
          case 3: access_level=req.app.locals.access_level.TEACHER;break;
          case 4: access_level=req.app.locals.access_level.STUDENT;break;
            // if it is a parent he is Enabled by default 
          case 5: access_level=req.app.locals.access_level.PARENT;isEnabled=true;break;
          default:break;
        }  
        if(access_level==100)
            return done(null, false, { msg: 'You are not authorized to do this' });
        var newUser = new User({
          name:req.body.name,
          email: email,
          URN: URN,
          password: password,
          school_id:req.body.school_id,
          department_id:req.body.department_id,
          phone_number:req.body.phone_number,
          access_level:access_level,
          gender:req.body.gender,
          isEnabled:isEnabled,
          class_id:req.body.class_id
        });

        newUser.save(function(err){
          return done(err,newUser);
        })
          
      });
  }));

//_____________________Google login______//
passport.use('google', new GoogleStrategy({
  clientID:ConfigAuth.googleAuth.clientID,
  clientSecret:ConfigAuth.googleAuth.clientSecret,
  callbackURL:ConfigAuth.googleAuth.callbackURL,
},(token, refreshToken, profile, done)=>{
  process.nextTick(function(){
    User.findOne({email:profile.emails[0].value},function(err, user){
      if(err) return done(null, false, { msg: 'Service not available.' });
      else if(!user) return done(null, false, { msg: 'This email is not registered' });
      else if(!user.isEnabled) return done(null, false, { msg: 'Please wait for your account validation' });
      else if (user)return done(null, user);
      return done(null, false, { msg: 'Service not available.'});
    });
  });
}));
passport.use(new FbStrategy({
  clientID:ConfigAuth.facebookAuth.clientID,
  clientSecret:ConfigAuth.facebookAuth.clientSecret,
  callbackURL:ConfigAuth.facebookAuth.callbackURL,
},(token, refreshToken, profile, done)=>{
  process.nextTick(()=>{
    User.findOne({email:profile.emails[0].value},(err, user)=>{
      if(err) return done(err, false, { msg: 'Service not available.' });
      else if(!user) return done(null, false, { msg: 'This email is not registered' });
      else if(!user.isEnabled) return done(null, false, { msg: 'Please wait for your account validation' });
      else if (user)return done(null, user);
      return done(null, false, { msg: 'Service not available.'});
    })
  })
}))
};
