var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
Une Parenting represent une relation entre parent et student..
*/
// Le schma de Parenting
var ParentingSchema = new Schema({
	parent_URN:{type:String,required:true,lowercase:true,trim:true},
	student_URN:{type:String,required:true,maxlength:100,lowercase:true,trim:true},
	school_id:{type: Schema.Types.ObjectId,required:true,unique:false},
	allowed:{type:Number,required:true,default:0,unique:false},// either -1 rejected, 0 waiting , 1 accepted
});

ParentingSchema.pre('save', function (next) {
	next();
});

const ParentingDB = mongoose.model('Parentings', ParentingSchema);
module.exports = ParentingDB;