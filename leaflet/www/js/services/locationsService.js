angular.module('starter').factory('LocationsService', [ function() {

  var locationsObj = {};

  locationsObj.savedLocations = [

    {
      name : "Berisso",
      lat : -34.878456,
      lng : -57.887499
    },
    {
      name : "La Plata",
      lat : -34.922635,
      lng : -57.954287
    },
    {
      name : "Ensenada",
      lat : -34.865955,
      lng : -57.909945
    }

  ];

  return locationsObj;

}]);
