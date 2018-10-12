const urlencode =require('urlencode'),
      crypto =  require('crypto');
function ksort(obj){
  var keys = Object.keys(obj).sort(),
      sortedObj = {};
  for(var i in keys) {
    sortedObj[keys[i]] = obj[keys[i]];
  }
  return sortedObj;
}
class Payurl {
  static  call_url(payload) {
    let base_url = "https://migs.mastercard.com.au/vpcpay?";
    const merchant_id="TESTBOK000005";
    let vpc_hash = "AB4E546D4F20729DBF05434417028893";
    let secure_hash="";
    const accessCode= "43C97015";

    let merch = {
      "vpc_Version":"1",
      "vpc_Command":"pay",
      "vpc_AccessCode":accessCode,
      "vpc_MerchTxnRef":payload.merchant_ref,
      "vpc_Merchant":merchant_id,
      "vpc_OrderInfo":payload.order_info,
      "vpc_Amount":String((100*payload.amount)),
      "vpc_Locale":"en",
      "vpc_ReturnURL":payload.return_url,
    };
    merch =  ksort(merch);
    let appendAmp = 0;
    for (let prop in merch) {
      if (merch[prop].length > 0) {
        if (appendAmp === 0){
          base_url +=  urlencode(prop) + "=" + urlencode(merch[prop]);
          appendAmp = 1;
        } else {
          base_url +=  '&' + urlencode(prop) + '=' + urlencode(merch[prop]);
        }
        let val = merch[prop];
        if(val.length > 0 && prop.substring(0,4)=='vpc_' || prop.substring(0,5) == 'user_'){
            secure_hash +=   prop + "=" + val + "&" ;
        }
      }
    }
    secure_hash =  secure_hash.replace(/&+$/,'');
    if (vpc_hash.length > 0) {
      let binKey = new Buffer(vpc_hash,"hex");
      let hasheddata = new Buffer(crypto.createHmac('SHA256',binKey).update(secure_hash).digest('hex')).toString().toUpperCase();
      base_url += "&vpc_SecureHash=" + hasheddata + "&vpc_SecureHashType=SHA256";
    }
    return base_url;
  }
}
module.exports = Payurl;