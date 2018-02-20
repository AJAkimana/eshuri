const Payurl = require('../config/migs'),
      Payment = require('../models/Payment');

exports.getPaymentPage = function(req, res, next) {
    return res.render('payment/payment_view', {
        title : 'eshuri payment page',
        csrf_token: res.locals.csrftoken
    })
}

exports.postPayment = function(req, res, next) {
    let newPayment = new Payment({
        student_URN:req.body.student_URN,
        school_name: req.body.school_name,
        amount: req.body.amount,
        status:0,
        email:req.body.email,
        phone_number:req.body.phone
    });
    newPayment.save(function (err) {
        if(err) return log_err(err, false, req, res);
        let migs_payload = {
            amount: parseInt(req.body.amount),
            return_url: req.body.url,
            order_info:"test info",
            merchant_ref:23
        };
        let payment_url = Payurl.call_url(migs_payload);
        let return_url = {"url":payment_url};
        return res.json(return_url);
    })
}