var app = angular.module('hifzTracker', [
	'ionic',
	'ngCordova',
	'ionic-toast',
	'pascalprecht.translate'
])

app.run(function ($ionicPlatform) {
		$ionicPlatform.ready(function () {
			// Hide splash screen
			if (navigator && navigator.splashscreen) {
				navigator.splashscreen.hide();
			}

			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);

			}
			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleDefault();
			}
		});
	});

app.config(function ($stateProvider, $urlRouterProvider, $translateProvider, $compileProvider) {
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
		$stateProvider

			.state('app', {
				url: '/app',
				abstract: true,
				templateUrl: 'templates/menu.html',
				controller: 'AppCtrl'
			})

			.state('app.home', {
				url: '/home',
				views: {
					'menuContent': {
						templateUrl: 'templates/home.html',
						controller: 'HomeCtrl'
					}
				}
			})

			.state('app.stats', {
				url: '/stats/:userId',
				views: {
					'menuContent': {
						templateUrl: 'templates/stats.html',
						controller: 'StatsCtrl'
					}
				}
			})

			.state('app.users', {
				url: '/users/:userId',
				views: {
					'menuContent': {
						templateUrl: 'templates/user-dialog.html',
						controller: 'UserFormCtrl'
					}
				}
			});

		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/app/home');

		$translateProvider
			.useStaticFilesLoader({
				prefix: 'locales/',
				suffix: '.json'
			})
			.registerAvailableLanguageKeys(['ar', 'en'], {
				'ar': 'ar',
				'en': 'en', 'en_GB': 'en', 'en_US': 'en'
			})
			.preferredLanguage('ar')
			.fallbackLanguage('ar')
			.determinePreferredLanguage()
			.useSanitizeValueStrategy('escapeParameters');
	});
