var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
A nice collection, nice Job lionel
*/
  /*  CONTENT Type possible
  1: Written note
  2: Note ( PDF)
  3: Automated assessment
  4: Written assessment
  5: Uploaded assessment
  6: Offline tests
  */
// Le schema de Content,  // HERE NO INDEXATION for source_question 
var ContentSchema = new Schema({
			/*MANDATORY ATTRIBUTES*/
	title:{type:String,required:true,maxlength:300, unique:false,lowercase:true,trim:true},
	source_question:{type:String,index:false,required:true,unique:false,index:false}, // HERE NO INDEXATION
	course_id:{type:Schema.Types.ObjectId,required:true,unique:false},
	school_id:{type: Schema.Types.ObjectId,required:true,unique:false},
	unit_id:{type: Schema.Types.ObjectId,required:true,unique:false},
	owner_URN:{type:String,required:true,maxlength:30,unique:false},
	type:{type:Number,required:true, enum:[1,2,3,4,5,6],unique:false},
	currentTerm:{type:Number,required:true,unique:false},

			/*  NOT MANDATORY*/
	q_info:{type:Array,required:false,unique:false},///here will put for Automated and written
	q_solution:{type:Array,required:false,unique:false}, // here question answers
	time:{type:Date,required:false,unique:false},
				/*Useful for  generating the report */
	isCAT:{type:Boolean,required:false,default:true, unique:false},
	isQuoted:{type:Boolean,required:false,default:true, unique:false}, // all tests quoted by default
	
	// code_md:{type:String,required:false,unique:false},
	isPublished:{type:Boolean,required:false,default:false, unique:false},
	marks:{type:Number,required:false, min:0,unique:false},
			/* COMPUTED AUTOMATICALLY AT SAVING*/
	academic_year:{type:Number,required:false,unique:false},
	// counter cheating measures!
	setNoCheating:{type:Boolean,required:false,default:false, unique:false},
}, { timestamps: { createdAt: 'upload_time' }});

ContentSchema.pre('save', function (next) {
	next();
});

const ContentDB = mongoose.model('Contents', ContentSchema);

module.exports = ContentDB;