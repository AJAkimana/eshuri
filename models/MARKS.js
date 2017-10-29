var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
Cette table contient les points recus par les etudiants. ;)
*/
// Le schema de Marks
var MarksSchema = new Schema({
		/* if the content is already corrected or not !! */
	isCorrected:{type:Boolean,required:false,default:false, unique:false},
	isCAT:{type:Boolean,required:false,default:true, unique:false},
	isQuoted:{type:Boolean,required:false,default:true, unique:false},
	
	content_type:{type:Number,required:true, enum:[3,4,5],unique:false},
	content_id:{type:Schema.Types.ObjectId,required:true,unique:false},	
	teacher_id:{type:Schema.Types.ObjectId,required:true,unique:false},
	student_id:{type:Schema.Types.ObjectId,required:true,unique:false},
	student_URN:{type:String,required:true,unique:false},

	marks:{type:Number,required:true, min:0,unique:false},	
	percentage:{type:Number,required:true, min:0,max:100,unique:false},	
	school_id:{type:Schema.Types.ObjectId,required:true,unique:false},
	course_id:{type:Schema.Types.ObjectId,required:true,unique:false},
		// I add the course_name to avoid many request in the DB for REPOTRS
	course_name:{type:String,required:true,unique:false}, 
	class_id:{type:Schema.Types.ObjectId,required:true,unique:false},

	currentTerm:{type:Number,required:true, min:1,unique:false},
	level:{type:Number,required:true, min:1,unique:false},
				/*OPTIONAL*/
	uploaded_file:{type:String,required:false,index:false,unique:false}, // HERE NO INDEXATION
	uploaded_text:{type:String,required:false,index:false,unique:false}, // HERE NO INDEXATION
	uploaded_array:{type:Array,required:false,index:false,unique:false}, // HERE NO INDEXATION
	comment:{type:String,required:false,maxlenght:140, index:false, unique:false}, // HERE NO INDEXATION
			/* COMPUTED AUTOMATICALLY AT SAVING*/
	academic_year:{type:Number,required:false, min:17,unique:false},

}, { timestamps: { createdAt: 'upload_time' }});

MarksSchema.pre('save', function (next) {
	next();
});

const MarksDB = mongoose.model('Marks', MarksSchema);

module.exports = MarksDB;