module.exports = {
	'googleAuth':{
		'clientID':process.env.GOOGLE_CLIENT_ID,
		'clientSecret':process.env.GOOGLE_CLIENT_SECRET,
		'callbackURL':'http://localhost:6700/google-callback'
	},
	'facebookAuth':{
		'clientID':process.env.FB_ID,
		'clientSecret':process.env.FB_SECRET,
		'callbackURL':'http://localhost:6700/fb-callback',
		'profileURL':'',
		'profileFields':['id','email','name']
	}
}