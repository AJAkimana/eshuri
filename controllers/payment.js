

exports.getPaymentPage = function(req, res, next) {
    return res.render('payment/payment_view', {
        title : 'eshuri payment page',
        csrf_token: res.locals.csrftoken
    })
}