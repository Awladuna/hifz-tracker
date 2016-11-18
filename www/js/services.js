_array_findById = function (arr, id) {
	for (var el in arr) {
		// hasOwnProperty ensures prototypes aren't considered
		if (arr.hasOwnProperty(el)) {
			if (arr[el].id == id) return arr[el];
		}
	}

	return undefined;
}

angular.module('hifzTracker.services', [])

	.factory('$localstorage', ['$window', function ($window) {
		return {
			set: function (key, value) {
				$window.localStorage[key] = value;
			},
			get: function (key, defaultValue) {
				return $window.localStorage[key] || defaultValue;
			},
			setObject: function (key, value) {
				$window.localStorage[key] = JSON.stringify(value);
			},
			getObject: function (key) {
				return JSON.parse($window.localStorage[key] || '{}');
			},
			getArray: function (key) {
				return JSON.parse($window.localStorage[key] || '[]');
			},
			setArray: function (key, value) {
				this.setObject(key, value);
			}
		}
	}])

	.factory('preferencesService', ['$rootScope', '$localstorage', function ($rootScope, $localstorage) {
		return {
			getAllThemes: function () {
				return this._allThemes;
			},
			getTheme: function () {
				var theme = $localstorage.getObject('theme');
				if (!theme.id) {
					theme = this._allThemes[0];
				}
				return theme;
			},
			setTheme: function (theme) {
				var instance = _array_findById(this._allThemes, theme.id);
				if (instance) {
					$localstorage.setObject('theme', instance);
					$rootScope.$emit('themeChanged', instance);
					return instance;
				} else {
					return this.getTheme();
				}
			}
		}
	}])

	.factory('LanguageService', ['$translate', '$localstorage', function ($translate, $localstorage) {
		return {
			getAll: function () {
				return this._allLanguages;
			},
			getPreferred: function () {
				var preferredLanguage = $localstorage.getObject('preferredLanguage');

				if (!preferredLanguage.code) {
					var preferredCode = $translate.preferredLanguage();
					var supportedCodes = this._allLanguages.map(function (l) { return l.code; });
					var preferredIndex = supportedCodes.indexOf(preferredCode);
					preferredLanguage = preferredIndex < 0 ? this._allLanguages[0] : this._allLanguages[preferredIndex];
					$localstorage.setObject('preferredLanguage', preferredLanguage);
				}

				$translate.use(preferredLanguage.code);
				return preferredLanguage;
			},
			setPreferred: function (language) {
				var instance = _array_findById(this._allLanguages, language.id);
				if (instance) {
					$translate.use(instance.code);
					$localstorage.setObject('preferredLanguage', instance);
					return instance;
				} else {
					return this.getPreferred();
				}
			}
		}
	}])

	.factory('UserService', ['$rootScope', '$localstorage', 'User', function ($rootScope, $localstorage, User) {
		return {
			_pool: [],
			_current: null,
			_retrieveInstance: function (user) {
				if (!user.id) {
					console.error("UserService was passed an invalid user object");
					return;
				}

				var instance = _array_findById(this._pool, user.id);

				if (instance) {
					instance.setData(user);
				} else {
					instance = new User(user);
					this._pool.push(instance);
				}

				return instance;
			},
			getAllUsers: function () {
				var scope = this;

				$localstorage.getArray('users').forEach(function (user) {
					scope._retrieveInstance(user);
				});

				return this._pool;
			},
			getCurrentUser: function () {
				var currentId = this._current ? this._current.id : $localstorage.get('currentId', 0);
				var instance = _array_findById(this._pool, currentId);
				this._current = instance || this._pool[0];
				$rootScope.$emit('currentUserChanged', this._current);
				return this._current;
			},
			setCurrentUser: function (user) {
				this._current = this._retrieveInstance(user);
				$localstorage.set('currentId', this._current.id);
				$rootScope.$emit('currentUserChanged', this._current);
				return this._current;
			},
			saveUser: function (user) {
				var instance = _array_findById(this._pool, user.id);
				if (instance) {
					this._retrieveInstance(user);
					$localstorage.setArray('users', this._pool);
				} else {
					this.addUser(user);
				}
			},
			addUser: function (user) {
				// Get all user ids and sort them
				var ids = this._pool.map(function (u) {
					return u.id;
				}).sort();
				// Set the new user Id to the next number
				user.id = ids[ids.length - 1] + 1 || 1;
				user.wirds = [];

				this._retrieveInstance(user);
				$localstorage.setArray('users', this._pool);
			},
			saveAllUsers: function (users) {
				var scope = this;
				users.forEach(function (user) {
					scope.saveUser(user);
				});
				$rootScope.$emit('currentUserChanged', scope.getCurrentUser());
			},
			deleteUser: function (user) {
				var instance = this._retrieveInstance(user);
				var index = this._pool.indexOf(instance);
				this._pool.splice(index, 1);
				$localstorage.setArray('users', this._pool);
			}
		}
	}])

	.factory('Wirds', ['$rootScope', '$cordovaFile', '$cordovaFileTransfer', '$localstorage', '$cordovaZip', '$q',
		function ($rootScope, $cordovaFile, $cordovaFileTransfer, $localstorage, $cordovaZip, $q) {
			return {
				getAllSurahs: function () {
					return allSurahs;
				},
				getSurahById: function (id) {
					return _array_findById(allSurahs, id);
				},
				getAllQuarters: function () {
					return allQuarters;
				},
				getQuarterById: function (id) {
					return _array_findById(allQuarters, id);
				},
				getDownloadStatus: function () {
					// 0: Not downloaded
					// 1: Downloaded but not unzipped
					// 2: Downloaded and unzipped
					var status = parseInt($localstorage.get('downloadStatus', 0));
					return status;
				},
				downloadOrUnzip: function () {
					var deferred = $q.defer();
					var scope = this;

					// Background process information
					cordova.plugins.backgroundMode.setDefaults({
						title: 'Hifz Tracker',
						text: 'Downloading Quran Pages'
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



					// File name only
					var filename = url.split("/").pop();

					// Save location
					$cordovaFile.createDir(cordova.file.externalRootDirectory, "hifzTracker", false);
					var targetPath = cordova.file.externalRootDirectory + "/hifzTracker/" + filename;

					$cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
						$localstorage.set('downloadStatus', 1);
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
							$localstorage.set('downloadStatus', 2);
							$cordovaFile.removeFile(cordova.file.externalRootDirectory + "/hifzTracker/", filename);
							deferred.resolve();
						}, function () {
							// Failed unzip.. probably a corrupt download
							$localstorage.set('downloadStatus', 0);
							deferred.reject();
						}, function (progress) {
							$rootScope.$emit('unzipProgressChanged', Math.floor(100 * progress.loaded / progress.total));
						});

					return deferred.promise;
				}
			}
		}])


	.factory('BackupService', ['$localstorage', 'UserService', '$cordovaFile', function ($localstorage, UserService, $cordovaFile) {
		return {
			backup: function () {
				var allUsers = JSON.stringify(UserService.getAllUsers());

				// Save location
				$cordovaFile.createDir(cordova.file.externalRootDirectory, "hifzTracker", false);
				var targetPath = cordova.file.externalRootDirectory + "/hifzTracker/";

				$cordovaFile.writeFile(targetPath, 'hifz.bkp', allUsers, true);
			},
			backupExists: function () {
				var deferred = $q.defer();

				var targetPath = cordova.file.externalRootDirectory + "/hifzTracker/";
				$cordovaFile.checkFile(targetPath, 'hifz.bkp')
					.then(function (file) {
						deferred.resolve();
					}, function (error) {
						deferred.reject();
					});

				return deferred.promise;
			},
			restore: function () {
				var targetPath = cordova.file.externalRootDirectory + "/hifzTracker/";

				$cordovaFile.readAsText(targetPath, 'hifz.bkp')
					.then(function (content) {
						var allUsers = JSON.parse(content);
						UserService.saveAllUsers(allUsers);
					});
			},
		}
	}]);
