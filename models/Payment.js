var mongoose = require('mongoose');
var Schema = mongoose.schema;

var PaymentSchema = new Schema({
    student_URN:{type:String,required:true,maxlength:100,lowercase:true,trim:true},
    school_id:{type: Schema.Types.ObjectId,required:true,unique:false},
    amount:{type:Number, required:true, unique:false},
    status:{type:Number, required:true, default:0, unique:false},// either 0: pending, -1: unsuccessful, 1: successful
    email:{type:String,required :false, match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/ ,unique:false,lowercase:true,trim:true},
    phone_number:{type:String,required:false,unique:false},
});

PaymentSchema.pre('save', function(next) {
   next();
});

const PaymentDB = mongoose.model('Payments', PaymentSchema);
module.exports = PaymentDB;