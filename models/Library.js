var mongoose =require('mongoose');
var Schema =mongoose.Schema;

var LibrarySchema = new Schema({
			/*MANDATORY ATTRIBUTES*/
	title:{type:String,required:true,maxlength:300, unique:false,lowercase:true},
	author:{type:String,required:true,maxlength:20,unique:false,lowercase:true},
	description:{type:String,required:true,unique:false},
	image:{type:String,unique:false},
	bookName:{type:String,required:true,unique:false},
	type:{type:Number,required:true, enum:[1,2],unique:false},
	level:{type:Number,required:true,enum:[1,2],unique:false},
	school_id:{type: Schema.Types.ObjectId,required:true,unique:false},

}, { timestamps: { createdAt: 'upload_time' }});

LibrarySchema.pre('save', function (next) {
	next();
});

const LibraryDB = mongoose.model('libraries', LibrarySchema);

module.exports = LibraryDB;