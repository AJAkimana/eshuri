var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
A course is given by only one teacher and that teacher is set by the Admin of the School
*/
// Le schema de Course
var SchoolCourse =new Schema({
	name:{type:String,required:true,maxlength:300,unique:false,lowercase:true,trim:true},
	school_id:{type: Schema.Types.ObjectId,required:true,unique:false},
  //code:{type:String,required:true,unique:false,lowercase:true,trim:true},  will be like BIO-32412
        /* Useful for the report */
}, { timestamps: {createdAt:'time'}});

SchoolCourse.pre('save', function (next) {
	next();
});
/**
 * This function is called when adding a new course, check if code name or name is already registered
 * in the same classe.. 
 */
SchoolCourse.statics.checkCourseExists = function (course, cb) {
  this.findOne({
  		$and:[
  			{$or:[{'name': course.name.trim().toLowerCase()}]},
  			{'school_id':course.school_id}
  		]
  	},
  	(err,school_course_exists)=>{
    	cb(err,school_course_exists);
  })
  //cb(err, isMatch);
};

const SchoolCourseDB = mongoose.model('SchoolCourses', SchoolCourse);

module.exports = SchoolCourseDB;