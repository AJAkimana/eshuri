'use strict';

/**
*  Module
*
* Description
*/
angular.module('eshuri_App', ['ngRoute', 'ngStorage'])
.config(function($routeProvider) {
  $routeProvider.when('/', {
    // templateUrl: 'addpost/addpost.html',
    controller: 'exploreCtrl'
  })
})
.filter('to_Capital', function() {
  return function(input){
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
})
.filter('to_Gender', function() {
  return function(input){
    if(isNaN(input)) return input;
    // console.log(" we have "+input)
    switch(input){
      case 1: input ="Mixted";break;case 2: input ="Boys";break;case 3: input ="Girls";break;
      default: input="Unknown Gender";break;
    }
    return input;
  }
})
.filter('toInstitution', function() {
  return function(input){
    if(isNaN(input)) return input;
    switch(input){
      case '1': input ="Department";break;case '2': input ="High school";break;case '3': input ="Primary";break;
      case '4': input ="Infant school";break;
      default: input="Invalid intitution";break;
    }
    return input;
  }
})
.filter('toPartnership', function() {
  return function(input){
    if(isNaN(input)) return input;
    switch(input){
      case '1': input ="Private";break;case '2': input ="Public";break;case '3': input ="Public-Private";break;
      default: input="Invalid partnership";break;
    }
    return input;
  }
})
.filter('to_Category', function() {
  return function(input){
    if(isNaN(input)) return input;
    switch(input){
      case 1: input ="All";break;
      case 2: input ="Internals only";break;
      case 3: input ="Externals only";break;
      default: input="Unknown category";break;
    }
    return input;
  }
})
.controller('exploreCtrl', function($scope, $http,$window, $localStorage){
  $scope.districts =["Eastern-Bugesera","Eastern-Gatsibo","Eastern-Kayonza","Eastern-Kirehe","Eastern-Ngoma","Eastern-Nyagatare","Eastern-Rwamagana","Kigali-Gasabo","Kigali-Kicukiro","Kigali-Nyarugenge","Northen-Burera","Northen-Gakenke","Northen-Gicumbi","Northen-Musanze","Northen-Rulindo","Northen-Nyabihu","Southern-Gisagara","Southern-Huye","Southern-Kamonyi","Southern-Muhanga","Southern-Nyamagabe","Southern-Nyanza","Southern-Nyaruguru","Southern-Ruhango","Western-Karongi","Western-Ngororero","Western-Nyabihu","Western-Nyamasheke","Western-Rubavu","Western-Rusizi","Western-Rutsiro",];
  $scope.loadSchools = function(){
    $http
    .get("/eshuri/schools/alljson.json")
    .then(function(response){
      $scope.schools =response.data;
      // console.log('It is working: '+JSON.stringify($scope.schools));
    })
    .catch(function(erreur){
      Notifier.danger(erreur.data);
    });
  }
  $scope.loadSchools();
  $scope.searchForm = function(){
    // console.log('It is working')
    Notifier.success('It is working');
  }
  $scope.search = null;
  $scope.changSearch = function(){
    var to_send = $scope.search;
    $http.get('/school.list/'+to_send)
    .then(function(result){
      $scope.entries = result.data;
    })
    .catch(function(err){
      Notifier.danger(err.data);
    })
  }
  $scope.enrollToSchool = function(school){

    if (typeof(Storage) !== "undefined") {
       console.log('It is supported')
      if($localStorage.selected_school){
        console.log('It is working: '+JSON.stringify(school));
        var stored = $localStorage.selected_school;
        if(stored.name!=school.name){
          swal({
            title: 'warning',
            text: 'You want to replace <i style="color:red">'+stored.name.toUpperCase()+'</i> with <i style="color:green">'+school.name.toUpperCase()+'</i>?',
            html:'',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: 'Yes, I do!',
            buttonsStyling: false
          }).then(function(){
            $localStorage.selected_school=school;
            Notifier.success('You school is: '+$localStorage.selected_school.name);
          })
        }
        else{
          Notifier.success('You school is: '+$localStorage.selected_school.name);
        }
      }else{
        $localStorage.selected_school = school;
      }
    }else{
      console.log('It is not supported by browser')
    }
  }
})