var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
Notification area made by all persons in a school
*/
// Le schma de Notification
var NotificationSchema =new Schema({
	user_id:{type:Schema.Types.ObjectId,required:true,unique:false},
	user_name:{type:String,required:true,unique:false,index:false},
	content:{type:String,required:true,unique:false,index:false,trim:true},
	class_id:{type: Schema.Types.ObjectId,required:false,unique:false},
	school_id:{type: Schema.Types.ObjectId,required:true,unique:false},
	dest_id:{type: Schema.Types.ObjectId,required:false,unique:false},
	level:{type:Number,required:false,default:0},
	isAuto:{type:Boolean,required:true},
	
}, { timestamps: {createdAt:'time'}});

NotificationSchema.pre('save', function (next) {
	next();
});

const NotificationDB = mongoose.model('Notification', NotificationSchema);

module.exports = NotificationDB;