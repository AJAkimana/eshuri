var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
A program is given by only one teacher and that teacher is set by the Admin of the School
*/
// Le schema de Course
var SchoolProgram =new Schema({
  abbreviation:{type:String,required:false,maxlength:300,unique:false,lowercase:true,trim:true}, //like MEG
	name:{type:String,required:true,maxlength:300,unique:false,lowercase:true,trim:true}, //like Mathematics Economics, Geography
	school_id:{type: Schema.Types.ObjectId,required:true,unique:false},
}, { timestamps: {createdAt:'time'}});

SchoolProgram.pre('save', function (next) {
	next();
});
/**
 * This function is called when adding a new program, check if code name or name is already registered
 * in the same classe.. 
 */
SchoolProgram.statics.checkProgramExists = function (program, cb) {
  this.findOne({
  		$and:[
  			{$or:[{'name': program.name.trim().toLowerCase()},{'abbreviation':program.abbreviation}]},
  			{'school_id':program.school_id}
  		]
  	},
  	(err,school_program_exists)=>{
    	cb(err,school_program_exists);
  })
  //cb(err, isMatch);
};

const SchoolProgramDB = mongoose.model('SchoolPrograms', SchoolProgram);

module.exports = SchoolProgramDB;