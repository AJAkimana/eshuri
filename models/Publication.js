var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
Publications area made by all persons in a school
*/
// Le schma de Publications
//category
/*
1: For all school
2: For administration
*/
var PublicationsSchema = new Schema({
	user_id:{type:Schema.Types.ObjectId,required:true,unique:false},
	user_name:{type:String,required:true,unique:false,index:false},
	content:{type:String,required:true,unique:false,index:false,trim:true},
	likes:{type:[String],required:false,default:0,unique:false},
	comments:{type:[Schema.Types.Mixed],required:false,default:[],unique:false},
	class_id:{type: Schema.Types.ObjectId,required:false,unique:false},
	school_id:{type: Schema.Types.ObjectId,required:true,unique:false},
	isAuto:{type:Boolean,required:true},
	category:{type:String, default:1, unique:false},
	tags:{type:[String],required:false,default:[],unique:false},
	
}, { timestamps: {createdAt:'time'}});

PublicationsSchema.pre('save', function (next) {
	next();
});

const PublicationsDB = mongoose.model('Publications', PublicationsSchema);

module.exports = PublicationsDB;