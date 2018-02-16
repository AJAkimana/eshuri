/*BEst tuto :
https://www.packtpub.com/books/content/adding-real-time-functionality-using-socketio
*/
var num_clients=0;
const Message =require('./models/Message'),
    Util =require("./utils"),
    User =require('./models/User');
module.exports = function(app) {
  // INITIALISTION
  var server = require('http').createServer(app);
  var io = require('socket.io').listen(app.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', 
    app.get('port'),app.get('env'));
    console.log("Web app link = http://127.0.0.1:"+app.get('port'));
    console.log(" Attention is not validated in automated.js at currentItem.p and currentItem.m")
    console.log(" TAKE CARE so that when we delete a user we will not have duplicate URN.because is based on user number..");
    console.log(" REMEMBER TO ADD DEPARTEMTN in Signup page ")
    console.log("=>Remember to SEEK about anti XSRF SameSite: Lax or Strict cookie!")
    console.log("=>Remember to IMPLEMENT Email validation when signing UP !")
    console.log("=>Remember to CHECK for performance optimization with async in controller for some functions")
    console.log("=>Remember to VERIFY the data sent back to user check with  by example the __v:0")
    console.log("=>Remember to SCHEDULE for - Delete Old tokens")
    console.log("=>Remember to VERIFY the deletion en cascade")
    console.log("=>Remember to CHECK exports.getPageOneCourse  for course_id is valid in course controller")
    console.log("______________________________________________")
    console.log(" IF STUDENT CHANGES SCHOOL ..??? what ?")
    console.log("=====>Paisible rescan book 'LE RESEAU DU FRANCAIS'");
    console.log(" you should remove academic year in the attirbutes of CONTENT. not necessary..")
    console.log("=====>Remember to validate date not using isDate() cause it will not work on=>Test ->(new and edit)")
    console.log(" Add view page for 3 4 et 7 content type.. OPTIONAL")
    console.log("level: 5, ADD LEVEL in automated MARKS in postAnswers !!!");
    console.log(" return moment(time).fromNow(); itanga a warning attention depreaction vuba");
    console.log("====> REMEMBER KWIMURA STUDENTS IS ONLY APPLIED FOR SECONDARY SCHOOL<=====")
    console.log("====> UPLOAD FILE FOR STUDENTS<=====")
    console.log("----->SUPPERADMIN must be DIRECTOR OF SCHOOL<-------")
    console.log('______________________________________________')
  }));
  /* Get some information*/
  io.use(function(socket, next) {
    //console.log(" Socket info = "+JSON.stringify(socket.request.headers));
    console.log(" Check if the COOKIE IS a valid cookie !!");
    console.log(" This is where all the security is relying... !!");
    next(null, true);
  });
  console.log("```````````````````````````````````````````````")
    io.on('connection', function(socket){
    socket.on('connect', function(eventData){
        clients.push(socket);
    });
    socket.on('join', function (data) {
      num_clients++;
       socket.join(data.myID);// join his ID as room name 
    });
    socket.on('leave', function (data) {
       num_clients--;
       socket.leave(data.myID);// join his ID as room name
       
    });
    socket.on('new_message', function(data) {
      // We receive, msg:$scope.newMsg,from:'#{pic_id}',dest:$scope.interlocutor._id})
      // Send to the guy that is inthe ROOM
      var async = require("async");
      async.parallel([
        (callback)=>{ // chek sender
          User.findOne({_id:data.from},(err,exists)=>{
            if(err) return callback(err);
            else if(!exists) return callback("Not exists");
            callback(null);
          })
        },
        (callback)=>{ //check detination exists
          User.findOne({_id:data.dest},(err,exists)=>{
            if(err) return callback(err);
            else if(!exists) return callback("Not exists");
            callback(null);
          })
        }
      ],(err)=>{ // if all is ok then save to DB 
        if(err) io.sockets.in(data.from).emit('msg_failed', data)
        //get the conversation ID
        new Message({
          conv_id:Util.getConv_id(data.from,data.dest), //creata an ID
          msg:data.msg,
          from:data.from,
          dest:data.dest,
        }).save((err)=>{
          if(err) io.sockets.in(data.from).emit('msg_failed', data)
          // console.log("OKAY "+data.dest)
          // Message sent
          io.sockets.in(data.dest).emit('new_message', data)
        })
      })
    });
    
    socket.on('disconnect', function() {
    });
  });
  console.log("```````````````````````````````````````````````")
}