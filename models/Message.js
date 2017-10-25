var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
Message area made by all persons in a school
*/
// Le schma de Message
var MessageSchema =new Schema({
	conv_id:{type:String,required:true,unique:false,trim:true},
	from:{type:Schema.Types.ObjectId,required:true},
	dest:{type:String,required:true,unique:false},
	msg:{type:String,required:true,unique:false,index:false,trim:true},
	
}, { timestamps: {createdAt:'time'}});

MessageSchema.pre('save', function (next) {
	next();
});

const MessageDB = mongoose.model('Message', MessageSchema);

module.exports = MessageDB;