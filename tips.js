//ero
return log_err(err,true,req,res);
return log_err(err,false,req,res);
// render msg
return res.render("./lost",{msg:""})
// NMAGULAR  POST
$scope.loadUnits = function(){
	$http
	.post("/unit.list",{_csrf:$scope.anti_csrf,course_id :$scope.course_id})
	.then(function(response){
		$scope.units=response.data;
	})
	.catch(function(erreur){
		Notifier.danger(erreur.data)
	});				 
}
/// clickable label
a.btn-simple.btn.label.btn-rose(ng-click="dosomethin(teacher._id)") confirm
	i.material-icons verified_user
// SWAL 
swal({
	title: 'Deleted!',
	text: course_name+' has been deleted.',
	type: 'success',
	confirmButtonClass: "btn btn-success",
	buttonsStyling: false
})
//
    {__v:0,email:0,password:0,gender:0,phone_number:0,
      class_id:0,school_id:0,isEnabled:0,isValidated:0,upload_time:0,updatedAt:0},
//
      else if(course_exists.teacher_list.indexOf(String(req.user._id) ==-1)
        return res.render("./lost",{msg:"This course is not yours"})
        return res.status(400).send("This course is not yours");
 /// 
 swal({
			title: 'Give us your email address',
			html: '<div class="form-group">' +
					  '<input id="input1" type="email" class="form-control" placeholder="Type your email here" />' +
				  '</div>',
			showCancelButton: true,
			confirmButtonClass: 'btn btn-success',
			cancelButtonClass: 'btn btn-danger',
			buttonsStyling: false
		}).then(function(result) {					
			$scope.requestNewPassword();
		}).catch(swal.noop)
(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)

 new Notification({
    user_id:req.user._id,
    user_name:req.user.name,
    content: "Congratulations, your account is now validated",
    school_id:req.user.school_id,
    isAuto:false,            
  }).save((err)=>{
    if(err) console.log(" You have to log "+err)
  })
  //-----------------------------------------------------------
  //Angular filtering
  	.filter('toTermName', function() {
		return function(input){
			return input=='S'?'Semester':'Term'
		}
	})
	.filter('toClasseName', function() {
		return function(input, term){
			return term=='S'?'Y'+input:'S'+input
		}
	})
	.filter('yearToDate', function() {
		return function(input){
			input =Number(input)+2000;
			return input = input+'/'+Number(Number(input)+1);
		}
	})
	.filter('toTeacher_name', function(){
		return function(input,list_teachers){
			if(input==''||!input)	return 'Not defined';
			for(var i =0;i < list_teachers.length;i++){
				if(list_teachers[i]._id == input) return list_teachers[i].name
			}
		}
	})
{ "_id" : ObjectId("599d76bda93230c0701e1412"), "updatedAt" : ISODate("2018-01-15T07:55:06.514Z"), "created_at" : ISODate("2017-08-23T12:36:13.373Z"), "name" : "MUKAMURAMA", "email" : "mjuve25@yahoo.fr", "URN" : "lbdd-118010", "password" : "$2a$10$GJ4k507Ssv5BAwUBvkY1YO5hFMMmsAn3VS0VqOvxREHaFmdVIVD/W", "school_id" : ObjectId("595647b43e5ea452049f2aa4"), "phone_number" : "0782536587", "hasPaid" : true, "course_retake" : [ ], "isValidated" : false, "isEnabled" : true, "access_level" : 2.1, "gender" : 2, "__v" : 0, "lastSeen" : ISODate("2017-08-23T13:43:19.642Z") }
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	//Jac conf as stude
{ "_id" : ObjectId("5a956447710de7364a36ce4f"), "updatedAt" : ISODate("2018-03-01T09:42:45.799Z"), "created_at" : ISODate("2018-02-27T13:59:35.407Z"), "name" : "MANISHIMWE JUSTINE", "email" : "mabiche05@yahoo.fr", "URN" : "6bjj-16330", "password" : "$2a$10$a3y6lZkKd6i4Yx9fYMqHg.8J7z1.RVuCbtNaVg50EWu/ZmTZbgvZe", "school_id" : ObjectId("595647b43e5ea452049f2aa4"), "phone_number" : "788851274", "class_id" : ObjectId("5a7018c7f5c46f9d35c00058"), "hasPaid" : true, "course_retake" : [ ], "isValidated" : false, "isEnabled" : true, "access_level" : 4, "prev_classes" : [ ], "gender" : 2, "__v" : 0, "lastSeen" : ISODate("2018-03-01T09:42:45.796Z") }

// Jac conf as teac
{ "_id" : ObjectId("5a96b0e10b98ae668de0f406"), "updatedAt" : ISODate("2018-02-28T15:49:18.635Z"), "created_at" : ISODate("2018-02-28T13:38:41.761Z"), "name" : "MANISHIMWE JUSTINE", "email" : "mabiche005@yahoo.fr", "URN" : "45cr-16352", "password" : "$2a$10$Q3d.I0T0K3SibMGvetcOR.PXisFlICwSahP.sYQKOnXcLYDoOFl0m", "school_id" : ObjectId("595647b43e5ea452049f2aa4"), "phone_number" : "788851274", "hasPaid" : true, "course_retake" : [ ], "isValidated" : false, "isEnabled" : true, "access_level" : 3, "prev_classes" : [ ], "gender" : 2, "__v" : 0 }
//new AND SAVED
{ "_id" : ObjectId("5a96b0e10b98ae668de0f406"), "updatedAt" : ISODate("2018-02-28T15:49:18.635Z"), "created_at" : ISODate("2018-02-28T13:38:41.761Z"), "name" : "MANISHIMWE JUSTINE", "email" : "mabiche05@yahoo.fr", "URN" : "45cr-16352", "password" : "$2a$10$a3y6lZkKd6i4Yx9fYMqHg.8J7z1.RVuCbtNaVg50EWu/ZmTZbgvZe", "school_id" : ObjectId("595647b43e5ea452049f2aa4"), "phone_number" : "788851274", "hasPaid" : true, "course_retake" : [ ], "isValidated" : false, "isEnabled" : true, "access_level" : 3, "prev_classes" : [ ], "gender" : 2, "__v" : 0 }

	Admin dashboard
	Chat for every user wherever they are
	Content for student for previous year
