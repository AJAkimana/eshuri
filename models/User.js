const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const saltRounds=10; //(rounds=10: ~10 hashes/sec) [https://goo.gl/aK7A0t]
var Schema =mongoose.Schema;
  /*  ACCESS_LEVELS possible
  1: SuperAdmin
  1.1: SA_ADMIN
  2: Admin
  3: Teacher
  4: Student
  5: Parent
  */
var UserSchema = new Schema({
  name:{type:String,required:true,maxlength:100,trim:true, uppercase:true,unique:false},
  email:{type:String,required :true, match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/ ,unique:false,lowercase:true,trim:true},
  URN:{type:String,required:true,unique:false,lowercase:true,trim:true}, // will be like ABC-32412
  password:{type:String,required:false,maxlength:100,unique:false},
  gender:{type:Number,default:4, enum:[1,2],unique:false},
  phone_number:{type:String,required:false,unique:false},
  class_id:{type: Schema.Types.ObjectId,required:false,unique:false},
  prev_classes:{type:[Schema.Types.ObjectId],required:false,unique:false},
  school_id:{type: Schema.Types.ObjectId,required:false,unique:false},

  department_id:{type: Schema.Types.ObjectId,required:false,unique:false},
  // faculty_id:{type: Schema.Types.ObjectId,required:false,unique:false},
  // For application to admission
  marital_status: {type:String,required:false,unique:false},

    // Address Information    
  address:{
    province: {type:String,required:false,unique:false},
    district: {type:String,required:false,unique:false},
    sector: {type:String,required:false,unique:false},
  },
  // Guardian Information
  guardian:{
    name:{type:String,required:false,unique:false},
    phone:{type:String,required:false,unique:false},
    email:{type:String,required:false,unique:false},
  },
  // Programs Information
  past_info:{
    prev_school: {type:String,required:false,unique:false},
    prev_combination: {type:String, require:false,unique:false},
    grade: {type:Number,required:false, min:0,unique:false},
  },
  finance_category: {type:String,required:false,unique:false},
  // Documents Information
  documents: {
    id_card:{type:String,required:false,unique:false},
    transcipt:{type:String,required:false,unique:false}
  },

  access_level:{type:Number,default:4, enum:[1,2,3,4],unique:false},
  // When you are not yet confirmed or someone has diasbled you
  isEnabled:{type:Boolean,required:false, default:false, unique:false},
  isValidated:{type:Boolean,required:false, default:false, unique:false},
  course_retake:{type:[String], require:false,unique:false},
  profile_pic:{type:String,required:false,unique:false},
  hasPaid:{type:Boolean,required:false, default:true, unique:false},
  lastSeen:{type:Date,required:false,unique:false},
  /* source :http://stackoverflow.com/a/18148872/5680107
    As favouriteFoods is a simple array of strings, you can just query that field directly:

    PersonModel.find({ favouriteFoods: "sushi" }, ...);
    But I'd also recommend making the string array explicit in your schema:

    person = {
        name : String,
        favouriteFoods : [String]
    }
  */
}, { timestamps: { createdAt: 'created_at' }});
/**
 * Password hash middleware.
 */
UserSchema.pre('save', function (next) {
  const user = this
  // user.email = user.email.trim().toLowerCase();//sanitize email
  // user.URN = user.URN.trim().toLowerCase();
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  // Let's call a function that hash the password properly  
  user.hash_password(user.password,user.email, (err,hashed_password)=>{
    user.password = hashed_password;
    next();
  });
});
/**
 * Helper method for validating user's password.
 */
UserSchema.methods.comparePassword = function (candidatePassword,email, cb) {
  bcrypt.compare(candidatePassword+email.toLowerCase().trim(), this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};
/*
    HASH THE PASSWORD
*/
UserSchema.methods.hash_password = function (candidatePassword,email, cb) {
  let salt =process.env.PASS_SALT;
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(candidatePassword+(email.toLowerCase()), salt,null, function(err, hash) {
        cb(err,hash);
    });
  });
};
const User = mongoose.model('User', UserSchema);
module.exports = User;
