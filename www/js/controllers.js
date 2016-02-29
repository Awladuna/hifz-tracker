angular.module('hifzTracker.controllers', [])

	.controller('AppCtrl', ['$scope', '$ionicModal', '$ionicPopup', 'UserService',
		function ($scope, $ionicModal, $ionicPopup, UserService) {
			$scope.view = {};
			$scope.users = UserService.getAllUsers();
			$scope.currentUser = UserService.getCurrentUser();

			$scope.setCurrentUser = function (user) {
				$scope.currentUser = UserService.setCurrentUser(user);
			};

			$scope.saveUser = function (user) {
				if (!user) return;

				UserService.saveUser(user);
				// If this is the first user, set it as current
				if (!$scope.currentUser) { $scope.currentUser = user; }

				// Set the user as the currentUser
				$scope.currentUser = UserService.setCurrentUser(user);
				// Close modal
				if ($scope.modal) { $scope.modal.hide(); }
			};

			// Add User modal
			$scope.userDialog = function (user) {
				$scope.editUser = user;
				$ionicModal.fromTemplateUrl('templates/user-dialog.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function (modal) {
					$scope.modal = modal;
					$scope.modal.show();
				});
			};

			$scope.closeModal = function () {
				if ($scope.modal) { $scope.modal.hide(); }
			};
			//Cleanup the modal when we're done with it!
			$scope.$on('$destroy', function () {
				$scope.modal.remove();
			});

			$scope.moveItem = function (user, fromIndex, toIndex) {
				$scope.users.splice(fromIndex, 1);
				$scope.users.splice(toIndex, 0, user);
				UserService.saveAllUsers($scope.users);
			};

			$scope.deleteUser = function () {
				var confirmPopup = $ionicPopup.confirm({
					title: 'Delete confirmation',
					template: 'Are you sure you want to delete <b>' + $scope.editUser.name + '</b>?'
				});

				confirmPopup.then(function (res) {
					if (res) {
						UserService.deleteUser($scope.editUser);
						$scope.currentUser = UserService.getCurrentUser();
						$scope.closeModal();
					}
				});
			};

		}])

	.controller('HomeCtrl', ['$rootScope', '$scope', '$ionicPopup', '$ionicModal', '$ionicPopover', 'ionicToast', 'Surahs', 'UserService',
		function ($rootScope, $scope, $ionicPopup, $ionicModal, $ionicPopover, ionicToast, Surahs, UserService) {

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

			$scope.saveUser = function (newUser) {
				if (!newUser) return;

				UserService.saveUser(newUser);
				// If this is the first user, set it as current
				if (!$scope.currentUser) { $scope.currentUser = newUser; }

				// Close modal
				if ($scope.modal) { $scope.modal.hide(); }
			};

			$scope.addWird = function (wird) {
				$scope.currentUser.wirds.unshift(wird);
				// Save user
				UserService.saveUser($scope.currentUser);
				ionicToast.show('Added "' + wird.title + '"', 'bottom', false, 2500);
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
				$ionicModal.fromTemplateUrl('templates/user-dialog.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function (modal) {
					$scope.modal = modal;
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
				if ($scope.modal) { $scope.modal.hide(); }
			};
			//Cleanup the modal when we're done with it!
			$scope.$on('$destroy', function () {
				if ($scope.modal) { $scope.modal.remove(); }
			});

			// Add Wird popover
			$scope.addWirdDialog = function ($event) {
				$ionicPopover.fromTemplateUrl('templates/add-wird.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function (modal) {
					$scope.modal = modal;
					$scope.allSurahs = Surahs.getAllSurahs();
					$scope.modal.show($event);
				});
			};

		}])

	.controller('SettingsCtrl', ['$scope', '$translate',
		function ($scope, $translate) {
			$scope.languages = [
				{
					name: "ARABIC",
					code: "ar"
				},
				{
					name: "ENGLISH",
					code: "en"
				}
			];

			$scope.switchLanguage = function (code) {
				$translate.use(code);
			};
		}]);