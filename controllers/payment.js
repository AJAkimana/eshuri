const Payurl = require('../config/migs'),
      log_err=require('./manage/errorLogger'),
      Payment = require('../models/Payment'),
      Fees = require('../models/Fees'),
      School = require('../models/School');

      // Add payment function
exports.addPayment =(req,res)=>{   
    School.findOne({_id:req.user.school_id},(err,school)=>{
    if(err) return log_err(err,true,req,res);
    else if(!school) return res.render("./lost",{msg:"Invalid data"})
    return res.render('payment/add_payment', {
      title: 'Payment Services',
      access_lvl: req.user.access_level,
      // email: req.user.email,
      school_id: req.user.school_id,
      school: school,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken,
    });
  })
}

exports.editPayment = (req, res, next)=>{
  // var classLevel=req.body.level;
  req.assert('fee_id', 'Invalid data').isMongoId().notEmpty();
  // req.assert('fee_type', 'Fees type is required').notEmpty();
  // req.assert('duration', 'Please give the duration').notEmpty();
  req.assert('due_amount', 'Please give us due amount').notEmpty();
  // req.assert('currentTerm', 'term is not given').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  Fees.findOne({school_id:req.user.school_id,fee_id:req.body.fee_id.trim().toLowerCase()},(err, fees_exist)=>{
    if(err) return log_err(err,false,req,res);
    console.log('fees exist: '+JSON.stringify(fees_exist))
    if(fees_exist && fees_exist._id!=req.body.fee_id) return res.status(400).send("There is fee with the same informations");
    //Find that class and update it
    Fees.findOne({school_id:req.user.school_id,_id:req.body.fee_id},(err,thisPayAdd)=>{
      if(err) return log_err(err,false,req,res);
      if(!thisPayAdd) return res.status(400).send("Unkown fees record");
      // thisPayAdd.fee_type=req.body.fee_type;
      // thisPayAdd.duration=req.body.duration;
      thisPayAdd.due_amount=req.body.due_amount;
      // thisPayAdd.currentTerm=req.body.currentTerm;
      thisPayAdd.save((err, ok)=>{
        if(err) return log_err(err,false,req,res);
        return res.end();
      })
    })
  })
}
exports.removePay = function(req,res,next){ // D  
  req.assert('fee_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors)  return res.status(400).send(errors[0].msg);
  // Content.count({unit_id:req.body.unit_id},(err,num)=>{
  //   if(err) return log_err(err,false,req,res);
  //   else if(num >0)
  //     return res.status(400).send("There is "+num+" contents in this unit, delete them first");
  Fees
  .remove({_id:req.body.fee_id},function(err, fees){
    if(err) return log_err(err,false,req,res);
    return res.end(); // when OK
  })
  // })
  
}
exports.removeRecord = function(req,res,next){ // D  
  req.assert('gotFee_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors)  return res.status(400).send(errors[0].msg);
  // Content.count({unit_id:req.body.unit_id},(err,num)=>{
  //   if(err) return log_err(err,false,req,res);
  //   else if(num >0)
  //     return res.status(400).send("There is "+num+" contents in this unit, delete them first");
  Payment
  .remove({_id:req.body.gotFee._id},function(err, fees){
    if(err) return log_err(err,false,req,res);
    return res.end(); // when OK
  })
  // })
  
}
exports.collectFess =(req,res)=>{
    School.findOne({_id:req.user.school_id},(err,school)=>{
    if(err) return log_err(err,true,req,res);
    else if(!school) return res.render("./lost",{msg:"Invalid data"})
    return res.render('dashboard/fees_collection', {
      title: 'Payment Services',
      access_lvl: req.user.access_level,
      // email: req.user.email,
      school_id: req.user.school_id,
      school: school,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken,
    });
  })

}
exports.getPaymentPage = function(req, res, next) {  
  if(!req.isAuthenticated()) return res.redirect('/user.signin');
  else return res.render('payment/payment_view', {
      title : 'eshuri payment page',
      csrf_token: res.locals.csrftoken
  })
}
exports.savePaidService=(req,res)=>{
  req.assert('school_id','No school found').isMongoId();
  
  const err = req.validationErrors();
  if(err) return res.status(400).send(err[0].msg);
  School.findOne({_id:req.body.school_id},(err,schoolfound)=>{
    if(err) return status(400).send('invalid data found');
    if(!schoolfound) return status(400).send('No data found on this school.');
    var year =new Date().getFullYear()-2000;
    var nePayService=new Payment({  
      school_id:req.user.school_id,
      student_URN:req.body.stud_urn,
      student_name:req.body.student_name,
      student_id:req.body.student_id,
      amount:req.body.amount,
      fee_type:req.body.fee_type,
      currentTerm:req.body.currentTerm,
      academic_year:year,
      email:req.body.email,
      // status:req.body.status,
      payer_name:req.body.payer_name,
      phone_number:req.body.phone_number
    })
    nePayService.save(function(err){
      // console.log(nePayService);
      if(err)
        return res.status(400).send("We were unable to save your payment please try again");
    })
    return res.end();
  })
  
}
exports.createNewFees=(req, res)=>{
  req.assert('school_id','Invalid Data').isMongoId();
  req.assert('duration','Please select duration').notEmpty();
  req.assert('currentTerm','Choose a term/semester').notEmpty();
  req.assert('fee_type','select fees type').notEmpty();
  req.assert('due_amount','Please Enter the amount').notEmpty();

  const erreur = req.validationErrors();
  if(erreur) return res.status(400).send(erreur[0].msg);
  //Check if the code is not already used
  School.findOne({_id:req.user.school_id},(err,school_data)=>{
    if(err)return status(400).send("Invalid data");
    if(!school_data) return res.status(400).send("this school not exist");

    var year = new Date().getFullYear()-2000;
    var newFees =new Fees({
      school_id:req.user.school_id,
      duration:req.body.duration,
      due_amount:req.body.due_amount,
      fee_type:req.body.fee_type,
      currentTerm:req.body.currentTerm,
      academic_year:year
    })
    newFees.save(function(err){
      if(err) {
        // console.log(err)
        return res.status(400).send("Unable to save new record:");
      }
      return res.end();
    })

  })

}

exports.getFeesListJSON = (req,res,next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  // console.log('STUD LIS'+req.params.school_id);
  Fees.find({school_id:req.params.school_id}).sort({currentTerm:1}).exec((err,Fees_list)=>{
    if(err) return log_err(err,false,req,res);
    
    return res.json(Fees_list);
  })
}

exports.getFeesAmountListJSON = (req,res,next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  // console.log('fee  LIS'+req.params.school_id);
  Fees.find({school_id:req.params.school_id}).sort({currentTerm:1}).exec((err,Fees_amount_list)=>{
    if(err) return log_err(err,false,req,res);
    return res.json(Fees_amount_list);
  })
}
exports.getCollectedFeesListJson=function(req,res){
  req.assert('school_id','this school is not foound').isMongoId();
  const err=req.validationErrors();
  if(err) return res.status(400).send(err[0].msg);
  Payment.find({school_id:req.params.school_id},(err,paymentFound)=>{
    if(err) return res.status(400).send("Invalid data");
    if(!paymentFound) return res.status(400).send("No payment exist");
    // console.log(paymentFound);
    return res.json(paymentFound);
  })
}

exports.postPayment = function(req, res, next) {
  req.assert('school_id','Invalid Data').isMongoId();
  req.assert('student_URN','Please Stud URN is required').notEmpty();
  req.assert('currentTerm','Choose a term/semester').notEmpty();
  req.assert('amount','amount can not be empty').notEmpty();
  req.assert('academic_year','academic Year is missing').notEmpty();
  req.assert('status','Provide the status os payment');
  // req.assert('email')
  // req.assert('phone_number')
  req.assert('payer_name','Please give us the Payer Name');

  const erreur = req.validationErrors();
  if(erreur) return res.status(400).send(erreur[0].msg);
  //Check if the code is not already used
  School.findOne({_id:req.user.school_id},(err,school_data)=>{
    if(err)return status(400).send("Invalid data");
    if(!school_data) return res.status(400).send("this school not exist");

    var year = new Date().getFullYear()-2000;
    var newPayment =new Fees({
      school_id:req.user.school_id,
      student_id:req.body.student_id,
      student_URN:req.body.student_URN,
      student_name:req.studentToPayFor.name,
      amount:req.body.amount,
      currentTerm:req.body.currentTerm,
      // status:req.body.status,
      // fee_type:req.body.fee.fee_type,
      email:req.body.email,
      phone_number:req.body.phone_number,
      payer_name:req.body.payer_name,
      academic_year:year,
      created_at: created_at
    })
    newPayment.save(function(err){
      if(err) {
        // console.log(err)
        return res.status(400).send("Unable to save new record:");
      }
      console.log("values created successfully:");
      return res.end();
    })

  })
}