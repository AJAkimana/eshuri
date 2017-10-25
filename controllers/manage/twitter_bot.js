const Tweet = require('twitter');
const client = new Tweet({
  consumer_key:         process.env.TWITTER_KEY,
  consumer_secret:      process.env.TWITTER_SECRET,
  access_token_key:         process.env.TWITTER_TOKEN,
  access_token_secret:  process.env.TWITTER_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});
// send a tweet 
module.exports =(msg)=>{
  client.post('statuses/update', {status: ' @ngendlio @manshuajo '+msg})
  .then(function (tweet) {}).catch(function (error){});
}
