angular.module('hifzTracker.controllers', [])

	.controller('AppCtrl', ['$rootScope', '$scope', '$ionicModal', '$ionicPopup', 'UserService', 'LanguageService', 'preferencesService',
		function ($rootScope, $scope, $ionicModal, $ionicPopup, UserService, LanguageService, preferencesService) {
			$scope.view = {};
			$scope.users = UserService.getAllUsers();
			$scope.currentUser = UserService.getCurrentUser();
			$scope.languages = LanguageService.getAll();
			$scope.preferredLanguage = LanguageService.getPreferred();

			$scope.allThemes = preferencesService.getAllThemes();
			$scope.appTheme = preferencesService.getTheme();
			$rootScope.$on('themeChanged', function (event, newTheme) {
				$scope.appTheme = newTheme;
			});

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

			// Settings modal
			$scope.openSettings = function () {
				$ionicModal.fromTemplateUrl('templates/settings.html', {
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
					scope: $scope,
					template: '<span translate="DELETE_CONFIRMATION"></span> <b translate="{{editUser.name}}"></b>?'
				});

				confirmPopup.then(function (res) {
					if (res) {
						UserService.deleteUser($scope.editUser);
						$scope.currentUser = UserService.getCurrentUser();
						$scope.closeModal();
					}
				});
			};

			$scope.switchLanguage = function (language) {
				$scope.preferredLanguage = LanguageService.setPreferred(language);
			};

			$scope.setTheme = function(theme) {
				preferencesService.setTheme(theme);
			};

		}])

	.controller('HomeCtrl', ['$rootScope', '$scope', '$ionicPopup', '$ionicModal', '$ionicPopover', 'ionicToast', 'Wirds', 'UserService', 'preferencesService',
		function ($rootScope, $scope, $ionicPopup, $ionicModal, $ionicPopover, ionicToast, Wirds, UserService, preferencesService) {

			$scope.view = { limit: 10, wirdLimit: 20 };
			$scope.appTheme = preferencesService.getTheme();
			$rootScope.$on('themeChanged', function (event, newTheme) {
				$scope.appTheme = newTheme;
			});

			// Get the array of users and currentUser from UserService
			$scope.users = UserService.getAllUsers();
			$scope.currentUser = UserService.getCurrentUser();
			$rootScope.$on('currentUserChanged', function (event, newCurrentUser) {
				$scope.currentUser = newCurrentUser;
				$scope.view.limit = 10;
			});

			$scope.loadMoreData = function(limit, increment) {
				$scope.view[limit] += increment || 3;
				$scope.$broadcast('scroll.infiniteScrollComplete');
			};

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
					case 'POOR':
						surah.rating = 'POOR';
						var position = Math.floor($scope.currentUser.wirds.length * 0.25);
						$scope.currentUser.wirds.splice(position, 0, surah);
						break;
					case 'WEAK':
						surah.rating = 'WEAK';
						var position = Math.floor($scope.currentUser.wirds.length * 0.50);
						$scope.currentUser.wirds.splice(position, 0, surah);
						break;
					case 'OKAY':
						surah.rating = 'OKAY';
						var position = Math.floor($scope.currentUser.wirds.length * 0.75);
						$scope.currentUser.wirds.splice(position, 0, surah);
						break;
					default:
						surah.rating = 'PERFECT';
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
				$scope.view.limit++;
				$scope.view.wirdLimit++;
				// Save user
				UserService.saveUser($scope.currentUser);
				ionicToast.show('Added "' + wird.title + '"', 'bottom', false, 2500);
			};

			$scope.removeWird = function (index) {
				$scope.surah = $scope.currentUser.wirds[index];
				var confirmPopup = $ionicPopup.confirm({
					scope: $scope,
					template: '<span translate="DELETE_CONFIRMATION"></span> <b translate="{{surah.title}}"></b>?'
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

			// Add Wird popover
			$scope.addWirdDialog = function ($event) {
				$ionicPopover.fromTemplateUrl('templates/add-wird.html', {
					scope: $scope
				}).then(function (modal) {
					$scope.modal = modal;
					$scope.wirdTypes = ['SURAH', 'QUARTER'];
					$scope.allSurahs = Wirds.getAllSurahs();
					$scope.allQuarters = Wirds.getAllQuarters();
					$scope.modal.show($event);
				});
			};
			// Execute action on remove popover
			$scope.$on('popover.hidden', function() {
			$scope.view.wirdLimit = 20;
				delete $scope.view.wirdType;
			});

			$scope.closeModal = function () {
				if ($scope.modal) { $scope.modal.hide(); }
			};

		}]);