/**
 * @ngdoc service
 * @name hifzService
 * @description
 * # hifzService
 * Service in the hifzTracker.services
 * Central location for sharedState information.
 */
app.factory("hifzService", ['$window', '$translate', '$cordovaFile', '$q',
	function ($window, $translate, $cordovaFile, $q) {
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
			},

			getUsers: function () {
				return this.getArray('users');
			},
			saveUser: function (user) {
				var users = this.getUsers();

				if (user.id) {
					var userIndex = users.indexOf(users.find(function (u) { return u.id == user.id; }));
					if (userIndex >= 0) {
						// Updating existing user
						users[userIndex] = user;
						this.setArray('users', users);
						return user;
					} else {
						// User is being restored
						users.push(user);
						this.setArray('users', users);
						return user;
					}
				} else {
					// User is new: generate an id and create user
					var lastId = users.map(function (u) { return u.id; }).sort().pop();
					user.id = lastId + 1;
					users.push(user);
					this.setArray('users', users);
					this.switchUser(user.id);
					return user;
				}
			},
			deleteUser: function (user) {
				var users = this.getUsers();

				if (user.id) {
					var userIndex = users.indexOf(users.find(function (u) { return u.id == user.id; }));
					if (userIndex >= 0) {
						users.splice(userIndex, 1);
						this.setArray('users', users);
						return users;
					} else {
						// This should never happen
					}
				}
			},
			getCurrentLang: function () {
				var currentLang = this.getObject('currentLang');
				if (!currentLang.code) {
					var preferredCode = $translate.preferredLanguage();
					var supportedCodes = allLanguages.map(function (language) { return language.code; });
					var preferredIndex = supportedCodes.indexOf(preferredCode);
					currentLang = preferredIndex < 0 ? allLanguages[0] : allLanguages[preferredIndex];
					this.setObject('currentLang', currentLang);
				}
				$translate.use(currentLang.code);
				return currentLang;
			},
			getCurrentTheme: function () {
				var currentTheme = this.getObject('currentTheme');
				if (!currentTheme.class) {
					currentTheme = allThemes[0];
					this.setObject('currentTheme', currentTheme);
				}
				return currentTheme;
			},
			getCurrentId: function () {
				var currentId = parseInt(this.get('currentId', 0));
				// Select first user if currentId was never set
				if (currentId === 0) {
					var users = this.getUsers();
					currentId = users.length ? users[0].id : 0;
					this.set('currentId', currentId);
				}
				return currentId;
			},
			rateWird: function (index, rating, user) {
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
			addWird: function (wird, user) {
				user.wirds = user.wirds || [];
				user.wirds.unshift(wird);
				return this.saveUser(user);
			},
			removeWird: function (index, user) {
				user.wirds.splice(index, 1);
				return this.saveUser(user);
			},
			switchUser: function (userId) {
				var currentId = this.get('currentId', 0);
				// Make sure the userId is valid
				if (userId) {
					var userIds = this.getUsers().map(function (user) { return user.id; });
					if (userIds.indexOf(userId) >= 0) {
						currentId = userId;
						this.set('currentId', currentId);
					}
				}
				return currentId;
			},
			setLanguage: function (languageId) {
				var currentLang = this.getCurrentLang();
				// Make sure the languageId is valid
				if (languageId) {
					var languageIds = allLanguages.map(function (lang) { return lang.id; });
					if (languageIds.indexOf(languageId) >= 0) {
						currentLang = allLanguages.find(function (lang) { return lang.id === languageId; });
						this.setObject('currentLang', currentLang);
					}
				}
				$translate.use(currentLang.code);
				return currentLang;
			},
			setTheme: function (themeId) {
				var currentTheme = this.getCurrentTheme();
				// Make sure the themeId is valid
				if (themeId) {
					var themeIds = allThemes.map(function (theme) { return theme.id; });
					if (themeIds.indexOf(themeId) >= 0) {
						currentTheme = allThemes.find(function (theme) { return theme.id === themeId; });
						this.setObject('currentTheme', currentTheme);
					}
				}
				return currentTheme;
			},
			backup: function () {
				var allUsers = this.getUsers();

				// Save location
				$cordovaFile.createDir(cordova.file.externalRootDirectory, "hifzTracker", false);
				var targetPath = cordova.file.externalRootDirectory + "/hifzTracker/";

				$cordovaFile.writeFile(targetPath, 'hifz.bkp', allUsers, true);
			},
			checkBackup: function () {
				var deferred = $q.defer();

				if (typeof cordova !== 'undefined') {
					var targetPath = cordova.file.externalRootDirectory + "/hifzTracker/";
					$cordovaFile.checkFile(targetPath, 'hifz.bkp')
						.then(function (file) {
							deferred.resolve();
						}, function (error) {
							deferred.reject();
						});
				} else {
					deferred.reject();
				}

				return deferred.promise;
			},
			restore: function (usersString) {
				var self = this;
				var deferred = $q.defer();

				if (typeof cordova !== 'undefined') {
					var targetPath = cordova.file.externalRootDirectory + "/hifzTracker/";
					$cordovaFile.readAsText(targetPath, 'hifz.bkp')
						.then(function (usersString) {
							self._saveUsersFromString(usersString);
							deferred.resolve();
						}, function() {
							deferred.reject();
						});
				} else {
					deferred.reject();
				}

				return deferred.promise;
			},
			_saveUsersFromString: function (usersString) {
				var self = this;

				var allUsers = JSON.parse(usersString);
				if (allUsers instanceof Array && allUsers.length) {
					allUsers.forEach(function (user) {
						self.saveUser(user);
					});
				}
			}
		}
	}]);