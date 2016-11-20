/**
 * @ngdoc service
 * @name stateService
 * @description
 * # stateService
 * Service in the hifzTracker.services
 * Central location for sharedState information.
 */
app.service('stateService', function ($rootScope, $log, $translate, User) {
		return {
			_state: {},
			_userReducers: function (action, users) {
				var scope = this;

				switch (action.type) {
					case INIT_STATE:
						users = {
							ids: [],
							list: {}
						};
						var length = action.payload.users ? action.payload.users.length : 0;
						for (var i = 0; i < length; i++) {
							var userData = action.payload.users[i];
							users.list[userData.id] = new User(userData);
							users.ids.push(userData.id);
						}
						return users;
					case RATE_WIRD:
						var surah = users.list[action.payload.currentId].wirds[action.payload.index];
						var currentUser = users.list[action.payload.currentId];

						// Set reading time
						var today = new Date();
						var dd = today.getDate();
						var mm = today.getMonth() + 1; //January is 0!
						var yyyy = today.getFullYear();

						surah.lastRead = mm + '/' + dd + '/' + yyyy;

						// Remove from current location
						currentUser.wirds.splice(action.payload.index, 1);

						// Determine next location based on rating
						switch (action.payload.rating) {
							case 'POOR':
								surah.rating = 'POOR';
								var position = Math.floor(currentUser.wirds.length * 0.25);
								currentUser.wirds.splice(position, 0, surah);
								break;
							case 'WEAK':
								surah.rating = 'WEAK';
								var position = Math.floor(currentUser.wirds.length * 0.50);
								currentUser.wirds.splice(position, 0, surah);
								break;
							case 'OKAY':
								surah.rating = 'OKAY';
								var position = Math.floor(currentUser.wirds.length * 0.75);
								currentUser.wirds.splice(position, 0, surah);
								break;
							default:
								surah.rating = 'PERFECT';
								currentUser.wirds.push(surah);
						}

						// TODO: Persist user

						return users;
					default:
						return users;
				}
			},
			_uiReducers: function (action, ui) {
				var scope = this;

				switch (action.type) {
					case INIT_STATE:
						ui = {
							currentId: action.payload.currentId,
							currentLang: action.payload.currentLang,
							limit: 3
						};

						// Select first user if currentId was never set
						if (ui.currentId === 0) {
							ui.currentId = action.payload.users.length ? action.payload.users[0].id : 0;
						}

						// Select the first language if currentLang was never set
						if (!ui.currentLang.code) {
							var preferredCode = $translate.preferredLanguage();
							var supportedCodes = allLanguages.map(function (language) { return language.code; });
							var preferredIndex = supportedCodes.indexOf(preferredCode);
							preferredLanguage = preferredIndex < 0 ? allLanguages[0] : allLanguages[preferredIndex];
							// TODO: Where should persisting the default language happen
							// storageService.setObject('preferredLanguage', preferredLanguage);
						}

						return ui;
					default:
						return ui;
				}
			},
			reduce: function (action) {
				var scope = this;

				if (!action || !action.type) {
					return;
				}

				newState = {};
				newState.users = scope._userReducers(action, scope._state.users);
				newState.ui = scope._uiReducers(action, scope._state.ui);

				scope._state = newState;
				$rootScope.$emit('stateChanged', {
					state: scope._state,
					action: action
				});

				$log.debug("State updated:");
				$log.debug(scope._state, action.type);
			}
		};
	});