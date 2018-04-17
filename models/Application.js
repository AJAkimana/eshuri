var validator = require('validator');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Schema to process registration applications
var applicationSchema = new mongoose.Schema({
	school_id: {type: Schema.Types.ObjectId,required:false,unique:false},
	user_id: {type: Schema.Types.ObjectId,required:true,unique:false},
	comment: {type:String,required:false,unique:false},
	year_o_s:{type:Number,required:false,unique:false},
	program: {type:String,required:false,unique:false},
	faculty: {type:String,required:true,unique:false},
	status: {type:String,required:true, enum:['A','P','F','R'],unique:false}, //Admited, Pending, Fill missing, Rejected
})

applicationSchema.pre('save', function(next) {
	next();
});
/**
 * Check whether an application is already submitted
 */
applicationSchema.statics.checkApplicationExists = function(application, cb) {
	this.findOne({
		school_id: application.school_id,
		user_id: application.user_id,
	}, (err, application_exists) => {
		cb(err, application_exists);
	})
};

const ApplicationDB = mongoose.model('Applications', applicationSchema);

module.exports = ApplicationDB;