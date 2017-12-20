(function() {

    'use strict';

    angular
        .module('eshuri_App')
        .factory('province', province, 'district');

    function province() {
        function getProvinces(_selector) {
            if (_selector == "provinces") {
                return [{
                    "_id_": 1,
                    "name": "Kigali City",
                    "value": "kigali"
                }, {
                    "_id_": 2,
                    "name": "Southern Province",
                    "value": "southern_province"
                }, {
                    "_id_": 3,
                    "name": "Northern Province",
                    "value": "northern_province"
                }, {
                    "_id_": 4,
                    "name": "Western Province",
                    "value": "western_province"
                }, {
                    "_id_": 5,
                    "name": "Eastern Province",
                    "value": "eastern_province"
                }, ];
            } else {
                return [{
                    "_id_": 1,
                    "name": "Gasabo",
                    "value": "Gasabo",
                    "province": 1
                }, {
                    "_id_": 2,
                    "name": "Nyagatare",
                    "value": "Nyagatare",
                    "province": 5
                }, {
                    "_id_": 3,
                    "name": "Gatsibo",
                    "value": "Gatsibo",
                    "province": 5
                }, {
                    "_id_": 4,
                    "name": "Rusizi",
                    "value": "Rusizi",
                    "province": 4
                }, {
                    "_id_": 5,
                    "name": "Rubavu",
                    "value": "Rubavu",
                    "province": 4
                }, {
                    "_id_": 6,
                    "name": "Gicumbi",
                    "value": "Gicumbi",
                    "province": 3
                }, {
                    "_id_": 7,
                    "name": "Nyamasheke",
                    "value": "Nyamasheke",
                    "province": 4
                }, {
                    "_id_": 8,
                    "name": "Musanze",
                    "value": "Musanze",
                    "province": 3
                }, {
                    "_id_": 9,
                    "name": "Bugesera",
                    "value": "Bugesera",
                    "province": 5
                }, {
                    "_id_": 10,
                    "name": "Kayonza",
                    "value": "Kayonza",
                    "province": 5
                }, {
                    "_id_": 11,
                    "name": "Kamonyi",
                    "value": "Kamonyi",
                    "province": 2
                }, {
                    "_id_": 12,
                    "name": "Nyamagabe",
                    "value": "Nyamagabe",
                    "province": 2
                }, {
                    "_id_": 13,
                    "name": "Ngoma",
                    "value": "Ngoma",
                    "province": 5
                }, {
                    "_id_": 14,
                    "name": "Gakenke",
                    "value": "Gakenke",
                    "province": 3
                }, {
                    "_id_": 15,
                    "name": "Kirehe",
                    "value": "Kirehe",
                    "province": 5
                }, {
                    "_id_": 16,
                    "name": "Burera",
                    "value": "Burera",
                    "province": 3
                }, {
                    "_id_": 17,
                    "name": "Ngororero",
                    "value": "Ngororero",
                    "province": 4
                }, {
                    "_id_": 18,
                    "name": "Karongi",
                    "value": "Karongi",
                    "province": 4
                }, {
                    "_id_": 19,
                    "name": "Huye",
                    "value": "Huye",
                    "province": 2
                }, {
                    "_id_": 20,
                    "name": "Nyanza",
                    "value": "Nyanza",
                    "province": 2
                }, {
                    "_id_": 21,
                    "name": "Rutsiro",
                    "value": "Rutsiro",
                    "province": 4
                }, {
                    "_id_": 22,
                    "name": "Gisagara",
                    "value": "Gisagara",
                    "province": 2
                }, {
                    "_id_": 23,
                    "name": "Ruhango",
                    "value": "Ruhango",
                    "province": 2
                }, {
                    "_id_": 24,
                    "name": "Kicukiro",
                    "value": "Kicukiro",
                    "province": 1
                }, {
                    "_id_": 25,
                    "name": "Muhanga",
                    "value": "Muhanga",
                    "province": 2
                }, {
                    "_id_": 26,
                    "name": "Rwamagana",
                    "value": "Rwamagana",
                    "province": 5
                }, {
                    "_id_": 27,
                    "name": "Nyabihu",
                    "value": "Nyabihu",
                    "province": 4
                }, {
                    "_id_": 28,
                    "name": "Nyaruguru",
                    "value": "Nyaruguru",
                    "province": 2
                }, {
                    "_id_": 29,
                    "name": "Rulindo",
                    "value": "Rulindo",
                    "province": 3
                }, {
                    "_id_": 30,
                    "name": "Nyarugenge",
                    "value": "Nyarugenge",
                    "province": 1
                }, ];

            }
        }

        return {
            getProvinces: getProvinces
        }
    }

})();