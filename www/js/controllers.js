angular.module('hifzTracker.controllers', [])

	.controller('AppCtrl', ['$scope', '$ionicModal', 'UserService',
		function ($scope, $ionicModal, UserService) {

			$scope.users = UserService.getAllUsers();
			$scope.currentUser = UserService.getCurrentUser();

			$scope.setCurrentUser = function (user) {
				$scope.currentUser = UserService.setCurrentUser(user);
			};

			$scope.addUser = function (newUser) {
				if (!newUser) return;

				UserService.addUser(newUser);
				// If this is the first user, set it as current
				if (!$scope.currentUser) { $scope.currentUser = newUser; }

				// Set the user as the currentUser
				$scope.currentUser = UserService.setCurrentUser(newUser);
				// Close modal
				$scope.modal.hide();
			};

			// Add User modal
			$scope.addUserDialog = function () {
				$ionicModal.fromTemplateUrl('templates/add-user.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function (modal) {
					$scope.modal = modal;
					$scope.modal.show();
				});
			};

			$scope.moveItem = function (user, fromIndex, toIndex) {
				$scope.users.splice(fromIndex, 1);
				$scope.users.splice(toIndex, 0, user);
				UserService.saveAllUsers($scope.users);
			};

		}])

	.controller('HomeCtrl', ['$rootScope', '$scope', '$ionicPopup', '$ionicModal', 'Surahs', 'UserService',
		function ($rootScope, $scope, $ionicPopup, $ionicModal, Surahs, UserService) {

			$scope.view = {};

			// Get the array of users and currentUser from UserService
			$scope.users = UserService.getAllUsers();
			$scope.currentUser = UserService.getCurrentUser();
			$rootScope.$on('currentUserChanged', function (event, newCurrentUser) {
				$scope.currentUser = newCurrentUser;
			});

			$scope.markRead = function (index, rating) {
				var surah = $scope.currentUser.wirds[index];

				// Set reading time
				var today = new Date();
				var dd = today.getDate();
				var mm = today.getMonth() + 1; //January is 0!
				var yyyy = today.getFullYear();

				surah.lastRead = mm + '/' + dd + '/' + yyyy;

				// Remove from current location
				$scope.currentUser.wirds.splice(index, 1);

				// Determine next location based on rating
				switch (rating) {
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

				// Save user
				UserService.saveUser($scope.currentUser);
			};

			$scope.addUser = function (newUser) {
				if (!newUser) return;

				UserService.addUser(newUser);
				// If this is the first user, set it as current
				if (!$scope.currentUser) { $scope.currentUser = newUser; }

				// Close modal
				$scope.modal.hide();
			};

			$scope.addWird = function (wird) {
				$scope.currentUser.wirds.unshift(wird);
				// Save user
				UserService.saveUser($scope.currentUser);
			};

			$scope.removeWird = function (index) {
				var surah = $scope.currentUser.wirds[index];
				var confirmPopup = $ionicPopup.confirm({
					title: 'Delete confirmation',
					template: 'Are you sure you want to delete <b>' + surah.title + '</b>?'
				});

				confirmPopup.then(function (res) {
					if (res) {
            $scope.currentUser.wirds.splice(index, 1);
            // Save user
            UserService.saveUser($scope.currentUser);
					}
				});
			};

			// Add User modal
			$scope.addUserDialog = function () {
				$ionicModal.fromTemplateUrl('templates/add-user.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function (modal) {
					$scope.modal = modal;
					$scope.modal.show();
				});
			};

			// Add Wird modal
			$scope.addWirdDialog = function () {
				$ionicModal.fromTemplateUrl('templates/add-wird.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function (modal) {
					$scope.modal = modal;
					$scope.allSurahs = Surahs.getAllSurahs();
					$scope.modal.show();
				});
			};


			// Read Wird modal
			$scope.openWird = function (wird) {
				$ionicModal.fromTemplateUrl('templates/wird-page.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function (modal) {
					$scope.modal = modal;
					$scope.wird = wird;
					$scope.activePage = wird.endPage - wird.startPage;
					$scope.newArray = function (length) {
						return new Array(length);
					};
					$scope.modal.show();
				});
			};

			$scope.closeModal = function () {
				$scope.modal.hide();
			};
			//Cleanup the modal when we're done with it!
			$scope.$on('$destroy', function () {
				$scope.modal.remove();
			});
		}]);