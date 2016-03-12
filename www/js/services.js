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
			{ id: 1, title: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", startPage: 1, endPage: 5 },
			{ id: 2, title: "إِنَّ اللَّهَ لَا يَسْتَحْيِي أَن", startPage: 5, endPage: 7 },
			{ id: 3, title: "أَتَأْمُرُونَ النَّاسَ بِالْبِرِّ", startPage: 7, endPage: 9 },
			{ id: 4, title: "وَإِذِ اسْتَسْقَىٰ مُوسَىٰ لِقَوْمِهِ'", startPage: 9, endPage: 11 },
			{ id: 5, title: "أَفَتَطْمَعُونَ أَن يُؤْمِنُوا لَكُمْ", startPage: 11, endPage: 14 },
			{ id: 6, title: "وَلَقَدْ جَاءَكُم مُّوسَىٰ", startPage: 14, endPage: 16 },
			{ id: 7, title: "مَا نَنسَخْ مِنْ آيَةٍ أَوْ نُنسِهَا", startPage: 17, endPage: 19 },
			{ id: 8, title: "وَإِذِ ابْتَلَىٰ إِبْرَاهِيمَ رَبُّهُ", startPage: 19, endPage: 21 },
			{ id: 9, title: "سَيَقُولُ السُّفَهَاءُ مِنَ النَّاسِ", startPage: 22, endPage: 24 },
			{ id: 10, title: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن", startPage: 24, endPage: 26 },
			{ id: 11, title: "لَّيْسَ الْبِرَّ أَن تُوَلُّوا", startPage: 27, endPage: 29 },
			{ id: 12, title: "يَسْأَلُونَكَ عَنِ الْأَهِلَّةِ ۖ قُلْ", startPage: 29, endPage: 31 },
			{ id: 13, title: "وَاذْكُرُوا اللَّهَ فِي أَيَّامٍ", startPage: 32, endPage: 34 },
			{ id: 14, title: "يَسْأَلُونَكَ عَنِ الْخَمْرِ", startPage: 34, endPage: 37 },
			{ id: 15, title: "وَالْوَالِدَاتُ يُرْضِعْنَ", startPage: 37, endPage: 39 },
			{ id: 16, title: "أَلَمْ تَرَ إِلَى الَّذِينَ خَرَجُوا", startPage: 39, endPage: 41 },
			{ id: 17, title: "تِلْكَ الرُّسُلُ فَضَّلْنَا", startPage: 42, endPage: 44 },
			{ id: 18, title: "قَوْلٌ مَّعْرُوفٌ وَمَغْفِرَةٌ خَيْرٌ", startPage: 44, endPage: 46 },
			{ id: 19, title: "لَّيْسَ عَلَيْكَ هُدَاهُمْ وَلَٰكِنَّ", startPage: 46, endPage: 48 },
			{ id: 20, title: "وَإِن كُنتُمْ عَلَىٰ سَفَرٍ وَلَمْ", startPage: 49, endPage: 51 },
			{ id: 21, title: "قُلْ أَؤُنَبِّئُكُم بِخَيْرٍ مِّن'", startPage: 51, endPage: 54 },
			{ id: 22, title: "إِنَّ اللَّهَ اصْطَفَىٰ آدَمَ وَنُوحًا", startPage: 54, endPage: 56 },
			{ id: 23, title: "فَلَمَّا أَحَسَّ عِيسَىٰ مِنْهُمُ", startPage: 56, endPage: 59 },
			{ id: 24, title: "وَمِنْ أَهْلِ الْكِتَابِ مَنْ إِن", startPage: 59, endPage: 62 },
			{ id: 25, title: "كُلُّ الطَّعَامِ كَانَ حِلًّا لِّبَنِي", startPage: 62, endPage: 64 },
			{ id: 26, title: "لَيْسُوا سَوَاءً ۗ مِّنْ أَهْلِ", startPage: 64, endPage: 66 },
			{ id: 27, title: "وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن", startPage: 67, endPage: 69 },
			{ id: 28, title: "إِذْ تُصْعِدُونَ وَلَا تَلْوُونَ", startPage: 69, endPage: 72 },
			{ id: 29, title: "يَسْتَبْشِرُونَ بِنِعْمَةٍ مِّنَ", startPage: 72, endPage: 74 },
			{ id: 30, title: "لَتُبْلَوُنَّ فِي أَمْوَالِكُمْ", startPage: 74, endPage: 76 },
			{ id: 31, title: "يَا أَيُّهَا النَّاسُ اتَّقُوا", startPage: 77, endPage: 78 },
			{ id: 32, title: "وَلَكُمْ نِصْفُ مَا تَرَكَ", startPage: 79, endPage: 81 },
			{ id: 33, title: "وَالْمُحْصَنَاتُ مِنَ النِّسَاءِ", startPage: 82, endPage: 84 },
			{ id: 34, title: "وَاعْبُدُوا اللَّهَ وَلَا تُشْرِكُوا'", startPage: 84, endPage: 87 },
			{ id: 35, title: "إِنَّ اللَّهَ يَأْمُرُكُمْ أَن", startPage: 87, endPage: 89 },
			{ id: 36, title: "فَلْيُقَاتِلْ فِي سَبِيلِ اللَّهِ", startPage: 89, endPage: 92 },
			{ id: 37, title: "فَمَا لَكُمْ فِي الْمُنَافِقِينَ", startPage: 92, endPage: 94 },
			{ id: 38, title: "وَمَن يُهَاجِرْ فِي سَبِيلِ اللَّهِ", startPage: 94, endPage: 96 },
			{ id: 39, title: "لَّا خَيْرَ فِي كَثِيرٍ مِّن", startPage: 97, endPage: 99 },
			{ id: 40, title: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا", startPage: 100, endPage: 101 },
			{ id: 41, title: "لَّا يُحِبُّ اللَّهُ الْجَهْرَ", startPage: 102, endPage: 103 },
			{ id: 42, title: "إِنَّا أَوْحَيْنَا إِلَيْكَ كَمَا", startPage: 104, endPage: 106 },
			{ id: 43, title: "يَا أَيُّهَا الَّذِينَ آمَنُوا", startPage: 106, endPage: 109 },
			{ id: 44, title: "وَلَقَدْ أَخَذَ اللَّهُ مِيثَاقَ بَنِي", startPage: 109, endPage: 112 },
			{ id: 45, title: "وَاتْلُ عَلَيْهِمْ نَبَأَ ابْنَيْ", startPage: 112, endPage: 114 },
			{ id: 46, title: "يَا أَيُّهَا الرَّسُولُ لَا يَحْزُنكَ", startPage: 114, endPage: 116 },
			{ id: 47, title: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا", startPage: 117, endPage: 119 },
			{ id: 48, title: "يَا أَيُّهَا الرَّسُولُ بَلِّغْ مَا", startPage: 119, endPage: 121 },
			{ id: 49, title: "لَتَجِدَنَّ أَشَدَّ النَّاسِ", startPage: 121, endPage: 124 },
			{ id: 50, title: "جَعَلَ اللَّهُ الْكَعْبَةَ الْبَيْتَ", startPage: 124, endPage: 125 },
			{ id: 51, title: "يَوْمَ يَجْمَعُ اللَّهُ الرُّسُلَ", startPage: 126, endPage: 129 },
			{ id: 52, title: "وَلَهُ مَا سَكَنَ فِي اللَّيْلِ", startPage: 129, endPage: 131 },
			{ id: 53, title: "إِنَّمَا يَسْتَجِيبُ الَّذِينَ", startPage: 132, endPage: 134 },
			{ id: 54, title: "وَعِندَهُ مَفَاتِحُ الْغَيْبِ لَا", startPage: 134, endPage: 136 },
			{ id: 55, title: "وَإِذْ قَالَ إِبْرَاهِيمُ لِأَبِيهِ", startPage: 137, endPage: 139 },
			{ id: 56, title: "إِنَّ اللَّهَ فَالِقُ الْحَبِّ", startPage: 140, endPage: 141 },
			{ id: 57, title: "وَلَوْ أَنَّنَا نَزَّلْنَا إِلَيْهِمُ", startPage: 142, endPage: 144 },
			{ id: 58, title: "لَهُمْ دَارُ السَّلَامِ عِندَ", startPage: 144, endPage: 146 },
			{ id: 59, title: "وَهُوَ الَّذِي أَنشَأَ جَنَّاتٍ", startPage: 146, endPage: 148 },
			{ id: 60, title: "قُلْ تَعَالَوْا أَتْلُ مَا حَرَّمَ", startPage: 148, endPage: 150 },
			{ id: 61, title: "المص", startPage: 151, endPage: 153 },
			{ id: 62, title: "يَا بَنِي آدَمَ خُذُوا زِينَتَكُمْ", startPage: 154, endPage: 156 },
			{ id: 63, title: "وَإِذَا صُرِفَتْ أَبْصَارُهُمْ", startPage: 156, endPage: 158 },
			{ id: 64, title: "وَإِلَىٰ عَادٍ أَخَاهُمْ هُودًا", startPage: 158, endPage: 161 },
			{ id: 65, title: "قَالَ الْمَلَأُ الَّذِينَ", startPage: 162, endPage: 164 },
			{ id: 66, title: "وَأَوْحَيْنَا إِلَىٰ مُوسَىٰ أَنْ", startPage: 164, endPage: 167 },
			{ id: 67, title: "وَوَاعَدْنَا مُوسَىٰ ثَلَاثِينَ", startPage: 167, endPage: 169 },
			{ id: 68, title: "وَاكْتُبْ لَنَا فِي هَٰذِهِ الدُّنْيَا", startPage: 170, endPage: 172 },
			{ id: 69, title: "وَإِذْ نَتَقْنَا الْجَبَلَ فَوْقَهُمْ", startPage: 173, endPage: 175 },
			{ id: 70, title: "هُوَ الَّذِي خَلَقَكُم مِّن نَّفْسٍ", startPage: 175, endPage: 176 },
			{ id: 71, title: "يَسْأَلُونَكَ عَنِ الْأَنفَالِ ۖ قُلِ", startPage: 177, endPage: 179 },
			{ id: 72, title: "إِنَّ شَرَّ الدَّوَابِّ عِندَ اللَّهِ", startPage: 179, endPage: 181 },
			{ id: 73, title: "وَاعْلَمُوا أَنَّمَا غَنِمْتُم مِّن", startPage: 182, endPage: 184 },
			{ id: 74, title: "وَإِن جَنَحُوا لِلسَّلْمِ فَاجْنَحْ", startPage: 184, endPage: 186 },
			{ id: 75, title: "بَرَاءَةٌ مِّنَ اللَّهِ وَرَسُولِهِ", startPage: 187, endPage: 189 },
			{ id: 76, title: "أَجَعَلْتُمْ سِقَايَةَ الْحَاجِّ", startPage: 189, endPage: 192 },
			{ id: 77, title: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِنَّ", startPage: 192, endPage: 194 },
			{ id: 78, title: "وَلَوْ أَرَادُوا الْخُرُوجَ", startPage: 194, endPage: 196 },
			{ id: 79, title: "إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ", startPage: 196, endPage: 199 },
			{ id: 80, title: "وَمِنْهُم مَّنْ عَاهَدَ اللَّهَ لَئِنْ", startPage: 199, endPage: 201 },
			{ id: 81, title: "إِنَّمَا السَّبِيلُ عَلَى الَّذِينَ", startPage: 201, endPage: 204 },
			{ id: 82, title: "إِنَّ اللَّهَ اشْتَرَىٰ مِنَ", startPage: 204, endPage: 206 },
			{ id: 83, title: "وَمَا كَانَ الْمُؤْمِنُونَ", startPage: 206, endPage: 209 },
			{ id: 84, title: "وَلَوْ يُعَجِّلُ اللَّهُ لِلنَّاسِ", startPage: 209, endPage: 211 },
			{ id: 85, title: "لِّلَّذِينَ أَحْسَنُوا الْحُسْنَىٰ", startPage: 212, endPage: 214 },
			{ id: 86, title: "وَيَسْتَنبِئُونَكَ أَحَقٌّ هُوَ ۖ قُلْ", startPage: 214, endPage: 216 },
			{ id: 87, title: "وَاتْلُ عَلَيْهِمْ نَبَأَ نُوحٍ إِذْ", startPage: 217, endPage: 219 },
			{ id: 88, title: "وَجَاوَزْنَا بِبَنِي إِسْرَائِيلَ", startPage: 219, endPage: 221 },
			{ id: 89, title: "وَمَا مِن دَابَّةٍ فِي الْأَرْضِ", startPage: 222, endPage: 224 },
			{ id: 90, title: "مَثَلُ الْفَرِيقَيْنِ كَالْأَعْمَىٰ", startPage: 224, endPage: 226 },
			{ id: 91, title: "وَقَالَ ارْكَبُوا فِيهَا بِسْمِ", startPage: 226, endPage: 228 },
			{ id: 92, title: "وَإِلَىٰ ثَمُودَ أَخَاهُمْ صَالِحًا", startPage: 228, endPage: 231 },
			{ id: 93, title: "وَإِلَىٰ مَدْيَنَ أَخَاهُمْ شُعَيْبًا", startPage: 231, endPage: 233 },
			{ id: 94, title: "وَأَمَّا الَّذِينَ سُعِدُوا فَفِي", startPage: 233, endPage: 236 },
			{ id: 95, title: "لَّقَدْ كَانَ فِي يُوسُفَ وَإِخْوَتِهِ", startPage: 236, endPage: 238 },
			{ id: 96, title: "وَقَالَ نِسْوَةٌ فِي الْمَدِينَةِ", startPage: 238, endPage: 241 },
			{ id: 97, title: "وَمَا أُبَرِّئُ نَفْسِي ۚ إِنَّ", startPage: 242, endPage: 244 },
			{ id: 98, title: "قَالُوا إِن يَسْرِقْ فَقَدْ سَرَقَ", startPage: 244, endPage: 247 },
			{ id: 99, title: "رَبِّ قَدْ آتَيْتَنِي مِنَ الْمُلْكِ", startPage: 247, endPage: 249 },
			{ id: 100, title: "وَإِن تَعْجَبْ فَعَجَبٌ قَوْلُهُمْ", startPage: 249, endPage: 251 },
			{ id: 101, title: "أَفَمَن يَعْلَمُ أَنَّمَا أُنزِلَ", startPage: 252, endPage: 253 },
			{ id: 102, title: "مَّثَلُ الْجَنَّةِ الَّتِي وُعِدَ", startPage: 254, endPage: 256 },
			{ id: 103, title: "قَالَتْ رُسُلُهُمْ أَفِي اللَّهِ شَكٌّ", startPage: 256, endPage: 259 },
			{ id: 104, title: "أَلَمْ تَرَ إِلَى الَّذِينَ بَدَّلُوا", startPage: 259, endPage: 261 },
			{ id: 105, title: "الر ۚ تِلْكَ آيَاتُ الْكِتَابِ", startPage: 262, endPage: 264 },
			{ id: 106, title: "نَبِّئْ عِبَادِي أَنِّي أَنَا الْغَفُورُ الرَّحِيمُ", startPage: 264, endPage: 267 },
			{ id: 107, title: "أَتَىٰ أَمْرُ اللَّهِ فَلَا", startPage: 267, endPage: 270 },
			{ id: 108, title: "وَقِيلَ لِلَّذِينَ اتَّقَوْا مَاذَا", startPage: 270, endPage: 272 },
			{ id: 109, title: "وَقَالَ اللَّهُ لَا تَتَّخِذُوا", startPage: 272, endPage: 275 },
			{ id: 110, title: "ضَرَبَ اللَّهُ مَثَلًا عَبْدًا", startPage: 275, endPage: 277 },
			{ id: 111, title: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ", startPage: 277, endPage: 279 },
			{ id: 112, title: "يَوْمَ تَأْتِي كُلُّ نَفْسٍ تُجَادِلُ", startPage: 280, endPage: 281 },
			{ id: 113, title: "سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ", startPage: 282, endPage: 284 },
			{ id: 114, title: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا", startPage: 284, endPage: 286 },
			{ id: 115, title: "قُلْ كُونُوا حِجَارَةً أَوْ حَدِيدًا", startPage: 287, endPage: 289 },
			{ id: 116, title: "وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ", startPage: 289, endPage: 292 },
			{ id: 117, title: "أَوَلَمْ يَرَوْا أَنَّ اللَّهَ الَّذِي", startPage: 292, endPage: 295 },
			{ id: 118, title: "وَتَرَى الشَّمْسَ إِذَا طَلَعَت", startPage: 295, endPage: 297 },
			{ id: 119, title: "وَاضْرِبْ لَهُم مَّثَلًا رَّجُلَيْنِ", startPage: 297, endPage: 299 },
			{ id: 120, title: "مَّا أَشْهَدتُّهُمْ خَلْقَ", startPage: 299, endPage: 301 },
			{ id: 121, title: "قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ لَن", startPage: 302, endPage: 304 },
			{ id: 122, title: "وَتَرَكْنَا بَعْضَهُمْ يَوْمَئِذٍ", startPage: 304, endPage: 306 },
			{ id: 123, title: "فَحَمَلَتْهُ فَانتَبَذَتْ بِهِ", startPage: 306, endPage: 309 },
			{ id: 124, title: "فَخَلَفَ مِن بَعْدِهِمْ خَلْفٌ", startPage: 309, endPage: 312 },
			{ id: 125, title: "طه", startPage: 312, endPage: 315 },
			{ id: 126, title: "مِنْهَا خَلَقْنَاكُمْ وَفِيهَا", startPage: 315, endPage: 317 },
			{ id: 127, title: "وَمَا أَعْجَلَكَ عَن قَوْمِكَ يَا", startPage: 317, endPage: 319 },
			{ id: 128, title: "وَعَنَتِ الْوُجُوهُ لِلْحَيِّ", startPage: 319, endPage: 321 },
			{ id: 129, title: "اقْتَرَبَ لِلنَّاسِ حِسَابُهُمْ", startPage: 322, endPage: 324 },
			{ id: 130, title: "وَمَن يَقُلْ مِنْهُمْ إِنِّي إِلَٰهٌ", startPage: 324, endPage: 326 },
			{ id: 131, title: "وَلَقَدْ آتَيْنَا إِبْرَاهِيمَ", startPage: 326, endPage: 329 },
			{ id: 132, title: "وَأَيُّوبَ إِذْ نَادَىٰ رَبَّهُ أَنِّي", startPage: 329, endPage: 331 },
			{ id: 133, title: "يَا أَيُّهَا النَّاسُ اتَّقُوا", startPage: 332, endPage: 334 },
			{ id: 134, title: "هَٰذَانِ خَصْمَانِ اخْتَصَمُوا فِي", startPage: 334, endPage: 336 },
			{ id: 135, title: "إِنَّ اللَّهَ يُدَافِعُ عَنِ الَّذِينَ", startPage: 336, endPage: 339 },
			{ id: 136, title: "ذَٰلِكَ وَمَنْ عَاقَبَ بِمِثْلِ مَا", startPage: 339, endPage: 341 },
			{ id: 137, title: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ", startPage: 342, endPage: 344 },
			{ id: 138, title: "هَيْهَاتَ هَيْهَاتَ لِمَا تُوعَدُونَ", startPage: 344, endPage: 346 },
			{ id: 139, title: "وَلَوْ رَحِمْنَاهُمْ وَكَشَفْنَا مَا", startPage: 347, endPage: 349 },
			{ id: 140, title: "سُورَةٌ أَنزَلْنَاهَا وَفَرَضْنَاهَا", startPage: 350, endPage: 351 },
			{ id: 141, title: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا", startPage: 352, endPage: 354 },
			{ id: 142, title: "اللَّهُ نُورُ السَّمَاوَاتِ", startPage: 354, endPage: 356 },
			{ id: 143, title: "وَأَقْسَمُوا بِاللَّهِ جَهْدَ", startPage: 356, endPage: 359 },
			{ id: 144, title: "تَبَارَكَ الَّذِي نَزَّلَ", startPage: 359, endPage: 361 },
			{ id: 145, title: "وَقَالَ الَّذِينَ لَا يَرْجُونَ", startPage: 362, endPage: 364 },
			{ id: 146, title: "وَهُوَ الَّذِي مَرَجَ الْبَحْرَيْنِ", startPage: 364, endPage: 366 },
			{ id: 147, title: "طسم", startPage: 367, endPage: 369 },
			{ id: 148, title: "وَأَوْحَيْنَا إِلَىٰ مُوسَىٰ أَنْ", startPage: 369, endPage: 371 },
			{ id: 149, title: "قَالُوا أَنُؤْمِنُ لَكَ وَاتَّبَعَكَ", startPage: 371, endPage: 374 },
			{ id: 150, title: "أَوْفُوا الْكَيْلَ وَلَا تَكُونُوا", startPage: 374, endPage: 376 },
			{ id: 151, title: "طس ۚ تِلْكَ آيَاتُ الْقُرْآنِ", startPage: 377, endPage: 379 },
			{ id: 152, title: "قَالَ سَنَنظُرُ أَصَدَقْتَ أَمْ كُنتَ", startPage: 379, endPage: 381 },
			{ id: 153, title: "فَمَا كَانَ جَوَابَ قَوْمِهِ إِلَّا", startPage: 382, endPage: 384 },
			{ id: 154, title: "وَإِذَا وَقَعَ الْقَوْلُ عَلَيْهِمْ", startPage: 384, endPage: 386 },
			{ id: 155, title: "وَحَرَّمْنَا عَلَيْهِ الْمَرَاضِعَ", startPage: 386, endPage: 388 },
			{ id: 156, title: "فَلَمَّا قَضَىٰ مُوسَى الْأَجَلَ", startPage: 389, endPage: 391 },
			{ id: 157, title: "وَلَقَدْ وَصَّلْنَا لَهُمُ الْقَوْلَ", startPage: 392, endPage: 394 },
			{ id: 158, title: "إِنَّ قَارُونَ كَانَ مِن قَوْمِ", startPage: 394, endPage: 396 },
			{ id: 159, title: "الم", startPage: 396, endPage: 399 },
			{ id: 160, title: "فَآمَنَ لَهُ لُوطٌ ۘ وَقَالَ إِنِّي", startPage: 399, endPage: 401 },
			{ id: 161, title: "وَلَا تُجَادِلُوا أَهْلَ الْكِتَابِ", startPage: 402, endPage: 404 },
			{ id: 162, title: "الم", startPage: 404, endPage: 407 },
			{ id: 163, title: "مُنِيبِينَ إِلَيْهِ وَاتَّقُوهُ", startPage: 407, endPage: 410 },
			{ id: 164, title: "اللَّهُ الَّذِي خَلَقَكُم مِّن ضَعْفٍ", startPage: 410, endPage: 413 },
			{ id: 165, title: "وَمَن يُسْلِمْ وَجْهَهُ إِلَى اللَّهِ", startPage: 413, endPage: 415 },
			{ id: 166, title: "قُلْ يَتَوَفَّاكُم مَّلَكُ الْمَوْتِ", startPage: 415, endPage: 417 },
			{ id: 167, title: "يَا أَيُّهَا النَّبِيُّ اتَّقِ", startPage: 418, endPage: 420 },
			{ id: 168, title: "قَدْ يَعْلَمُ اللَّهُ الْمُعَوِّقِينَ", startPage: 420, endPage: 421 },
			{ id: 169, title: "وَمَن يَقْنُتْ مِنكُنَّ لِلَّهِ", startPage: 422, endPage: 424 },
			{ id: 170, title: "تُرْجِي مَن تَشَاءُ مِنْهُنَّ", startPage: 425, endPage: 426 },
			{ id: 171, title: "لَّئِن لَّمْ يَنتَهِ الْمُنَافِقُونَ", startPage: 426, endPage: 429 },
			{ id: 172, title: "وَلَقَدْ آتَيْنَا دَاوُودَ مِنَّا", startPage: 429, endPage: 431 },
			{ id: 173, title: "قُلْ مَن يَرْزُقُكُم مِّنَ", startPage: 431, endPage: 433 },
			{ id: 174, title: "قُلْ إِنَّمَا أَعِظُكُم بِوَاحِدَةٍ", startPage: 433, endPage: 436 },
			{ id: 175, title: "يَا أَيُّهَا النَّاسُ أَنتُمُ", startPage: 436, endPage: 439 },
			{ id: 176, title: "إِنَّ اللَّهَ يُمْسِكُ السَّمَاوَاتِ", startPage: 439, endPage: 441 },
			{ id: 177, title: "وَمَا أَنزَلْنَا عَلَىٰ قَوْمِهِ مِن", startPage: 442, endPage: 444 },
			{ id: 178, title: "أَلَمْ أَعْهَدْ إِلَيْكُمْ يَا بَنِي", startPage: 444, endPage: 446 },
			{ id: 179, title: "احْشُرُوا الَّذِينَ ظَلَمُوا", startPage: 446, endPage: 449 },
			{ id: 180, title: "وَإِنَّ مِن شِيعَتِهِ لَإِبْرَاهِيمَ", startPage: 449, endPage: 451 },
			{ id: 181, title: "فَنَبَذْنَاهُ بِالْعَرَاءِ وَهُوَ", startPage: 451, endPage: 454 },
			{ id: 182, title: "وَهَلْ أَتَاكَ نَبَأُ الْخَصْمِ إِذْ", startPage: 454, endPage: 456 },
			{ id: 183, title: "وَعِندَهُمْ قَاصِرَاتُ الطَّرْفِ", startPage: 456, endPage: 459 },
			{ id: 184, title: "وَإِذَا مَسَّ الْإِنسَانَ ضُرٌّ دَعَا", startPage: 459, endPage: 461 },
			{ id: 185, title: "فَمَنْ أَظْلَمُ مِمَّن كَذَبَ عَلَى", startPage: 462, endPage: 464 },
			{ id: 186, title: "قُلْ يَا عِبَادِيَ الَّذِينَ", startPage: 464, endPage: 467 },
			{ id: 187, title: "حم", startPage: 467, endPage: 469 },
			{ id: 188, title: "أَوَلَمْ يَسِيرُوا فِي الْأَرْضِ", startPage: 469, endPage: 471 },
			{ id: 189, title: "ويا قوم مالي ادعوكم", startPage: 472, endPage: 474 },
			{ id: 190, title: "قُلْ إِنِّي نُهِيتُ أَنْ أَعْبُدَ", startPage: 474, endPage: 477 },
			{ id: 191, title: "قُلْ أَئِنَّكُمْ لَتَكْفُرُونَ", startPage: 477, endPage: 479 },
			{ id: 192, title: "وَقَيَّضْنَا لَهُمْ قُرَنَاءَ", startPage: 479, endPage: 481 },
			{ id: 193, title: "إِلَيْهِ يُرَدُّ عِلْمُ السَّاعَةِ", startPage: 482, endPage: 484 },
			{ id: 194, title: "شَرَعَ لَكُم مِّنَ الدِّينِ مَا", startPage: 484, endPage: 486 },
			{ id: 195, title: "وَلَوْ بَسَطَ اللَّهُ الرِّزْقَ", startPage: 486, endPage: 488 },
			{ id: 196, title: "وَمَا كَانَ لِبَشَرٍ أَن يُكَلِّمَهُ", startPage: 488, endPage: 491 },
			{ id: 197, title: "قَالَ أَوَلَوْ جِئْتُكُم بِأَهْدَىٰ", startPage: 491, endPage: 493 },
			{ id: 198, title: "وَلَمَّا ضُرِبَ ابْنُ مَرْيَمَ مَثَلًا", startPage: 493, endPage: 496 },
			{ id: 199, title: "وَلَقَدْ فَتَنَّا قَبْلَهُمْ قَوْمَ", startPage: 496, endPage: 499 },
			{ id: 200, title: "اللَّهُ الَّذِي سَخَّرَ لَكُمُ", startPage: 499, endPage: 502 },
			{ id: 201, title: "حم", startPage: 502, endPage: 504 },
			{ id: 202, title: "وَاذْكُرْ أَخَا عَادٍ إِذْ أَنذَرَ", startPage: 505, endPage: 507 },
			{ id: 203, title: "أَفَلَمْ يَسِيرُوا فِي الْأَرْضِ", startPage: 507, endPage: 510 },
			{ id: 204, title: "يَا أَيُّهَا الَّذِينَ آمَنُوا", startPage: 510, endPage: 513 },
			{ id: 205, title: "لَّقَدْ رَضِيَ اللَّهُ عَنِ", startPage: 513, endPage: 515 },
			{ id: 206, title: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا", startPage: 515, endPage: 517 },
			{ id: 207, title: "قَالَتِ الْأَعْرَابُ آمَنَّا ۖ قُل", startPage: 517, endPage: 519 },
			{ id: 208, title: "قَالَ قَرِينُهُ رَبَّنَا مَا", startPage: 519, endPage: 521 },
			{ id: 209, title: "قَالَ فَمَا خَطْبُكُمْ أَيُّهَا", startPage: 522, endPage: 524 },
			{ id: 210, title: "وَيَطُوفُ عَلَيْهِمْ غِلْمَانٌ", startPage: 524, endPage: 526 },
			{ id: 211, title: "وَكَم مِّن مَّلَكٍ فِي السَّمَاوَاتِ", startPage: 526, endPage: 529 },
			{ id: 212, title: "كَذَّبَتْ قَبْلَهُمْ قَوْمُ نُوحٍ", startPage: 529, endPage: 531 },
			{ id: 213, title: "الرَّحْمَٰنُ", startPage: 531, endPage: 534 },
			{ id: 214, title: "إِذَا وَقَعَتِ الْوَاقِعَةُ", startPage: 534, endPage: 536 },
			{ id: 215, title: "فَلَا أُقْسِمُ بِمَوَاقِعِ النُّجُومِ", startPage: 536, endPage: 539 },
			{ id: 216, title: "أَلَمْ يَأْنِ لِلَّذِينَ آمَنُوا أَن", startPage: 539, endPage: 541 },
			{ id: 217, title: "قَدْ سَمِعَ اللَّهُ قَوْلَ الَّتِي", startPage: 542, endPage: 544 },
			{ id: 218, title: "أَلَمْ تَرَ إِلَى الَّذِينَ تَوَلَّوْا", startPage: 544, endPage: 547 },
			{ id: 219, title: "أَلَمْ تَرَ إِلَى الَّذِينَ نَافَقُوا", startPage: 547, endPage: 550 },
			{ id: 220, title: "عَسَى اللَّهُ أَن يَجْعَلَ بَيْنَكُمْ", startPage: 550, endPage: 552 },
			{ id: 221, title: "يُسَبِّحُ لِلَّهِ مَا فِي", startPage: 553, endPage: 554 },
			{ id: 222, title: "وَإِذَا رَأَيْتَهُمْ تُعْجِبُكَ", startPage: 554, endPage: 557 },
			{ id: 223, title: "يَا أَيُّهَا النَّبِيُّ إِذَا", startPage: 558, endPage: 559 },
			{ id: 224, title: "يَا أَيُّهَا النَّبِيُّ لِمَ", startPage: 560, endPage: 561 },
			{ id: 225, title: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ", startPage: 562, endPage: 564 },
			{ id: 226, title: "ن ۚ وَالْقَلَمِ وَمَا يَسْطُرُونَ", startPage: 564, endPage: 566 },
			{ id: 227, title: "الْحَاقَّةُ", startPage: 566, endPage: 569 },
			{ id: 228, title: "إِنَّ الْإِنسَانَ خُلِقَ هَلُوعًا", startPage: 569, endPage: 571 },
			{ id: 229, title: "قُلْ أُوحِيَ إِلَيَّ أَنَّهُ", startPage: 572, endPage: 574 },
			{ id: 230, title: "إِنَّ رَبَّكَ يَعْلَمُ أَنَّكَ تَقُومُ", startPage: 575, endPage: 577 },
			{ id: 231, title: "لَا أُقْسِمُ بِيَوْمِ الْقِيَامَةِ", startPage: 577, endPage: 579 },
			{ id: 232, title: "وَيَطُوفُ عَلَيْهِمْ وِلْدَانٌ", startPage: 579, endPage: 581 },
			{ id: 233, title: "عَمَّ يَتَسَاءَلُونَ", startPage: 582, endPage: 584 },
			{ id: 234, title: "عَبَسَ وَتَوَلَّىٰ", startPage: 585, endPage: 586 },
			{ id: 235, title: "إِذَا السَّمَاءُ انفَطَرَتْ", startPage: 587, endPage: 589 },
			{ id: 236, title: "إِذَا السَّمَاءُ انشَقَّتْ", startPage: 589, endPage: 591 },
			{ id: 237, title: "سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى", startPage: 591, endPage: 594 },
			{ id: 238, title: "لَا أُقْسِمُ بِهَٰذَا الْبَلَدِ", startPage: 594, endPage: 596 },
			{ id: 239, title: "أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ", startPage: 596, endPage: 600 },
			{ id: 240, title: "أَفَلَا يَعْلَمُ إِذَا بُعْثِرَ مَا", startPage: 600, endPage: 604 }
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
