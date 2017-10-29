var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
Quizzes, tests, assessments and assignements belongs to a Unit
*/
// Le schma de Unit
var UnitSchema =new Schema({
	title:{type:String,required:true,maxlength:100,unique:false,lowercase:true,trim:true},
	description:{type:String,required:true,maxlength:140,unique:false,lowercase:true,trim:true},
	course_id:{type: Schema.Types.ObjectId,required:true,unique:false},
});

UnitSchema.pre('save', function (next) {
	next();
});
/**
 * This function is called when adding a new course, check if code name or name is already registered
 * in the same classe.. 
 */
UnitSchema.statics.checkExistence = function (unit, cb) {
	this.findOne({title:unit.title,course_id:unit.course_id},(err,unit_exists)=>{
		cb(err,unit_exists);
	})
};
const UnitDB = mongoose.model('Units', UnitSchema);
module.exports = UnitDB;