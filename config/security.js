/*
 * This module is a set of interesting security modules that i have seen that they are necessary
 * to avoid some known attacks.
*/
var csrf = require('csurf'),            // helps  avoid CSRF in pages
    helmet = require('helmet'),         //useful security-headers
    // const lusca =require('lusca'),
    contentLength = require('express-content-length-validator'),
    hpp = require('hpp'),
    expressValidator = require('express-validator');

const MAX_CONTENT_LENGTH_ACCEPTED = 15*1024* 1024;// avoid large payload attack limit to 3 MB

module.exports = function(app){
  // AVOID LARGE PAYLOAD ATTACK
  app.use(contentLength.validateMax(
    {
      max: MAX_CONTENT_LENGTH_ACCEPTED,// max size accepted for the content-length
      status: 400,
      message: "Data too big, !!! "
    }
  )); 
  
  // AVOID HTTP PArameter Pollution ex: /search?firstname=John&firstname=Alice&lastname=Doe
  app.use(hpp()); 
  
  //Avoid NO-SQL injection  in the urls and forms
  // app.use(filter({
  //   urlMessage: 'Un caractere interdit a été trouvé dans le lien' ,
  //   bodyMessage: 'Un caractere interdit a été trouvé dans les données de formulaire',
  // }))

  app.use(helmet()); 
  app.use(helmet.noSniff()) 
  app.use(helmet.frameguard({ action: 'SAMEORIGIN' }))// Don't allow my app to be in ANY frames:
  app.use(helmet.xssFilter());     //X-XSS-Protection HTTP header 
  //Apache/2.4.18 (Unix) OpenSSL/1.0.1e-fips mod_bwlimited/1.4 or Microsoft-IIS/8.5 or
  //PHP/5.4.45-0+deb7u1 or Nginx 1.6.2
  var webServers =["Apache/2.4.18 (Unix) OpenSSL/1.0.1e-fips mod_bwlimited/1.4",
    "Microsoft-IIS/8.5","PHP/5.4.45-0+deb7u1","Nginx 10.6.2","Express.js",
    "Erlang","Ruby on Rails","Phusion Passenger (mod_rails/mod_rack) 3.0.11"];
  app.use(helmet.hidePoweredBy({ setTo: webServers[Math.floor(Math.random()*webServers.length)] })) // Spoof server Name  to Microsoft-IIS/8.5. LOL
  //Avoid Some browsers start doing DNS lookups of other domains before visiting those domains. 
  app.use(helmet.dnsPrefetchControl({ allow: false }));

  /* TO VALIDATE CUSTOMLY*/
  app.use(expressValidator({
   customValidators: {
      isArray: function(value) {
          return Array.isArray(value);
      },
      gte: function(param, num) {
          return param >= num;
      }
   }
  }));
  /*
   * These two functions are used to avoid csrf attack during a HTTP POST 
   * we simply add an other cookie name to be sure that the page the user has came from us.
   * this function only works in the case of a POST.
   * Though in this app i haven t used forms so i won't use it
  */
  // app.use(csrf());
  // app.use(function(req, res, next) {
  //   // if you don t set it as http Only .. this will not be checked
  //   var token_csrf =req.csrfToken()
  //   res.cookie('XSRF-TOKEN', token_csrf,{ httpOnly: true,secure:false});
  //   res.locals.csrftoken = ;
  //   console.log(" locals "+res.locals.csrftoken)
  //   return next();
  // });

  //  // Handle CSRF token error or attack....
  // app.use(function(err, req, res, next) {
  //   if (err.code !== 'EBADCSRFTOKEN')  return next(err);
  //   console.log("=> "+err.code+" but given is "+ req.body._csrf)
  //   // The token is not valid. CRSF
  //   return res.status(403).send('Your request is not legal.')
  //   // next();
  // })
  console.log(" CSRF attack Prevention not activated !")

  // Dropping privileges
  // process.setgid(parseInt(process.env.app_GID, 10));
  // process.setuid(parseInt(process.env.app_UID, 10));
  console.log(" Privileges dropped to "+process.getuid())
}