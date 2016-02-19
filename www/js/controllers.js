angular.module('hifzTracker.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

})

.controller('HomeCtrl', function($scope, $localstorage, $ionicPopup, $ionicModal, Surahs) {
  $scope.view = {};
  
  // Get the array from localStorage
  $scope.surahs = $localstorage.getArray('surahs');
  
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

  $scope.addWird = function(wird) {
    $scope.surahs.unshift(wird);

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

	// Add Wird modal
  $scope.addWirdDialog = function() {
	  $ionicModal.fromTemplateUrl('templates/add-wird.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modal = modal;
			$scope.allSurahs = Surahs.getAllSurahs();
	    $scope.modal.show();
	  });
  };


	// Read Wird modal
  $scope.openSurah = function(surah) {
	  $ionicModal.fromTemplateUrl('templates/quran-page.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modal = modal;
	    $scope.surah = surah;
	    $scope.modal.show();
	  });
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
});