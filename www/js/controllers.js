angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

})

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    getArray: function(key) {
      return JSON.parse($window.localStorage[key] || '[]');
    },
    setArray: function(key, value) {
      this.setObject(key, value);
    }
  }
}])

.controller('HomeCtrl', function($scope, $localstorage) {
  $scope.defaultSurahs = [
    { title: 'Al-Ghashiyah', id: 1 },
    { title: 'Al-Fajr', id: 2 },
    { title: 'Al-Balad', id: 3 },
    { title: 'Ash-Shams', id: 4 },
    { title: 'Al-Lail', id: 5 },
    { title: 'Ad-Dhuha', id: 6 },
    { title: 'ash-Sharh', id: 7 },
    { title: 'al-Teen', id: 8 },
    { title: 'al-Alaq', id: 9 },
    { title: 'al-Qadr', id: 10 },
    { title: 'al-Bayyinah', id: 11 },
    { title: 'Az-Zalzala', id: 12 },
    { title: 'al-Aadiyaat', id: 13 },
    { title: 'al-Qaariah', id: 14 },
    { title: 'at-Takaathur', id: 15 },
    { title: 'al-Asr', id: 16 },
    { title: 'al-Humazah', id: 17 },
    { title: 'al-Feel', id: 18 },
    { title: 'Quraish', id: 19 },
    { title: 'al-Maa`oon', id: 20 },
    { title: 'al-Kauthar', id: 21 },
    { title: 'al-Kaafiroon', id: 22 },
    { title: 'an-naSr', id: 23 },
    { title: 'Al-Masad', id: 24 },
    { title: 'al-ikhlaaS', id: 25 },
    { title: 'al-Falaq', id: 26 },
    { title: 'an-Naas', id: 27 }
  ];
  
  // Get the array from localStorage
  $scope.surahs = $localstorage.getArray('surahs');
  
  // If the first run, set the localStorage to the default
  if ($scope.surahs.length === 0) {
      $scope.surahs = $scope.defaultSurahs;
      $localstorage.setArray('surahs',$scope.surahs);
  }
  
  $scope.markRead = function(index, rating) {
    var surah = $scope.surahs[index];

    // Set reading time
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    surah.lastRead = mm + '/' + dd + '/' + yyyy;

    // Remove from current location
    $scope.surahs.splice(index, 1);

    // Determine next location based on rating
    switch(rating) {
        case 'poor':
            $scope.surahs.splice(5, 0, surah);
            break;
        case 'weak':
            $scope.surahs.splice(10, 0, surah);
            break;
        case 'okay':
            $scope.surahs.splice(15, 0, surah);
            break;
        default:
            $scope.surahs.push(surah);
    }

    // Save back to localStorage
    $localstorage.setArray('surahs',$scope.surahs);
  };

})

