var app =angular.module('eshuri_App', ['ngRoute',]);
app
.filter('toNormal', function() {    
  return function(input){       
    return Number(input)+Number(2000)
  }
})
.filter('toDistrict', function() {    
  return function(input){
    if(isNaN(input)) return input;
    switch(input){
      case '1': input ="Eastern-Bugesera";break;
      case '2': input ="Eastern-Gatsibo";break;
      case '3': input ="Eastern-Kayonza";break;
      case '4': input ="Eastern-Kirehe";break;
      case '5': input ="Eastern-Ngoma";break;
      case '6': input ="Eastern-Nyagatare";break;
      case '7': input ="Eastern-Rwamagana";break;
      case '8': input ="Kigali-Gasabo";break;
      case '9': input ="Kigali-Kicukiro";break;
      case '10': input ="Kigali-Nyarugenge";break;
      case '11': input ="Northen-Burera";break;
      case '12': input ="Northen-Gakenke";break;
      case '13': input ="Northen-Gicumbi";break;
      case '14': input ="Northen-Musanze";break;
      case '15': input ="Northen-Rulindo";break;
      case '16': input ="Southern-Gisagara";break;
      case '17': input ="Southern-Huye";break;
      case '18': input ="Southern-Kamonyi";break;
      case '19': input ="Southern-Muhanga";break;
      case '20': input ="Southern-Nyamagabe";break;
      case '21': input ="Southern-Nyanza";break;
      case '22': input ="Southern-Nyaruguru";break;
      case '23': input ="Southern-Ruhango";break;
      case '24': input ="Western-Karongi";break;
      case '25': input ="Western-Ngororero";break;
      case '26': input ="Western-Nyabihu";break;
      case '27': input ="Western-Nyamasheke";break;
      case '28': input ="Western-Rubavu";break;
      case '29': input ="Western-Rusizi";break;
      case '30': input ="Western-Rutsiro";break;
      default: input="_____________________";break;
    }
    return input;
  }
})
.filter('toTermName', function() {    
  return function(input){       
    return input=='S'?'Semester':'Term'
  }
})
.controller('reportCtrl', ['$scope', '$http','$window',function($scope, $http,$window){
  $scope.studentMark = [];
  $scope.qTest=0,$scope.qExam=0,$scope.qtotal=0,$scope.testT1=0,$scope.ExamT1=0,$scope.totalT1=0,$scope.testT2=0,$scope.ExamT2=0,$scope.totalT2=0,$scope.testT3=0,$scope.ExamT3=0,$scope.totalT3=0,$scope.yQuotaTotal=0,$scope.mQuotaTotal=0;
  $scope.getAcademicYearsList = function(){
    $http
    .get("/class.academic_years/"+$scope.selectClass)
    .then(function(response){
      $scope.academic_years= response.data;
      //console.log($scope.academic_years)
    })
    .catch(function(erreur){
      Notifier.danger(erreur.data)
    });        
  }
  $scope.showDivs=function(){
    $scope.students_list=true;
    $scope.students_report=false;
  }
  $scope.printDiv = function (div) {
    var docHead = document.head.outerHTML;
    var printContents = document.getElementById(div).outerHTML;
    var winAttr = "location=yes, statusbar=no, menubar=no, titlebar=no, toolbar=no,dependent=no, width=865, height=600, resizable=yes, screenX=200, screenY=200, personalbar=no, scrollbars=yes";

    var newWin = window.open("", "_blank", winAttr);
    var writeDoc = newWin.document;
    writeDoc.open();
    writeDoc.write('<!doctype html><html>' + docHead + '<body onLoad="window.print()" class="center">' + printContents + '</body></html>');
    writeDoc.close();
    newWin.focus();
  }
  $scope.getClassList = function(){
    $http
    .get("/classe.list/"+$scope.school_id)
    .then(function(response){
      $scope.ClassList= response.data;
      //console.log("Classes: "+$scope.ClassList)
    })
    .catch(function(erreur){
      Notifier.danger(erreur.data);
    });        
  };
  $scope.getClassStudents = function(){
    
    $http
    .post('/school.students.list',{class_id:$scope.selectClass})
    .then(function(response){
      //console.log(response.data);
      $scope.students = response.data;
    })
    .catch(function(err){
      Notifier.danger(err.data);
    })
  }
  $scope.getAllStudentsReport = function(){
    $scope.students_list = true;
    $scope.studentsMark = [];
    $http
    .post('/report.all', {academic_year:$scope.choosen_year,class_id:$scope.selectClass})
    .then(function(response){
      var dataTerm1 = response.data[0].term1;
      var dataTerm2 = response.data[0].term2;
      var dataTerm3 = response.data[0].term3;
      $scope.classInfo = response.data[0].class_info;
      $scope.courses = response.data[0].courses;

      var test=0
      for(var i=0; i<dataTerm1.length; i++){
        for(var j=0; j<dataTerm2.length; j++){
          for(var k=0; k<dataTerm3.length; k++){
            if(dataTerm1[i].urn == dataTerm2[j].urn && dataTerm2[j].urn == dataTerm3[k].urn){
              var term1Pct = Number(dataTerm1[i].total_mark)*100/Number(dataTerm1[i].total_quota);
              var term2Pct = Number(dataTerm2[j].total_mark)*100/Number(dataTerm1[i].total_quota);
              var term3Pct = Number(dataTerm3[k].total_mark)*100/Number(dataTerm1[i].total_quota);
              var annualPct = (term1Pct+term2Pct+term3Pct)/3;
              var annual = Number(dataTerm1[i].total_mark)+Number(dataTerm2[j].total_mark)+Number(dataTerm3[k].total_mark);
              $scope.studentsMark.push({
              name:dataTerm1[i].name,
              urn:dataTerm1[i].urn,
              test_t1_mark:dataTerm1[i].test_mark,
              exam_t1_mark:dataTerm1[i].exam_mark,
              total_t1_mark:dataTerm1[i].total_mark,
              total_t1_pct:term1Pct,
              test_t2_mark:dataTerm2[j].test_mark,
              exam_t2_mark:dataTerm2[j].exam_mark,
              total_t2_mark:dataTerm2[j].total_mark,
              total_t2_pct:term2Pct,
              test_t3_mark:dataTerm3[k].test_mark,
              exam_t3_mark:dataTerm3[k].exam_mark,
              total_t3_mark:dataTerm3[k].total_mark,
              total_t3_pct:term3Pct,
              annual_pct:annualPct,
              annual:annual,
              });

              //console.log('Student name : '+dataTerm1[i].name+' tq: '+dataTerm1[i].total_quota + ' t1: '+dataTerm1[i].total_mark+' t2: '+dataTerm2[j].total_mark+' t3: '+dataTerm3[k].total_mark);
            }
          }
        }
      }
      //console.log('Students test marks: '+$scope.studentsMark);
    })
  }
  $scope.getOneStudentReport = function(studentid){
    $scope.students_report = true;
    $scope.students_list = false;
    $scope.studentMark = [];
    $scope.qTest=0,$scope.qExam=0,$scope.qtotal=0,$scope.testT1=0,$scope.ExamT1=0,$scope.totalT1=0,$scope.testT2=0,$scope.ExamT2=0,$scope.totalT2=0,$scope.testT3=0,$scope.ExamT3=0,$scope.totalT3=0,$scope.yQuotaTotal=0,$scope.mQuotaTotal=0;
    $http
    .post("/report.one",{
      academic_year:$scope.choosen_year,
      class_id:$scope.selectClass,
      student_id:studentid,
      school_id:$scope.school_id})
    .then(function(response){
      //$scope.allRecords= response.data;
      var dataTerm1 = response.data[0].term1;
      var dataTerm2 = response.data[0].term2;
      var dataTerm3 = response.data[0].term3;
      $scope.userInfo = response.data[0].userInfo;

      for(var i=0; i<dataTerm1.length; i++){
        for(var j=0; j<dataTerm2.length; j++){
          for(var k=0; k<dataTerm3.length; k++){
            if(dataTerm1[i].name == dataTerm2[j].name && dataTerm2[j].name == dataTerm3[k].name){
              var anualQuota = Number(dataTerm1[i].course_q)+Number(dataTerm2[j].course_q)+Number(dataTerm3[k].course_q);
              var anualMark = Number(dataTerm1[i].total)+Number(dataTerm2[j].total)+Number(dataTerm3[k].total);
              var anualPct = (anualMark*100)/anualQuota
              $scope.studentMark.push({
                name:dataTerm1[i].name,
                test_quota:dataTerm1[i].test_q,
                exam_quota:dataTerm1[i].exam_q,
                course_quota:dataTerm1[i].course_q,
                testTerm1:dataTerm1[i].test,
                examTerm1:dataTerm1[i].exam,
                totalTerm1:dataTerm1[i].total,
                testTerm2:dataTerm2[j].test,
                examTerm2:dataTerm2[j].exam,
                totalTerm2:dataTerm2[j].total,
                testTerm3:dataTerm3[k].test,
                examTerm3:dataTerm3[k].exam,
                totalTerm3:dataTerm3[k].total,
                anualQuotaTotal:anualQuota,
                anualMarkTotal:anualMark,
                anualMarkPct:anualPct,
              });
              $scope.qTest+=dataTerm1[i].test_q;
              $scope.qExam+=dataTerm1[i].exam_q;
              $scope.qtotal+=dataTerm1[i].course_q;
              $scope.testT1+=dataTerm1[i].test;
              $scope.ExamT1+=dataTerm1[i].exam;
              $scope.totalT1+=dataTerm1[i].total;
              $scope.testT2+=dataTerm2[j].test;
              $scope.ExamT2+=dataTerm2[j].exam;
              $scope.totalT2+=dataTerm2[j].total;
              $scope.testT3+=dataTerm3[k].test;
              $scope.ExamT3+=dataTerm3[k].exam;
              $scope.totalT3+=dataTerm3[k].total;
              $scope.yQuotaTotal+=anualQuota;
              $scope.mQuotaTotal+=anualMark;
            }
          }
        }
      }
      $scope.totalT1Pct = ($scope.totalT1*100)/$scope.qtotal;
      $scope.totalT2Pct = ($scope.totalT2*100)/$scope.qtotal;
      $scope.totalT3Pct = ($scope.totalT3*100)/$scope.qtotal;
      $scope.anualTotalT3Pct = ($scope.mQuotaTotal*100)/$scope.yQuotaTotal;
      //console.log($scope.termTwo)
    })
    .catch(function(erreur){
      Notifier.danger(erreur.data)
    }); 
  }
  $scope.districts =[
  "Eastern-Bugesera","Eastern-Gatsibo","Eastern-Kayonza","Eastern-Kirehe","Eastern-Ngoma","Eastern-Nyagatare","Eastern-Rwamagana","Kigali-Gasabo","Kigali-Kicukiro","Kigali-Nyarugenge","Northen-Burera","Northen-Gakenke","Northen-Gicumbi","Northen-Musanze","Northen-Rulindo","Northen-Nyabihu","Southern-Gisagara","Southern-Huye","Southern-Kamonyi","Southern-Muhanga","Southern-Nyamagabe","Southern-Nyanza","Southern-Nyaruguru","Southern-Ruhango","Western-Karongi","Western-Ngororero","Western-Nyabihu","Western-Nyamasheke","Western-Rubavu","Western-Rusizi","Western-Rutsiro",];
  $scope.school_id="#{school_id}";
  $scope.school_name="#{school_name}";
  $scope.school_district="#{school_district}";
  $scope.term_name="#{term_name}";
  //- $scope.user_name ="Lionel Ngendakuriyo";
  //- $scope.user_class= "S4MCE";
  $scope.students_report = false;
  $scope.getClassList();
}])
