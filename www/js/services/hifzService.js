/**
 * @ngdoc service
 * @name hifzService
 * @description
 * # hifzService
 * Service in the hifzTracker.services
 * Central location for sharedState information.
 */
app.factory("hifzService", ['$rootScope', '$window', '$translate', '$cordovaFile', '$q', 'ionicToast', '$cordovaFileTransfer', '$cordovaZip',
function($rootScope, $window, $translate, $cordovaFile, $q, ionicToast, $cordovaFileTransfer, $cordovaZip) {
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
		},

		getUsers: function() {
			return this.getArray('users');
		},
		saveUser: function(user) {
			var users = this.getUsers();

			if (user.id) {
				var userIndex = users.indexOf(users.find(function(u) { return u.id == user.id; }));
				if (userIndex >= 0) {
					// Updating existing user
					users[userIndex] = user;
					this.setArray('users', users);
					this.backup()
					return user;
				} else {
					// User is being restored
					users.push(user);
					this.setArray('users', users);
					return user;
				}
			} else {
				// User is new: generate an id and create user
				var lastId = users.map(function(u) { return u.id; }).sort().pop();
				user.id = lastId + 1;
				users.push(user);
				this.setArray('users', users);
				this.switchUser(user.id);
				this.backup()
				return user;
			}
		},
		deleteUser: function(user) {
			var users = this.getUsers();

			if (user.id) {
				var userIndex = users.indexOf(users.find(function(u) { return u.id == user.id; }));
				if (userIndex >= 0) {
					users.splice(userIndex, 1);
					this.setArray('users', users);
					return this.switchUser();
				} else {
					// This should never happen
				}
			}
		},
		getCurrentLang: function() {
			var currentLang = this.getObject('currentLang');
			if (!currentLang.code) {
				var preferredCode = $translate.preferredLanguage();
				var supportedCodes = allLanguages.map(function(language) { return language.code; });
				var preferredIndex = supportedCodes.indexOf(preferredCode);
				currentLang = preferredIndex < 0 ? allLanguages[0] : allLanguages[preferredIndex];
				this.setObject('currentLang', currentLang);
			}
			$translate.use(currentLang.code);
			return currentLang;
		},
		getCurrentTheme: function() {
			var currentTheme = this.getObject('currentTheme');
			if (!currentTheme.class) {
				currentTheme = allThemes[0];
				this.setObject('currentTheme', currentTheme);
			}
			return currentTheme;
		},
		getCurrentId: function() {
			var currentId = parseInt(this.get('currentId', 0));
			// Select first user if currentId was never set
			if (currentId === 0) {
				var users = this.getUsers();
				currentId = users.length ? users[0].id : 0;
				this.set('currentId', currentId);
			}
			return currentId;
		},
		rateWird: function(index, rating, user) {
			var wird = user.wirds[index];

			// Set reading time
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0!
			var yyyy = today.getFullYear();

			wird.lastRead = mm + '/' + dd + '/' + yyyy;

			// Remove from current location
			user.wirds.splice(index, 1);

			// Determine next location based on rating
			switch (rating) {
				case 'POOR':
					wird.rating = 'POOR';
					var position = Math.floor(user.wirds.length * 0.25);
					user.wirds.splice(position, 0, wird);
					break;
				case 'WEAK':
					wird.rating = 'WEAK';
					var position = Math.floor(user.wirds.length * 0.50);
					user.wirds.splice(position, 0, wird);
					break;
				case 'OKAY':
					wird.rating = 'OKAY';
					var position = Math.floor(user.wirds.length * 0.75);
					user.wirds.splice(position, 0, wird);
					break;
				default:
					wird.rating = 'PERFECT';
					user.wirds.push(wird);
			}

			return this.saveUser(user);
		},
		addWird: function(wird, user) {
			user.wirds = user.wirds || [];
			user.wirds.unshift(wird);
			return this.saveUser(user);
		},
		removeWird: function(index, user) {
			user.wirds.splice(index, 1);
			return this.saveUser(user);
		},
		switchUser: function(userId) {
			var users = this.getUsers();
			var userIds = users.length ? users.map(function(user) { return user.id; }): [];

			// Select a default userId if no id was provided or it is invalid
			if (!userId && userIds.indexOf(userId) < 0) {
				userId = userIds.length ? userIds[0] : 0;
			}

			this.set('currentId', userId);
			return userId;
		},
		setLanguage: function(languageId) {
			var currentLang = this.getCurrentLang();
			// Make sure the languageId is valid
			if (languageId) {
				var languageIds = allLanguages.map(function(lang) { return lang.id; });
				if (languageIds.indexOf(languageId) >= 0) {
					currentLang = allLanguages.find(function(lang) { return lang.id === languageId; });
					this.setObject('currentLang', currentLang);
				}
			}
			$translate.use(currentLang.code);
			return currentLang;
		},
		setTheme: function(themeId) {
			var currentTheme = this.getCurrentTheme();
			// Make sure the themeId is valid
			if (themeId) {
				var themeIds = allThemes.map(function(theme) { return theme.id; });
				if (themeIds.indexOf(themeId) >= 0) {
					currentTheme = allThemes.find(function(theme) { return theme.id === themeId; });
					this.setObject('currentTheme', currentTheme);
				}
			}
			return currentTheme;
		},
		requestStoragePermission: function() {
			var deferred = $q.defer();

			if (typeof cordova === 'undefined') {
				deferred.resolve();
			} else {
				cordova.plugins.diagnostic.requestRuntimePermission(function(status) {
					switch (status) {
						case cordova.plugins.diagnostic.runtimePermissionStatus.GRANTED:
							break;
						case cordova.plugins.diagnostic.runtimePermissionStatus.NOT_REQUESTED:
							break;
						case cordova.plugins.diagnostic.runtimePermissionStatus.DENIED:
							break;
						case cordova.plugins.diagnostic.runtimePermissionStatus.DENIED_ALWAYS:
							ionicToast.show("Permission to access files was permenantly denied, please give access in phone settings", 'bottom', true, 1000);
							break;
					}
					deferred.resolve();
				}, function(error) {
					console.error("The following error occurred: " + error);
				}, cordova.plugins.diagnostic.runtimePermission.READ_EXTERNAL_STORAGE);
			}

			return deferred.promise;
		},
		backup: function() {
			if (typeof cordova === 'undefined') { return; }
			var allUsers = this.getUsers();

			// Save location
			$cordovaFile.createDir(cordova.file.externalRootDirectory, "hifzTracker", false);
			var targetPath = cordova.file.externalRootDirectory + "/hifzTracker/";

			$cordovaFile.writeFile(targetPath, 'hifz.bkp', allUsers, true);
		},
		checkBackup: function() {
			var deferred = $q.defer();

			if (typeof cordova !== 'undefined') {
				var targetPath = cordova.file.externalRootDirectory + "/hifzTracker/";
				$cordovaFile.checkFile(targetPath, 'hifz.bkp')
					.then(function(file) {
						deferred.resolve(true);
					}, function(error) {
						deferred.resolve(false);
					});
			} else {
				deferred.resolve(false);
			}

			return deferred.promise;
		},
		restore: function(usersString) {
			var self = this;
			var deferred = $q.defer();

			if (typeof cordova !== 'undefined') {
				var targetPath = cordova.file.externalRootDirectory + "/hifzTracker/";
				$cordovaFile.readAsText(targetPath, 'hifz.bkp')
					.then(function(usersString) {
						self._saveUsersFromString(usersString);
						self.checkBackup().then(function(bkpExists) {
							deferred.resolve(bkpExists);
						});
					}, function() {
						deferred.reject();
					});
			} else if (usersString) {
				self._saveUsersFromString(usersString);
				self.checkBackup().then(function(bkpExists) {
					deferred.resolve(bkpExists);
				});
			} else {
				deferred.reject();
			}

			return deferred.promise;
		},
		getDownloadStatus: function () {
			// 0: Not downloaded
			// 1: Downloaded but not unzipped
			// 2: Downloaded and unzipped
			var status = parseInt(this.get('downloadStatus', 0));
			return status;
		},
		downloadOrUnzip: function () {
			var deferred = $q.defer();
			var scope = this;

			// Background process information
			cordova.plugins.backgroundMode.setDefaults({
					title:  'Hifz Tracker',
					text:   'Downloading Quran Pages'
			});

			// Enable background mode
			cordova.plugins.backgroundMode.enable();

			var status = scope.getDownloadStatus();
			if (status === 0) {
				console.log("Not downloaded. Starting download");
				scope.download().then(function () {
					cordova.plugins.backgroundMode.disable();
					deferred.resolve();
				}, function () {
					cordova.plugins.backgroundMode.disable();
					deferred.reject();
				});
			} else if (status === 1) {
				console.log("Not unzipped. Starting unzip");
				scope.unzip().then(function () {
					cordova.plugins.backgroundMode.disable();
					deferred.resolve();
				}, function () {
					cordova.plugins.backgroundMode.disable();
					deferred.reject();
				});
			} else {
				console.log("Already downloaded and unzipped!");
				cordova.plugins.backgroundMode.disable();
				deferred.resolve();
			}

			return deferred.promise;
		},
		download: function () {
			var deferred = $q.defer();
			var scope = this;

			// File for download
			var url = "http://android.quran.com/data/zips/images_800.zip";

			// File name only
			var filename = url.split("/").pop();

			// Save location
			$cordovaFile.createDir(cordova.file.externalRootDirectory, "hifzTracker", false);
			var targetPath = cordova.file.externalRootDirectory + "/hifzTracker/" + filename;

			$cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
				scope.set('downloadStatus', 1);
				console.log('Download Success... Unzipping');
				scope.unzip(filename).then(function () {
					deferred.resolve();
				}, function () {
					deferred.reject();
				});
			}, function (error) {
				$cordovaFile.removeRecursively(cordova.file.externalRootDirectory, "hifzTracker");
				deferred.reject();
			}, function (progress) {
				$rootScope.$emit('downloadProgressChanged', Math.floor(100 * progress.loaded / progress.total));
			});

			return deferred.promise;
		},
		unzip: function (filename) {
			var deferred = $q.defer();
			var scope = this;

			// Unzip location
			var targetPath = cordova.file.externalRootDirectory + "/hifzTracker/" + filename;

			$cordovaZip
				.unzip(
					targetPath,
					cordova.file.externalRootDirectory + "/hifzTracker/"
				).then(function () {
					console.log('Unzip Success...');
					scope.set('downloadStatus', 2);
					$cordovaFile.removeFile(cordova.file.externalRootDirectory + "/hifzTracker/", filename);
					deferred.resolve();
				}, function () {
					// Failed unzip.. probably a corrupt download
					scope.set('downloadStatus', 0);
					deferred.reject();
				}, function (progress) {
					$rootScope.$emit('unzipProgressChanged', Math.floor(100 * progress.loaded / progress.total));
				});

			return deferred.promise;
		},
		_saveUsersFromString: function(usersString) {
			var self = this;

			var allUsers = JSON.parse(usersString);
			if (allUsers instanceof Array && allUsers.length) {
				allUsers.forEach(function(user) {
					self.saveUser(user);
				});
			}
		}
	}
}]);