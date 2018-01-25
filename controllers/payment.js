

exports.getPaymentPage = function(req, res, next) {
    return res.render('payment/payment_view', {
        title : 'eshuri payment page'
    })
}