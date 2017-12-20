'use strict';

var app = angular.module('eshuri_App.ViewApplication', [
  'ngSanitize',
  'ui.select'
]);

/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs an AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform an OR.
 */

app.filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      var keys = Object.keys(props);

      items.forEach(function(item) {
        var itemMatches = false;

        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
});

app.controller('selectSchool', function($scope, $http, $timeout, $interval) {
  console.log("Controller selectSchool loaded");
  var vm = this;

  vm.disabled = undefined;
  vm.searchEnabled = undefined;

  vm.setInputFocus = function() {
    $scope.$broadcast('UiSelectDemo1');
  };

  vm.enable = function() {
    vm.disabled = false;
  };

  vm.disable = function() {
    vm.disabled = true;
  };

  vm.enableSearch = function() {
    vm.searchEnabled = true;
  };

  vm.disableSearch = function() {
    vm.searchEnabled = false;
  };

  vm.clear = function() {
    vm.person.selected = undefined;
    vm.address.selected = undefined;
    vm.country.selected = undefined;
  };

  vm.someGroupFn = function(item) {

    if (item.name[0] >= 'A' && item.name[0] <= 'M')
      return 'From A - M';

    if (item.name[0] >= 'N' && item.name[0] <= 'Z')
      return 'From N - Z';

  };

  vm.firstLetterGroupFn = function(item) {
    return item.name[0];
  };

  vm.reverseOrderFilterFn = function(groups) {
    return groups.reverse();
  };

  vm.personAsync = {
    selected: "wladimir@email.com"
  };
  vm.peopleAsync = [];

  vm.counter = 0;
  vm.onSelectCallback = function(item, model) {
    vm.counter++;
    vm.eventResult = {
      item: item,
      model: model
    };
  };

  vm.removed = function(item, model) {
    vm.lastRemoved = {
      item: item,
      model: model
    };
  };

  vm.tagTransform = function(newTag) {
    var item = {
      name: newTag,
      email: newTag.toLowerCase() + '@email.com',
      age: 'unknown',
      country: 'unknown'
    };

    return item;
  };

  vm.appendToBodyDemo = {
    remainingToggleTime: 0,
    present: true,
    startToggleTimer: function() {
      var scope = vm.appendToBodyDemo;
      var promise = $interval(function() {
        if (scope.remainingTime < 1000) {
          $interval.cancel(promise);
          scope.present = !scope.present;
          scope.remainingTime = 0;
        } else {
          scope.remainingTime -= 1000;
        }
      }, 1000);
      scope.remainingTime = 3000;
    }
  };

  $scope.goToApplication = function() {
    console.log("posting data....");
    console.log($scope.selected_school_id)
      //console.log (JSON.stringify($scope.formData));
  }
  
  vm.address = {};
  vm.refreshAddresses = function(address) {
    var params = {
      address: address,
      sensor: false
    };
    return $http.get(
      'http://maps.googleapis.com/maps/api/geocode/json', {
        params: params
      }
    ).then(function(response) {
      vm.addresses = response.data.results;
    });
  };


  vm.schools = function getSchools() {
    return $http
      .get("/schools")
      .then(function(response) {
        $scope.allSchools = response.data
      })
      .catch(function(erreur) {
        Notifier.danger(erreur.data);
      });
  }()

  vm.addPerson = function(item, model) {
    if (item.hasOwnProperty('isTag')) {
      delete item.isTag;
      vm.people.push(item);
    }
  }

  vm.country = {};
  vm.countries = [ // Taken from https://gist.github.com/unceus/6501985
    {
      name: 'Afghanistan',
      code: 'AF'
    }, {
      name: 'Åland Islands',
      code: 'AX'
    }
  ];
});