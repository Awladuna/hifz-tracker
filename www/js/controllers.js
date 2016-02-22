angular.module('hifzTracker.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

})

.controller('HomeCtrl', function($scope, $localstorage, $ionicPopup, $ionicModal, Surahs) {
  $scope.view = {};

  // Get the array of users from localStorage
  $scope.users = $localstorage.getArray('users');

	// Select the first user if exists
	$scope.currentUser = $scope.users[0];

  $scope.markRead = function(index, rating) {
    var surah = $scope.currentUser.wirds[index];

    // Set reading time
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    surah.lastRead = mm + '/' + dd + '/' + yyyy;

    // Remove from current location
    $scope.currentUser.wirds.splice(index, 1);

    // Determine next location based on rating
    switch(rating) {
        case 'poor':
            surah.rating = 'Poor';
            $scope.currentUser.wirds.splice(5, 0, surah);
            break;
        case 'weak':
            surah.rating = 'Weak';
            $scope.currentUser.wirds.splice(10, 0, surah);
            break;
        case 'okay':
            surah.rating = 'Okay';
            $scope.currentUser.wirds.splice(15, 0, surah);
            break;
        default:
            surah.rating = 'Perfect';
            $scope.currentUser.wirds.push(surah);
    }

    // Save back to localStorage
    $localstorage.setArray('users',$scope.users);
  };

  $scope.addUser = function(newUser) {
    if (!newUser) return;
    newUser.wirds = [];
    $scope.users.push(newUser);

    // If this is the first user, set it as current
    if (!$scope.currentUser) { $scope.currentUser = newUser; }

    // Save back to localStorage
    $localstorage.setArray('users',$scope.users);
    $scope.modal.hide();
  };

  $scope.addWird = function(wird) {
    $scope.currentUser.wirds.unshift(wird);
    // Save back to localStorage
    $localstorage.setArray('users',$scope.users);
  };

  $scope.removeWird = function(index) {
    var surah = $scope.currentUser.wirds[index];
    var confirmPopup = $ionicPopup.confirm({
        title: 'Delete confirmation',
        template: 'Are you sure you want to delete <b>' + surah.title + '</b>?'
    });

    confirmPopup.then(function(res) {
        if(res) {
            $scope.currentUser.wirds.splice(index, 1);
            // Save back to localStorage
            $localstorage.setArray('users',$scope.users);
        }
    });
  };

  // Add User modal
  $scope.addUserDialog = function() {
    $ionicModal.fromTemplateUrl('templates/add-user.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
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
  $scope.openWird = function(wird) {
	  $ionicModal.fromTemplateUrl('templates/wird-page.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modal = modal;
	    $scope.wird = wird;
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