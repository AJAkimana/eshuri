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
	additional_information: {type: String,required:false,unique:false},
	average_school_fees: {type: Number,required:false,unique:false},
	curriculum: {type:Number,required:false, enum:[1,2,3],unique:false},//1.REB, 2. WDA, 3.ANGL
	student_requirements: {type: String,required:false,unique:false},//
	contact: {
		address: {type: String,required:false,unique:false},
		website: {type: String,required:false,unique:false},
		telephone:{type: String,required:false,unique:false},
		postal_code: {type: String,required:false,unique:false}
	},
	stories: {
		success_stories: {type: String,required:false,unique:false},
		icons:{type: String,required:false,unique:false}
	},//success stories
	gallery: {type:[Schema.Types.Mixed],required:false,unique:false,default:[]},//photos: link & description
	other_programs: { type:String,required:false,unique:false},//like basket, rugby
	// combinations: {type:String,required:false,unique:false},//meg, pcm,...
	years: {type:Number,required:false,unique:false},
	fees: {type:Array, required:false,unique:false}