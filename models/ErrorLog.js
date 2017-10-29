var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
Une ErrorLog est par exemple S2MCE pour le High school ou 3 rd Year in Universitites
*/
// Le Schema de ErrorLog
var ErrorLogSchema = new Schema({
	error:{type:Schema.Types.Object,required:true},
	user_info:{type:Schema.Types.Object,required:true},
	route:{type:String,required:true},
	method:{type:String,required:true},
	request:{type:[Schema.Types.Object],required:true},
}, { timestamps: { createdAt: 'created_at' }});

ErrorLogSchema.pre('save', function (next) {
	next();
});

const ErrorLogDB = mongoose.model('ErrorLogs', ErrorLogSchema);

module.exports = ErrorLogDB;