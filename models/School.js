var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
Collection of schools that are registered
Category : 1. All 2. Internals 2. Externals
Gender :   
*/
// Le schema de School
var SchoolSchema = new Schema({
	name:{type:String,required:true,maxlength:100,unique:true,lowercase:true,trim:true},
	cover_photo:{type:String,required:true,maxlength:1000,unique:false},
	description:{type:String,required:true,maxlength:140,unique:false,lowercase:true,trim:true},
	admin_mail:{type:String,required :false, match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/ ,unique:false,lowercase:true,trim:true},
	term_name:{type:String,required:true, enum:['S','T'],unique:false,uppercase:true,trim:true},
	term_quantity:{type:Number,required:true, min:0 ,unique:false},
	retake_marks:{type:Number,required:true, min:0,max:100 ,unique:false},
	department_id:{type: Schema.Types.ObjectId,required:false,unique:false},// Only used when School is a Option

	// Complementary informations
	district_name:{type:String,required:true,maxlength:50,unique:false,lowercase:true,trim:true},
	po_box:{type:String,required:false,maxlength:50,unique:false,lowercase:true,trim:true},
	phone_number:{type:String,required:false,maxlength:20,unique:false,lowercase:true,trim:true},
	genderness:{type:Number,required:true, enum:[1,2,3],unique:false}, //1. Mixted 2. Boys 3.Girls
	category:{type:Number,required:true, enum:[1,2,3],unique:false},//1. All 2. Internals 3. Externals
	partnership:{type:Number,required:true, enum:[1,2,3],unique:false},//1. Private 2. Public 3. Public-Private
	institution:{type:Number,required:true, enum:[1,2,3,4],unique:false},//1. Option 2. High school 3. Primary 4.Infant school
	// isInternational:{type:Boolean,required:false,default:false, unique:false}, // If the school is located in other countries
});

SchoolSchema.pre('save', function (next) {
	next();
});
/**
 * This function is called when adding a new school, check if code name or name is already registered
 * in the same classe.. 
 */
SchoolSchema.statics.checkSchoolExists = function (school, cb) {
	this.findOne({'name':school.name},(err,school_exists)=>{
	    cb(err,school_exists);
	})
};

const SchoolDB = mongoose.model('Schools', SchoolSchema);

module.exports = SchoolDB;