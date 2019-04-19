var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PaymentSchema = new Schema({
    student_URN:{type:String,required:true,maxlength:100,lowercase:true,trim:true},
    student_name:{type:String,required:true,maxlength:100,lowercase:true,trim:true},  
    student_id:{type:Schema.Types.ObjectId,required:true,unique:false},
    school_id:{type: Schema.Types.ObjectId,required:true,unique:false},
    amount:{type:Number, required:true, unique:false},
    fee_type:{type:Number, required:true, unique:false},
    currentTerm:{type:Number,required:true, min:0,unique:false},
    academic_year:{type:Number,required:true,unique:false},
   //  status:{type:Number, required:true, default:0, unique:false},// either 0: pending, -1: unsuccessful, 1: successful
    email:{type:String,required :false, match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/ ,unique:false,lowercase:true,trim:true},
    phone_number:{type:String,required:false,unique:false},
    payer_name:{type:String,required:true,maxlength:100,unique:false,trim:true, uppercase:true},
},{ timestamps: { createdAt: 'created_at' }});

PaymentSchema.pre('save', function(next) {
   next();
});

const PaymentDB = mongoose.model('Payments', PaymentSchema);
module.exports = PaymentDB;