angular.module('hifzTracker.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

})

.controller('HomeCtrl', function($scope, $localstorage, $ionicPopup, $ionicModal) {
  $scope.view = {};
  $scope.defaultSurahs = [
    { title: 'Al-Ghashiyah', startPage: 592, endPage: 593, id: 1 },
    { title: 'Al-Fajr', startPage: 593, endPage: 594, id: 2 },
    { title: 'Al-Balad', startPage: 594, endPage: 595, id: 3 },
    { title: 'Ash-Shams', startPage: 595, endPage: 595, id: 4 },
    { title: 'Al-Lail', startPage: 595, endPage: 596, id: 5 },
    { title: 'Ad-Dhuha', startPage: 596, endPage: 596, id: 6 },
    { title: 'ash-Sharh', startPage: 596, endPage: 597, id: 7 },
    { title: 'al-Teen', startPage: 597, endPage: 597, id: 8 },
    { title: 'al-Alaq', startPage: 597, endPage: 598, id: 9 },
    { title: 'al-Qadr', startPage: 598, endPage: 598, id: 10 },
    { title: 'al-Bayyinah', startPage: 598, endPage: 599, id: 11 },
    { title: 'Az-Zalzala', startPage: 599, endPage: 599, id: 12 },
    { title: 'al-Aadiyaat', startPage: 599, endPage: 600, id: 13 },
    { title: 'al-Qaariah', startPage: 600, endPage: 600, id: 14 },
    { title: 'at-Takaathur', startPage: 600, endPage: 600, id: 15 },
    { title: 'al-Asr', startPage: 601, endPage: 601, id: 16 },
    { title: 'al-Humazah', startPage: 601, endPage: 601, id: 17 },
    { title: 'al-Feel', startPage: 601, endPage: 601, id: 18 },
    { title: 'Quraish', startPage: 602, endPage: 602, id: 19 },
    { title: 'al-Maa`oon', startPage: 602, endPage: 602, id: 20 },
    { title: 'al-Kauthar', startPage: 602, endPage: 602, id: 21 },
    { title: 'al-Kaafiroon', startPage: 603, endPage: 603, id: 22 },
    { title: 'an-naSr', startPage: 603, endPage: 603, id: 23 },
    { title: 'Al-Masad', startPage: 603, endPage: 603, id: 24 },
    { title: 'al-ikhlaaS', startPage: 604, endPage: 604, id: 25 },
    { title: 'al-Falaq', startPage: 604, endPage: 604, id: 26 },
    { title: 'an-Naas', startPage: 604, endPage: 604, id: 27 }
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
            surah.rating = 'Poor';
            $scope.surahs.splice(5, 0, surah);
            break;
        case 'weak':
            surah.rating = 'Weak';
            $scope.surahs.splice(10, 0, surah);
            break;
        case 'okay':
            surah.rating = 'Okay';
            $scope.surahs.splice(15, 0, surah);
            break;
        default:
            surah.rating = 'Perfect';
            $scope.surahs.push(surah);
    }

    // Save back to localStorage
    $localstorage.setArray('surahs',$scope.surahs);
  };

  $scope.addSurah = function(title) {
    var newId = $scope.surahs
        .map(function(s) { return s.id; })
        .sort()[$scope.surahs.length -1] + 1;

    $scope.surahs.unshift({ title: title, id: newId });

    // Save back to localStorage
    $localstorage.setArray('surahs',$scope.surahs);
    $scope.view.addingSurah = false;
  };

  $scope.removeSurah = function(index) {
    var surah = $scope.surahs[index];
    var confirmPopup = $ionicPopup.confirm({
        title: 'Delete confirmation',
        template: 'Are you sure you want to delete <b>' + surah.title + '</b>?'
    });

    confirmPopup.then(function(res) {
        if(res) {
            $scope.surahs.splice(index, 1);
            // Save back to localStorage
            $localstorage.setArray('surahs',$scope.surahs);
        }
    });
  };


  $ionicModal.fromTemplateUrl('templates/quran-page.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openSurah = function(surah) {
    $scope.surah = surah;
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
});