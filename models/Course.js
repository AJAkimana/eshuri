var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
A course is given by only one teacher and that teacher is set by the Admin of the School
*/
// Le schema de Course
var CourseSchema =new Schema({
	name:{type:String,required:true,maxlength:300,unique:false,lowercase:true,trim:true},
	code:{type:String,required:true,maxlength:100,unique:false,lowercase:true,trim:true},
	school_id:{type: Schema.Types.ObjectId,required:true,unique:false},
	class_id:{type: Schema.Types.ObjectId,required:true,unique:false},
	teacher_list:{type:[Schema.Types.ObjectId],required:true,unique:false},
	currentTerm:{type:Number,required:true, min:0,unique:false},
  level:{type:Number,required:true, min:0,unique:false},
  isConsidered:{type:Boolean,required:false, default:true, unique:false},
        /* Useful for the report */
  exam_quota:{type:Number,required:false,default:50, unique:false}, // default 50 % of the final marks
  test_quota:{type:Number,required:false,default:50, unique:false}, // default 50 % of the final marks
	attendance_limit:{type:Number,required:true, min:0,unique:false},
  weightOnReport:{type:Number,default:100,required:true,unique:false},
});

CourseSchema.pre('save', function (next) {
  const course = this;
  if(course.exam_quota+course.test_quota!== course.weightOnReport)
    throw "Quotas are not accepted";
	next();
});
/**
 * This function is called when adding a new course, check if code name or name is already registered
 * in the same classe.. 
 */
CourseSchema.statics.checkCourseExists = function (course, cb) {
  this.findOne({
  		$and:[
  			{$or:[{'code': course.code.trim().toLowerCase()}]},
  			{'class_id':course.class_id}
  		]
  	},
  	(err,course_exists)=>{
    	cb(err,course_exists);
  })
  //cb(err, isMatch);
};

const CourseDB = mongoose.model('Courses', CourseSchema);

module.exports = CourseDB;