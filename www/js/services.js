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

	.factory('LanguageService', ['$translate', '$localstorage', function ($translate, $localstorage) {
		return {
			_allLanguages: [
					{ id: 1, name: "العربية", code: "ar"},
					{ id: 2, name: "English", code: "en"}
				],
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
				var currentId = this._current ? this._current.id : 0;
				var instance = _array_findById(this._pool, currentId);
				this._current = instance || this._pool[0];
				$rootScope.$emit('currentUserChanged', this._current);
				return this._current;
			},
			setCurrentUser: function (user) {
				this._current = this._retrieveInstance(user);
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
			},
			deleteUser: function (user) {
				var instance = this._retrieveInstance(user);
				var index = this._pool.indexOf(instance);
				this._pool.splice(index, 1);
				$localstorage.setArray('users', this._pool);
			}
		}
	}])

	.factory('Wirds', [function () {
		var allSurahs = [
			{ id: 1, title: "Al-Fatihah", startPage: 1, endPage: 1 },
			{ id: 2, title: "Al-Baqarah", startPage: 2, endPage: 49 },
			{ id: 3, title: "Al-Imran", startPage: 50, endPage: 76 },
			{ id: 4, title: "An-Nisa'", startPage: 77, endPage: 106 },
			{ id: 5, title: "Al-Ma'idah", startPage: 106, endPage: 127 },
			{ id: 6, title: "Al-An'am", startPage: 128, endPage: 150 },
			{ id: 7, title: "Al-A'raf", startPage: 151, endPage: 176 },
			{ id: 8, title: "Al-Anfal", startPage: 177, endPage: 186 },
			{ id: 9, title: "At-Taubah", startPage: 187, endPage: 207 },
			{ id: 10, title: "Yunus", startPage: 208, endPage: 221 },
			{ id: 11, title: "Hud", startPage: 221, endPage: 235 },
			{ id: 12, title: "Yusuf", startPage: 235, endPage: 248 },
			{ id: 13, title: "Ar-Ra'd", startPage: 249, endPage: 255 },
			{ id: 14, title: "Ibrahim", startPage: 255, endPage: 261 },
			{ id: 15, title: "Al-Hijr", startPage: 262, endPage: 267 },
			{ id: 16, title: "An-Nahl", startPage: 267, endPage: 281 },
			{ id: 17, title: "Al-Isra", startPage: 282, endPage: 293 },
			{ id: 18, title: "Al-Kahf", startPage: 293, endPage: 304 },
			{ id: 19, title: "Maryam", startPage: 305, endPage: 312 },
			{ id: 20, title: "Ta Ha", startPage: 312, endPage: 321 },
			{ id: 21, title: "Al-Anbiya'", startPage: 322, endPage: 331 },
			{ id: 22, title: "Al-Hajj", startPage: 332, endPage: 341 },
			{ id: 23, title: "Al-Mu'minun", startPage: 342, endPage: 349 },
			{ id: 24, title: "An-Nur", startPage: 350, endPage: 359 },
			{ id: 25, title: "Al-Furqan", startPage: 359, endPage: 366 },
			{ id: 26, title: "Ash-Shu'ara'", startPage: 367, endPage: 376 },
			{ id: 27, title: "An-Naml", startPage: 377, endPage: 385 },
			{ id: 28, title: "Al-Qasas", startPage: 385, endPage: 396 },
			{ id: 29, title: "Al-'Ankabut", startPage: 396, endPage: 404 },
			{ id: 30, title: "Ar-Rum", startPage: 404, endPage: 410 },
			{ id: 31, title: "Luqman", startPage: 411, endPage: 414 },
			{ id: 32, title: "As-Sajdah", startPage: 415, endPage: 417 },
			{ id: 33, title: "Al-Ahzab", startPage: 418, endPage: 427 },
			{ id: 34, title: "Saba'", startPage: 428, endPage: 434 },
			{ id: 35, title: "Fatir", startPage: 434, endPage: 440 },
			{ id: 36, title: "Ya Sin", startPage: 440, endPage: 445 },
			{ id: 37, title: "As-Saffat", startPage: 446, endPage: 452 },
			{ id: 38, title: "Sad", startPage: 453, endPage: 458 },
			{ id: 39, title: "Az-Zumar", startPage: 458, endPage: 467 },
			{ id: 40, title: "Ghafir", startPage: 467, endPage: 476 },
			{ id: 41, title: "Fussilat", startPage: 477, endPage: 482 },
			{ id: 42, title: "Ash-Shura", startPage: 483, endPage: 489 },
			{ id: 43, title: "Az-Zukhruf", startPage: 489, endPage: 495 },
			{ id: 44, title: "Ad-Dukhan", startPage: 496, endPage: 498 },
			{ id: 45, title: "Al-Jathiyah", startPage: 499, endPage: 502 },
			{ id: 46, title: "Al-Ahqaf", startPage: 502, endPage: 506 },
			{ id: 47, title: "Muhammad", startPage: 507, endPage: 510 },
			{ id: 48, title: "Al-Fath", startPage: 511, endPage: 515 },
			{ id: 49, title: "Al-Hujurat", startPage: 515, endPage: 517 },
			{ id: 50, title: "Qaf", startPage: 518, endPage: 520 },
			{ id: 51, title: "Ad-Dhariyat", startPage: 520, endPage: 523 },
			{ id: 52, title: "At-Tur", startPage: 523, endPage: 525 },
			{ id: 53, title: "An-Najm", startPage: 526, endPage: 528 },
			{ id: 54, title: "Al-Qamar", startPage: 528, endPage: 531 },
			{ id: 55, title: "Ar-Rahman", startPage: 531, endPage: 534 },
			{ id: 56, title: "Al-Waqi'ah", startPage: 534, endPage: 537 },
			{ id: 57, title: "Al-Hadid", startPage: 537, endPage: 541 },
			{ id: 58, title: "Al-Mujadilah", startPage: 542, endPage: 545 },
			{ id: 59, title: "Al-Hashr", startPage: 545, endPage: 548 },
			{ id: 60, title: "Al-Mumtahanah", startPage: 549, endPage: 551 },
			{ id: 61, title: "As-Saff", startPage: 551, endPage: 552 },
			{ id: 62, title: "Al-Jumu'ah", startPage: 553, endPage: 554 },
			{ id: 63, title: "Al-Munafiqun", startPage: 554, endPage: 555 },
			{ id: 64, title: "At-Taghabun", startPage: 556, endPage: 557 },
			{ id: 65, title: "At-Talaq,", startPage: 558, endPage: 559 },
			{ id: 66, title: "At-Tahrim", startPage: 560, endPage: 561 },
			{ id: 67, title: "Al-Mulk", startPage: 562, endPage: 564 },
			{ id: 68, title: "Al-Qalam", startPage: 564, endPage: 566 },
			{ id: 69, title: "Al-Haqqah", startPage: 566, endPage: 568 },
			{ id: 70, title: "Al-Ma'arij", startPage: 568, endPage: 570 },
			{ id: 71, title: "Nuh", startPage: 570, endPage: 571 },
			{ id: 72, title: "Al-Jinn", startPage: 572, endPage: 573 },
			{ id: 73, title: "Al-Muzammil", startPage: 574, endPage: 575 },
			{ id: 74, title: "Al-Mudathir", startPage: 575, endPage: 577 },
			{ id: 75, title: "Al-Qiyamah", startPage: 577, endPage: 578 },
			{ id: 76, title: "Al-Insane", startPage: 578, endPage: 580 },
			{ id: 77, title: "Al-Mursalat", startPage: 580, endPage: 581 },
			{ id: 78, title: "An-Naba'", startPage: 582, endPage: 583 },
			{ id: 79, title: "An-Nazi'at", startPage: 583, endPage: 584 },
			{ id: 80, title: "'Abasa", startPage: 585, endPage: 586 },
			{ id: 81, title: "At-Takwir", startPage: 586, endPage: 586 },
			{ id: 82, title: "Al-Infitar", startPage: 587, endPage: 587 },
			{ id: 83, title: "Al-Mutaffifeen", startPage: 587, endPage: 589 },
			{ id: 84, title: "Al-Inshiqaq", startPage: 589, endPage: 590 },
			{ id: 85, title: "Al-Buruj", startPage: 590, endPage: 590 },
			{ id: 86, title: "At-Tariq", startPage: 591, endPage: 591 },
			{ id: 87, title: "Al-A'la", startPage: 591, endPage: 592 },
			{ id: 88, title: "Al-Ghashiya", startPage: 592, endPage: 593 },
			{ id: 89, title: "Al-Fajr", startPage: 593, endPage: 594 },
			{ id: 90, title: "Al-Balad", startPage: 594, endPage: 595 },
			{ id: 91, title: "Ash-Shams", startPage: 595, endPage: 595 },
			{ id: 92, title: "Al-Layl", startPage: 595, endPage: 596 },
			{ id: 93, title: "Ad-Duha", startPage: 596, endPage: 596 },
			{ id: 94, title: "Ash-Sharh", startPage: 596, endPage: 597 },
			{ id: 95, title: "At-Tin", startPage: 597, endPage: 597 },
			{ id: 96, title: "Al-'Alaq", startPage: 597, endPage: 598 },
			{ id: 97, title: "Al-qadr", startPage: 598, endPage: 598 },
			{ id: 98, title: "Al-Bayyinah", startPage: 598, endPage: 599 },
			{ id: 99, title: "Az-Zalzala", startPage: 599, endPage: 599 },
			{ id: 100, title: "Al-'Adiyat", startPage: 599, endPage: 600 },
			{ id: 101, title: "Al-Qari'ah", startPage: 600, endPage: 600 },
			{ id: 102, title: "At-Takathur", startPage: 600, endPage: 600 },
			{ id: 103, title: "Al-'Asr", startPage: 601, endPage: 601 },
			{ id: 104, title: "Al-Humazah", startPage: 601, endPage: 601 },
			{ id: 105, title: "Al-Fil", startPage: 601, endPage: 601 },
			{ id: 106, title: "Al-Quraish", startPage: 602, endPage: 602 },
			{ id: 107, title: "Al-Ma'un", startPage: 602, endPage: 602 },
			{ id: 108, title: "Al-Kauthar", startPage: 602, endPage: 602 },
			{ id: 109, title: "Al-Kafirun", startPage: 603, endPage: 603 },
			{ id: 110, title: "An-Nasr", startPage: 603, endPage: 603 },
			{ id: 111, title: "Al-Masad", startPage: 603, endPage: 603 },
			{ id: 112, title: "Al-Ikhlas", startPage: 604, endPage: 604 },
			{ id: 113, title: "Al-Falaq", startPage: 604, endPage: 604 },
			{ id: 114, title: "An-Nas", startPage: 604, endPage: 604 }
		];
		var allQuarters = [
			{ id: 1, title: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", startPage: 1, endPage: 1 },
			{ id: 2, title: "إِنَّ اللَّهَ لَا يَسْتَحْيِي أَن", startPage: 2, endPage: 49 },
			{ id: 3, title: "أَتَأْمُرُونَ النَّاسَ بِالْبِرِّ", startPage: 50, endPage: 76 },
			{ id: 4, title: "وَإِذِ اسْتَسْقَىٰ مُوسَىٰ لِقَوْمِهِ'", startPage: 77, endPage: 106 },
			{ id: 5, title: "أَفَتَطْمَعُونَ أَن يُؤْمِنُوا لَكُمْ", startPage: 106, endPage: 127 },
			{ id: 6, title: "وَلَقَدْ جَاءَكُم مُّوسَىٰ", startPage: 128, endPage: 150 },
			{ id: 7, title: "مَا نَنسَخْ مِنْ آيَةٍ أَوْ نُنسِهَا", startPage: 151, endPage: 176 },
			{ id: 8, title: "وَإِذِ ابْتَلَىٰ إِبْرَاهِيمَ رَبُّهُ", startPage: 177, endPage: 186 },
			{ id: 9, title: "سَيَقُولُ السُّفَهَاءُ مِنَ النَّاسِ", startPage: 187, endPage: 207 },
			{ id: 10, title: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن", startPage: 208, endPage: 221 },
			{ id: 11, title: "لَّيْسَ الْبِرَّ أَن تُوَلُّوا", startPage: 221, endPage: 235 },
			{ id: 12, title: "يَسْأَلُونَكَ عَنِ الْأَهِلَّةِ ۖ قُلْ", startPage: 235, endPage: 248 },
			{ id: 13, title: "وَاذْكُرُوا اللَّهَ فِي أَيَّامٍ", startPage: 249, endPage: 255 },
			{ id: 14, title: "يَسْأَلُونَكَ عَنِ الْخَمْرِ", startPage: 255, endPage: 261 },
			{ id: 15, title: "وَالْوَالِدَاتُ يُرْضِعْنَ", startPage: 262, endPage: 267 },
			{ id: 16, title: "أَلَمْ تَرَ إِلَى الَّذِينَ خَرَجُوا", startPage: 267, endPage: 281 },
			{ id: 17, title: "تِلْكَ الرُّسُلُ فَضَّلْنَا", startPage: 282, endPage: 293 },
			{ id: 18, title: "قَوْلٌ مَّعْرُوفٌ وَمَغْفِرَةٌ خَيْرٌ", startPage: 293, endPage: 304 },
			{ id: 19, title: "لَّيْسَ عَلَيْكَ هُدَاهُمْ وَلَٰكِنَّ", startPage: 305, endPage: 312 },
			{ id: 20, title: "وَإِن كُنتُمْ عَلَىٰ سَفَرٍ وَلَمْ", startPage: 312, endPage: 321 },
			{ id: 21, title: "قُلْ أَؤُنَبِّئُكُم بِخَيْرٍ مِّن'", startPage: 322, endPage: 331 },
			{ id: 22, title: "إِنَّ اللَّهَ اصْطَفَىٰ آدَمَ وَنُوحًا", startPage: 332, endPage: 341 },
			{ id: 23, title: "فَلَمَّا أَحَسَّ عِيسَىٰ مِنْهُمُ", startPage: 342, endPage: 349 },
			{ id: 24, title: "وَمِنْ أَهْلِ الْكِتَابِ مَنْ إِن", startPage: 350, endPage: 359 },
			{ id: 25, title: "كُلُّ الطَّعَامِ كَانَ حِلًّا لِّبَنِي", startPage: 359, endPage: 366 },
			{ id: 26, title: "لَيْسُوا سَوَاءً ۗ مِّنْ أَهْلِ", startPage: 367, endPage: 376 },
			{ id: 27, title: "وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن", startPage: 377, endPage: 385 },
			{ id: 28, title: "إِذْ تُصْعِدُونَ وَلَا تَلْوُونَ", startPage: 385, endPage: 396 },
			{ id: 29, title: "يَسْتَبْشِرُونَ بِنِعْمَةٍ مِّنَ", startPage: 396, endPage: 404 },
			{ id: 30, title: "لَتُبْلَوُنَّ فِي أَمْوَالِكُمْ", startPage: 404, endPage: 410 },
			{ id: 31, title: "يَا أَيُّهَا النَّاسُ اتَّقُوا", startPage: 411, endPage: 414 },
			{ id: 32, title: "وَلَكُمْ نِصْفُ مَا تَرَكَ", startPage: 415, endPage: 417 },
			{ id: 33, title: "وَالْمُحْصَنَاتُ مِنَ النِّسَاءِ", startPage: 418, endPage: 427 },
			{ id: 34, title: "وَاعْبُدُوا اللَّهَ وَلَا تُشْرِكُوا'", startPage: 428, endPage: 434 },
			{ id: 35, title: "إِنَّ اللَّهَ يَأْمُرُكُمْ أَن", startPage: 434, endPage: 440 },
			{ id: 36, title: "فَلْيُقَاتِلْ فِي سَبِيلِ اللَّهِ", startPage: 440, endPage: 445 },
			{ id: 37, title: "فَمَا لَكُمْ فِي الْمُنَافِقِينَ", startPage: 446, endPage: 452 },
			{ id: 38, title: "وَمَن يُهَاجِرْ فِي سَبِيلِ اللَّهِ", startPage: 453, endPage: 458 },
			{ id: 39, title: "لَّا خَيْرَ فِي كَثِيرٍ مِّن", startPage: 458, endPage: 467 },
			{ id: 40, title: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا", startPage: 467, endPage: 476 },
			{ id: 41, title: "لَّا يُحِبُّ اللَّهُ الْجَهْرَ", startPage: 477, endPage: 482 },
			{ id: 42, title: "إِنَّا أَوْحَيْنَا إِلَيْكَ كَمَا", startPage: 483, endPage: 489 },
			{ id: 43, title: "يَا أَيُّهَا الَّذِينَ آمَنُوا", startPage: 489, endPage: 495 },
			{ id: 44, title: "وَلَقَدْ أَخَذَ اللَّهُ مِيثَاقَ بَنِي", startPage: 496, endPage: 498 },
			{ id: 45, title: "وَاتْلُ عَلَيْهِمْ نَبَأَ ابْنَيْ", startPage: 499, endPage: 502 },
			{ id: 46, title: "يَا أَيُّهَا الرَّسُولُ لَا يَحْزُنكَ", startPage: 502, endPage: 506 },
			{ id: 47, title: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا", startPage: 507, endPage: 510 },
			{ id: 48, title: "يَا أَيُّهَا الرَّسُولُ بَلِّغْ مَا", startPage: 511, endPage: 515 },
			{ id: 49, title: "لَتَجِدَنَّ أَشَدَّ النَّاسِ", startPage: 515, endPage: 517 },
			{ id: 50, title: "جَعَلَ اللَّهُ الْكَعْبَةَ الْبَيْتَ", startPage: 518, endPage: 520 },
			{ id: 51, title: "يَوْمَ يَجْمَعُ اللَّهُ الرُّسُلَ", startPage: 520, endPage: 523 },
			{ id: 52, title: "وَلَهُ مَا سَكَنَ فِي اللَّيْلِ", startPage: 523, endPage: 525 },
			{ id: 53, title: "إِنَّمَا يَسْتَجِيبُ الَّذِينَ", startPage: 526, endPage: 528 },
			{ id: 54, title: "وَعِندَهُ مَفَاتِحُ الْغَيْبِ لَا", startPage: 528, endPage: 531 },
			{ id: 55, title: "وَإِذْ قَالَ إِبْرَاهِيمُ لِأَبِيهِ", startPage: 531, endPage: 534 },
			{ id: 56, title: "إِنَّ اللَّهَ فَالِقُ الْحَبِّ", startPage: 534, endPage: 537 },
			{ id: 57, title: "وَلَوْ أَنَّنَا نَزَّلْنَا إِلَيْهِمُ", startPage: 537, endPage: 541 },
			{ id: 58, title: "لَهُمْ دَارُ السَّلَامِ عِندَ", startPage: 542, endPage: 545 },
			{ id: 59, title: "وَهُوَ الَّذِي أَنشَأَ جَنَّاتٍ", startPage: 545, endPage: 548 },
			{ id: 60, title: "قُلْ تَعَالَوْا أَتْلُ مَا حَرَّمَ", startPage: 549, endPage: 551 },
			{ id: 61, title: "المص", startPage: 551, endPage: 552 },
			{ id: 62, title: "يَا بَنِي آدَمَ خُذُوا زِينَتَكُمْ", startPage: 553, endPage: 554 },
			{ id: 63, title: "وَإِذَا صُرِفَتْ أَبْصَارُهُمْ", startPage: 554, endPage: 555 },
			{ id: 64, title: "وَإِلَىٰ عَادٍ أَخَاهُمْ هُودًا", startPage: 556, endPage: 557 },
			{ id: 65, title: "قَالَ الْمَلَأُ الَّذِينَ", startPage: 558, endPage: 559 },
			{ id: 66, title: "وَأَوْحَيْنَا إِلَىٰ مُوسَىٰ أَنْ", startPage: 560, endPage: 561 },
			{ id: 67, title: "وَوَاعَدْنَا مُوسَىٰ ثَلَاثِينَ", startPage: 562, endPage: 564 },
			{ id: 68, title: "وَاكْتُبْ لَنَا فِي هَٰذِهِ الدُّنْيَا", startPage: 564, endPage: 566 },
			{ id: 69, title: "وَإِذْ نَتَقْنَا الْجَبَلَ فَوْقَهُمْ", startPage: 566, endPage: 568 },
			{ id: 70, title: "هُوَ الَّذِي خَلَقَكُم مِّن نَّفْسٍ", startPage: 568, endPage: 570 },
			{ id: 71, title: "يَسْأَلُونَكَ عَنِ الْأَنفَالِ ۖ قُلِ", startPage: 570, endPage: 571 },
			{ id: 72, title: "إِنَّ شَرَّ الدَّوَابِّ عِندَ اللَّهِ", startPage: 572, endPage: 573 },
			{ id: 73, title: "وَاعْلَمُوا أَنَّمَا غَنِمْتُم مِّن", startPage: 574, endPage: 575 },
			{ id: 74, title: "وَإِن جَنَحُوا لِلسَّلْمِ فَاجْنَحْ", startPage: 575, endPage: 577 },
			{ id: 75, title: "بَرَاءَةٌ مِّنَ اللَّهِ وَرَسُولِهِ", startPage: 577, endPage: 578 },
			{ id: 76, title: "أَجَعَلْتُمْ سِقَايَةَ الْحَاجِّ", startPage: 578, endPage: 580 },
			{ id: 77, title: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِنَّ", startPage: 580, endPage: 581 },
			{ id: 78, title: "وَلَوْ أَرَادُوا الْخُرُوجَ", startPage: 582, endPage: 583 },
			{ id: 79, title: "إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ", startPage: 583, endPage: 584 },
			{ id: 80, title: "وَمِنْهُم مَّنْ عَاهَدَ اللَّهَ لَئِنْ", startPage: 585, endPage: 586 },
			{ id: 81, title: "إِنَّمَا السَّبِيلُ عَلَى الَّذِينَ", startPage: 586, endPage: 586 },
			{ id: 82, title: "إِنَّ اللَّهَ اشْتَرَىٰ مِنَ", startPage: 587, endPage: 587 },
			{ id: 83, title: "وَمَا كَانَ الْمُؤْمِنُونَ", startPage: 587, endPage: 589 },
			{ id: 84, title: "وَلَوْ يُعَجِّلُ اللَّهُ لِلنَّاسِ", startPage: 589, endPage: 590 },
			{ id: 85, title: "لِّلَّذِينَ أَحْسَنُوا الْحُسْنَىٰ", startPage: 590, endPage: 590 },
			{ id: 86, title: "وَيَسْتَنبِئُونَكَ أَحَقٌّ هُوَ ۖ قُلْ", startPage: 591, endPage: 591 },
			{ id: 87, title: "وَاتْلُ عَلَيْهِمْ نَبَأَ نُوحٍ إِذْ", startPage: 591, endPage: 592 },
			{ id: 88, title: "وَجَاوَزْنَا بِبَنِي إِسْرَائِيلَ", startPage: 592, endPage: 593 },
			{ id: 89, title: "وَمَا مِن دَابَّةٍ فِي الْأَرْضِ", startPage: 593, endPage: 594 },
			{ id: 90, title: "مَثَلُ الْفَرِيقَيْنِ كَالْأَعْمَىٰ", startPage: 594, endPage: 595 },
			{ id: 91, title: "وَقَالَ ارْكَبُوا فِيهَا بِسْمِ", startPage: 595, endPage: 595 },
			{ id: 92, title: "وَإِلَىٰ ثَمُودَ أَخَاهُمْ صَالِحًا", startPage: 595, endPage: 596 },
			{ id: 93, title: "وَإِلَىٰ مَدْيَنَ أَخَاهُمْ شُعَيْبًا", startPage: 596, endPage: 596 },
			{ id: 94, title: "وَأَمَّا الَّذِينَ سُعِدُوا فَفِي", startPage: 596, endPage: 597 },
			{ id: 95, title: "لَّقَدْ كَانَ فِي يُوسُفَ وَإِخْوَتِهِ", startPage: 597, endPage: 597 },
			{ id: 96, title: "وَقَالَ نِسْوَةٌ فِي الْمَدِينَةِ", startPage: 597, endPage: 598 },
			{ id: 97, title: "وَمَا أُبَرِّئُ نَفْسِي ۚ إِنَّ", startPage: 598, endPage: 598 },
			{ id: 98, title: "قَالُوا إِن يَسْرِقْ فَقَدْ سَرَقَ", startPage: 598, endPage: 599 },
			{ id: 99, title: "رَبِّ قَدْ آتَيْتَنِي مِنَ الْمُلْكِ", startPage: 599, endPage: 599 },
			{ id: 100, title: "وَإِن تَعْجَبْ فَعَجَبٌ قَوْلُهُمْ", startPage: 599, endPage: 600 },
			{ id: 101, title: "أَفَمَن يَعْلَمُ أَنَّمَا أُنزِلَ", startPage: 600, endPage: 600 },
			{ id: 102, title: "مَّثَلُ الْجَنَّةِ الَّتِي وُعِدَ", startPage: 600, endPage: 600 },
			{ id: 103, title: "قَالَتْ رُسُلُهُمْ أَفِي اللَّهِ شَكٌّ", startPage: 601, endPage: 601 },
			{ id: 104, title: "أَلَمْ تَرَ إِلَى الَّذِينَ بَدَّلُوا", startPage: 601, endPage: 601 },
			{ id: 105, title: "الر ۚ تِلْكَ آيَاتُ الْكِتَابِ", startPage: 601, endPage: 601 },
			{ id: 106, title: "نَبِّئْ عِبَادِي أَنِّي أَنَا الْغَفُورُ الرَّحِيمُ", startPage: 602, endPage: 602 },
			{ id: 107, title: "أَتَىٰ أَمْرُ اللَّهِ فَلَا", startPage: 602, endPage: 602 },
			{ id: 108, title: "وَقِيلَ لِلَّذِينَ اتَّقَوْا مَاذَا", startPage: 602, endPage: 602 },
			{ id: 109, title: "وَقَالَ اللَّهُ لَا تَتَّخِذُوا", startPage: 603, endPage: 603 },
			{ id: 110, title: "ضَرَبَ اللَّهُ مَثَلًا عَبْدًا", startPage: 603, endPage: 603 },
			{ id: 111, title: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ", startPage: 603, endPage: 603 },
			{ id: 112, title: "يَوْمَ تَأْتِي كُلُّ نَفْسٍ تُجَادِلُ", startPage: 604, endPage: 604 },
			{ id: 113, title: "سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ", startPage: 604, endPage: 604 },
			{ id: 114, title: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا", startPage: 604, endPage: 604 },
			{ id: 115, title: "قُلْ كُونُوا حِجَارَةً أَوْ حَدِيدًا", startPage: 604, endPage: 604 },
			{ id: 116, title: "وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ", startPage: 604, endPage: 604 },
			{ id: 117, title: "أَوَلَمْ يَرَوْا أَنَّ اللَّهَ الَّذِي", startPage: 604, endPage: 604 },
			{ id: 118, title: "وَتَرَى الشَّمْسَ إِذَا طَلَعَت", startPage: 604, endPage: 604 },
			{ id: 119, title: "وَاضْرِبْ لَهُم مَّثَلًا رَّجُلَيْنِ", startPage: 604, endPage: 604 },
			{ id: 120, title: "مَّا أَشْهَدتُّهُمْ خَلْقَ", startPage: 604, endPage: 604 },
			{ id: 121, title: "قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ لَن", startPage: 604, endPage: 604 },
			{ id: 122, title: "وَتَرَكْنَا بَعْضَهُمْ يَوْمَئِذٍ", startPage: 604, endPage: 604 },
			{ id: 123, title: "فَحَمَلَتْهُ فَانتَبَذَتْ بِهِ", startPage: 604, endPage: 604 },
			{ id: 124, title: "فَخَلَفَ مِن بَعْدِهِمْ خَلْفٌ", startPage: 604, endPage: 604 },
			{ id: 125, title: "طه", startPage: 604, endPage: 604 },
			{ id: 126, title: "مِنْهَا خَلَقْنَاكُمْ وَفِيهَا", startPage: 604, endPage: 604 },
			{ id: 127, title: "وَمَا أَعْجَلَكَ عَن قَوْمِكَ يَا", startPage: 604, endPage: 604 },
			{ id: 128, title: "وَعَنَتِ الْوُجُوهُ لِلْحَيِّ", startPage: 604, endPage: 604 },
			{ id: 129, title: "اقْتَرَبَ لِلنَّاسِ حِسَابُهُمْ", startPage: 604, endPage: 604 },
			{ id: 130, title: "وَمَن يَقُلْ مِنْهُمْ إِنِّي إِلَٰهٌ", startPage: 604, endPage: 604 },
			{ id: 131, title: "وَلَقَدْ آتَيْنَا إِبْرَاهِيمَ", startPage: 604, endPage: 604 },
			{ id: 132, title: "وَأَيُّوبَ إِذْ نَادَىٰ رَبَّهُ أَنِّي", startPage: 604, endPage: 604 },
			{ id: 133, title: "يَا أَيُّهَا النَّاسُ اتَّقُوا", startPage: 604, endPage: 604 },
			{ id: 134, title: "هَٰذَانِ خَصْمَانِ اخْتَصَمُوا فِي", startPage: 604, endPage: 604 },
			{ id: 135, title: "إِنَّ اللَّهَ يُدَافِعُ عَنِ الَّذِينَ", startPage: 604, endPage: 604 },
			{ id: 136, title: "ذَٰلِكَ وَمَنْ عَاقَبَ بِمِثْلِ مَا", startPage: 604, endPage: 604 },
			{ id: 137, title: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ", startPage: 604, endPage: 604 },
			{ id: 138, title: "هَيْهَاتَ هَيْهَاتَ لِمَا تُوعَدُونَ", startPage: 604, endPage: 604 },
			{ id: 139, title: "وَلَوْ رَحِمْنَاهُمْ وَكَشَفْنَا مَا", startPage: 604, endPage: 604 },
			{ id: 140, title: "سُورَةٌ أَنزَلْنَاهَا وَفَرَضْنَاهَا", startPage: 604, endPage: 604 },
			{ id: 141, title: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا", startPage: 604, endPage: 604 },
			{ id: 142, title: "اللَّهُ نُورُ السَّمَاوَاتِ", startPage: 604, endPage: 604 },
			{ id: 143, title: "وَأَقْسَمُوا بِاللَّهِ جَهْدَ", startPage: 604, endPage: 604 },
			{ id: 144, title: "تَبَارَكَ الَّذِي نَزَّلَ", startPage: 604, endPage: 604 },
			{ id: 145, title: "وَقَالَ الَّذِينَ لَا يَرْجُونَ", startPage: 604, endPage: 604 },
			{ id: 146, title: "وَهُوَ الَّذِي مَرَجَ الْبَحْرَيْنِ", startPage: 604, endPage: 604 },
			{ id: 147, title: "طسم", startPage: 604, endPage: 604 },
			{ id: 148, title: "وَأَوْحَيْنَا إِلَىٰ مُوسَىٰ أَنْ", startPage: 604, endPage: 604 },
			{ id: 149, title: "قَالُوا أَنُؤْمِنُ لَكَ وَاتَّبَعَكَ", startPage: 604, endPage: 604 },
			{ id: 150, title: "أَوْفُوا الْكَيْلَ وَلَا تَكُونُوا", startPage: 604, endPage: 604 },
			{ id: 151, title: "طس ۚ تِلْكَ آيَاتُ الْقُرْآنِ", startPage: 604, endPage: 604 },
			{ id: 152, title: "قَالَ سَنَنظُرُ أَصَدَقْتَ أَمْ كُنتَ", startPage: 604, endPage: 604 },
			{ id: 153, title: "فَمَا كَانَ جَوَابَ قَوْمِهِ إِلَّا", startPage: 604, endPage: 604 },
			{ id: 154, title: "وَإِذَا وَقَعَ الْقَوْلُ عَلَيْهِمْ", startPage: 604, endPage: 604 },
			{ id: 155, title: "وَحَرَّمْنَا عَلَيْهِ الْمَرَاضِعَ", startPage: 604, endPage: 604 },
			{ id: 156, title: "فَلَمَّا قَضَىٰ مُوسَى الْأَجَلَ", startPage: 604, endPage: 604 },
			{ id: 157, title: "وَلَقَدْ وَصَّلْنَا لَهُمُ الْقَوْلَ", startPage: 604, endPage: 604 },
			{ id: 158, title: "إِنَّ قَارُونَ كَانَ مِن قَوْمِ", startPage: 604, endPage: 604 },
			{ id: 159, title: "الم", startPage: 604, endPage: 604 },
			{ id: 160, title: "فَآمَنَ لَهُ لُوطٌ ۘ وَقَالَ إِنِّي", startPage: 604, endPage: 604 },
			{ id: 161, title: "وَلَا تُجَادِلُوا أَهْلَ الْكِتَابِ", startPage: 604, endPage: 604 },
			{ id: 162, title: "الم", startPage: 604, endPage: 604 },
			{ id: 163, title: "مُنِيبِينَ إِلَيْهِ وَاتَّقُوهُ", startPage: 604, endPage: 604 },
			{ id: 164, title: "اللَّهُ الَّذِي خَلَقَكُم مِّن ضَعْفٍ", startPage: 604, endPage: 604 },
			{ id: 165, title: "وَمَن يُسْلِمْ وَجْهَهُ إِلَى اللَّهِ", startPage: 604, endPage: 604 },
			{ id: 166, title: "قُلْ يَتَوَفَّاكُم مَّلَكُ الْمَوْتِ", startPage: 604, endPage: 604 },
			{ id: 167, title: "يَا أَيُّهَا النَّبِيُّ اتَّقِ", startPage: 604, endPage: 604 },
			{ id: 168, title: "قَدْ يَعْلَمُ اللَّهُ الْمُعَوِّقِينَ", startPage: 604, endPage: 604 },
			{ id: 169, title: "وَمَن يَقْنُتْ مِنكُنَّ لِلَّهِ", startPage: 604, endPage: 604 },
			{ id: 170, title: "تُرْجِي مَن تَشَاءُ مِنْهُنَّ", startPage: 604, endPage: 604 },
			{ id: 171, title: "لَّئِن لَّمْ يَنتَهِ الْمُنَافِقُونَ", startPage: 604, endPage: 604 },
			{ id: 172, title: "وَلَقَدْ آتَيْنَا دَاوُودَ مِنَّا", startPage: 604, endPage: 604 },
			{ id: 173, title: "قُلْ مَن يَرْزُقُكُم مِّنَ", startPage: 604, endPage: 604 },
			{ id: 174, title: "قُلْ إِنَّمَا أَعِظُكُم بِوَاحِدَةٍ", startPage: 604, endPage: 604 },
			{ id: 175, title: "يَا أَيُّهَا النَّاسُ أَنتُمُ", startPage: 604, endPage: 604 },
			{ id: 176, title: "إِنَّ اللَّهَ يُمْسِكُ السَّمَاوَاتِ", startPage: 604, endPage: 604 },
			{ id: 177, title: "وَمَا أَنزَلْنَا عَلَىٰ قَوْمِهِ مِن", startPage: 604, endPage: 604 },
			{ id: 178, title: "أَلَمْ أَعْهَدْ إِلَيْكُمْ يَا بَنِي", startPage: 604, endPage: 604 },
			{ id: 179, title: "احْشُرُوا الَّذِينَ ظَلَمُوا", startPage: 604, endPage: 604 },
			{ id: 180, title: "وَإِنَّ مِن شِيعَتِهِ لَإِبْرَاهِيمَ", startPage: 604, endPage: 604 },
			{ id: 181, title: "فَنَبَذْنَاهُ بِالْعَرَاءِ وَهُوَ", startPage: 604, endPage: 604 },
			{ id: 182, title: "وَهَلْ أَتَاكَ نَبَأُ الْخَصْمِ إِذْ", startPage: 604, endPage: 604 },
			{ id: 183, title: "وَعِندَهُمْ قَاصِرَاتُ الطَّرْفِ", startPage: 604, endPage: 604 },
			{ id: 184, title: "وَإِذَا مَسَّ الْإِنسَانَ ضُرٌّ دَعَا", startPage: 604, endPage: 604 },
			{ id: 185, title: "فَمَنْ أَظْلَمُ مِمَّن كَذَبَ عَلَى", startPage: 604, endPage: 604 },
			{ id: 186, title: "قُلْ يَا عِبَادِيَ الَّذِينَ", startPage: 604, endPage: 604 },
			{ id: 187, title: "حم", startPage: 604, endPage: 604 },
			{ id: 188, title: "أَوَلَمْ يَسِيرُوا فِي الْأَرْضِ", startPage: 604, endPage: 604 },
			{ id: 189, title: "أَوَلَمْ يَسِيرُوا فِي الْأَرْضِ", startPage: 604, endPage: 604 },
			{ id: 190, title: "قُلْ إِنِّي نُهِيتُ أَنْ أَعْبُدَ", startPage: 604, endPage: 604 },
			{ id: 191, title: "قُلْ أَئِنَّكُمْ لَتَكْفُرُونَ", startPage: 604, endPage: 604 },
			{ id: 192, title: "وَقَيَّضْنَا لَهُمْ قُرَنَاءَ", startPage: 604, endPage: 604 },
			{ id: 193, title: "إِلَيْهِ يُرَدُّ عِلْمُ السَّاعَةِ", startPage: 604, endPage: 604 },
			{ id: 194, title: "شَرَعَ لَكُم مِّنَ الدِّينِ مَا", startPage: 604, endPage: 604 },
			{ id: 195, title: "وَلَوْ بَسَطَ اللَّهُ الرِّزْقَ", startPage: 604, endPage: 604 },
			{ id: 196, title: "وَمَا كَانَ لِبَشَرٍ أَن يُكَلِّمَهُ", startPage: 604, endPage: 604 },
			{ id: 197, title: "قَالَ أَوَلَوْ جِئْتُكُم بِأَهْدَىٰ", startPage: 604, endPage: 604 },
			{ id: 198, title: "وَلَمَّا ضُرِبَ ابْنُ مَرْيَمَ مَثَلًا", startPage: 604, endPage: 604 },
			{ id: 199, title: "وَلَقَدْ فَتَنَّا قَبْلَهُمْ قَوْمَ", startPage: 604, endPage: 604 },
			{ id: 200, title: "اللَّهُ الَّذِي سَخَّرَ لَكُمُ", startPage: 604, endPage: 604 },
			{ id: 201, title: "حم", startPage: 604, endPage: 604 },
			{ id: 202, title: "وَاذْكُرْ أَخَا عَادٍ إِذْ أَنذَرَ", startPage: 604, endPage: 604 },
			{ id: 203, title: "أَفَلَمْ يَسِيرُوا فِي الْأَرْضِ", startPage: 604, endPage: 604 },
			{ id: 204, title: "يَا أَيُّهَا الَّذِينَ آمَنُوا", startPage: 604, endPage: 604 },
			{ id: 205, title: "لَّقَدْ رَضِيَ اللَّهُ عَنِ", startPage: 604, endPage: 604 },
			{ id: 206, title: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا", startPage: 604, endPage: 604 },
			{ id: 207, title: "قَالَتِ الْأَعْرَابُ آمَنَّا ۖ قُل", startPage: 604, endPage: 604 },
			{ id: 208, title: "قَالَ قَرِينُهُ رَبَّنَا مَا", startPage: 604, endPage: 604 },
			{ id: 209, title: "قَالَ فَمَا خَطْبُكُمْ أَيُّهَا", startPage: 604, endPage: 604 },
			{ id: 210, title: "وَيَطُوفُ عَلَيْهِمْ غِلْمَانٌ", startPage: 604, endPage: 604 },
			{ id: 211, title: "وَكَم مِّن مَّلَكٍ فِي السَّمَاوَاتِ", startPage: 604, endPage: 604 },
			{ id: 212, title: "كَذَّبَتْ قَبْلَهُمْ قَوْمُ نُوحٍ", startPage: 604, endPage: 604 },
			{ id: 213, title: "الرَّحْمَٰنُ", startPage: 604, endPage: 604 },
			{ id: 214, title: "إِذَا وَقَعَتِ الْوَاقِعَةُ", startPage: 604, endPage: 604 },
			{ id: 215, title: "فَلَا أُقْسِمُ بِمَوَاقِعِ النُّجُومِ", startPage: 604, endPage: 604 },
			{ id: 216, title: "أَلَمْ يَأْنِ لِلَّذِينَ آمَنُوا أَن", startPage: 604, endPage: 604 },
			{ id: 217, title: "قَدْ سَمِعَ اللَّهُ قَوْلَ الَّتِي", startPage: 604, endPage: 604 },
			{ id: 218, title: "أَلَمْ تَرَ إِلَى الَّذِينَ تَوَلَّوْا", startPage: 604, endPage: 604 },
			{ id: 219, title: "أَلَمْ تَرَ إِلَى الَّذِينَ نَافَقُوا", startPage: 604, endPage: 604 },
			{ id: 220, title: "عَسَى اللَّهُ أَن يَجْعَلَ بَيْنَكُمْ", startPage: 604, endPage: 604 },
			{ id: 221, title: "يُسَبِّحُ لِلَّهِ مَا فِي", startPage: 604, endPage: 604 },
			{ id: 222, title: "وَإِذَا رَأَيْتَهُمْ تُعْجِبُكَ", startPage: 604, endPage: 604 },
			{ id: 223, title: "يَا أَيُّهَا النَّبِيُّ إِذَا", startPage: 604, endPage: 604 },
			{ id: 224, title: "يَا أَيُّهَا النَّبِيُّ لِمَ", startPage: 604, endPage: 604 },
			{ id: 225, title: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ", startPage: 604, endPage: 604 },
			{ id: 226, title: "ن ۚ وَالْقَلَمِ وَمَا يَسْطُرُونَ", startPage: 604, endPage: 604 },
			{ id: 227, title: "الْحَاقَّةُ", startPage: 604, endPage: 604 },
			{ id: 228, title: "إِنَّ الْإِنسَانَ خُلِقَ هَلُوعًا", startPage: 604, endPage: 604 },
			{ id: 229, title: "قُلْ أُوحِيَ إِلَيَّ أَنَّهُ", startPage: 604, endPage: 604 },
			{ id: 230, title: "إِنَّ رَبَّكَ يَعْلَمُ أَنَّكَ تَقُومُ", startPage: 604, endPage: 604 },
			{ id: 231, title: "لَا أُقْسِمُ بِيَوْمِ الْقِيَامَةِ", startPage: 604, endPage: 604 },
			{ id: 232, title: "وَيَطُوفُ عَلَيْهِمْ وِلْدَانٌ", startPage: 604, endPage: 604 },
			{ id: 233, title: "عَمَّ يَتَسَاءَلُونَ", startPage: 604, endPage: 604 },
			{ id: 234, title: "عَبَسَ وَتَوَلَّىٰ", startPage: 604, endPage: 604 },
			{ id: 235, title: "إِذَا السَّمَاءُ انفَطَرَتْ", startPage: 604, endPage: 604 },
			{ id: 236, title: "إِذَا السَّمَاءُ انشَقَّتْ", startPage: 604, endPage: 604 },
			{ id: 237, title: "سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى", startPage: 604, endPage: 604 },
			{ id: 238, title: "لَا أُقْسِمُ بِهَٰذَا الْبَلَدِ", startPage: 604, endPage: 604 },
			{ id: 239, title: "أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ", startPage: 604, endPage: 604 },
			{ id: 240, title: "أَفَلَا يَعْلَمُ إِذَا بُعْثِرَ مَا", startPage: 604, endPage: 604 }
		];
		return {
			getAllSurahs: function () {
				return allSurahs;
			},
			getSurahById: function (id) {
				return _array_findById(allSurahs, id);
			}
		}
	}]);
