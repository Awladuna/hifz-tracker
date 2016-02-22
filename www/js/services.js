_array_findById = function(arr, id) {
	for(var el in arr) {
		// hasOwnProperty ensures prototypes aren't considered
		if(arr.hasOwnProperty(el)) {
			if(arr[el].id == id) return arr[el];
		}
	}

	return undefined;
}

angular.module('hifzTracker.services', [])

.factory('$localstorage', ['$window', function($window) {
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
    }
  }
}])

.factory('UserService', [ '$localstorage', 'User', function($localstorage, User) {
  return {
  	_pool: [],
	_retrieveInstance: function(user) {
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
 	getAllUsers: function() {
 		var scope = this;

  		$localstorage.getArray('users').forEach( function(user) {
  			scope._retrieveInstance(user);
  		});

  		return this._pool;
  	},
    saveUser: function(user) {
    	this._retrieveInstance(user);
    	$localstorage.setArray('users', this._pool);
    },
    addUser: function(user) {
    	// Get all user ids and sort them
    	var ids = this._pool.map( function(u) {
    		return u.id;
    	}).sort();
    	// Set the new user Id to the next number
    	user.id = ids[ids.length - 1] + 1 || 1;
    	user.wirds = [];

    	this.saveUser(user);
    }
  }
}])

.factory('Surahs', [function() {
  var allSurahs = [
		{ id: 1, title: "Al-Fatihah", startPage: 1, endPage: 1},
		{ id: 2, title: "Al-Baqarah", startPage: 2, endPage: 49},
		{ id: 3, title: "Al-Imran", startPage: 50, endPage: 76},
		{ id: 4, title: "An-Nisa'", startPage: 77, endPage: 106},
		{ id: 5, title: "Al-Ma'idah", startPage: 106, endPage: 127},
		{ id: 6, title: "Al-An'am", startPage: 128, endPage: 150},
		{ id: 7, title: "Al-A'raf", startPage: 151, endPage: 176},
		{ id: 8, title: "Al-Anfal", startPage: 177, endPage: 186},
		{ id: 9, title: "At-Taubah", startPage: 187, endPage: 207},
		{ id: 10, title: "Yunus", startPage: 208, endPage: 221},
		{ id: 11, title: "Hud", startPage: 221, endPage: 235},
		{ id: 12, title: "Yusuf", startPage: 235, endPage: 248},
		{ id: 13, title: "Ar-Ra'd", startPage: 249, endPage: 255},
		{ id: 14, title: "Ibrahim", startPage: 255, endPage: 261},
		{ id: 15, title: "Al-Hijr", startPage: 262, endPage: 267},
		{ id: 16, title: "An-Nahl", startPage: 267, endPage: 281},
		{ id: 17, title: "Al-Isra", startPage: 282, endPage: 293},
		{ id: 18, title: "Al-Kahf", startPage: 293, endPage: 304},
		{ id: 19, title: "Maryam", startPage: 305, endPage: 312},
		{ id: 20, title: "Ta Ha", startPage: 312, endPage: 321},
		{ id: 21, title: "Al-Anbiya'", startPage: 322, endPage: 331},
		{ id: 22, title: "Al-Hajj", startPage: 332, endPage: 341},
		{ id: 23, title: "Al-Mu'minun", startPage: 342, endPage: 349},
		{ id: 24, title: "An-Nur", startPage: 350, endPage: 359},
		{ id: 25, title: "Al-Furqan", startPage: 359, endPage: 366},
		{ id: 26, title: "Ash-Shu'ara'", startPage: 367, endPage: 376},
		{ id: 27, title: "An-Naml", startPage: 377, endPage: 385},
		{ id: 28, title: "Al-Qasas", startPage: 385, endPage: 396},
		{ id: 29, title: "Al-'Ankabut", startPage: 396, endPage: 404},
		{ id: 30, title: "Ar-Rum", startPage: 404, endPage: 410},
		{ id: 31, title: "Luqman", startPage: 411, endPage: 414},
		{ id: 32, title: "As-Sajdah", startPage: 415, endPage: 417},
		{ id: 33, title: "Al-Ahzab", startPage: 418, endPage: 427},
		{ id: 34, title: "Saba'", startPage: 428, endPage: 434},
		{ id: 35, title: "Fatir", startPage: 434, endPage: 440},
		{ id: 36, title: "Ya Sin", startPage: 440, endPage: 445},
		{ id: 37, title: "As-Saffat", startPage: 446, endPage: 452},
		{ id: 38, title: "Sad", startPage: 453, endPage: 458},
		{ id: 39, title: "Az-Zumar", startPage: 458, endPage: 467},
		{ id: 40, title: "Ghafir", startPage: 467, endPage: 476},
		{ id: 41, title: "Fussilat", startPage: 477, endPage: 482},
		{ id: 42, title: "Ash-Shura", startPage: 483, endPage: 489},
		{ id: 43, title: "Az-Zukhruf", startPage: 489, endPage: 495},
		{ id: 44, title: "Ad-Dukhan", startPage: 496, endPage: 498},
		{ id: 45, title: "Al-Jathiyah", startPage: 499, endPage: 502},
		{ id: 46, title: "Al-Ahqaf", startPage: 502, endPage: 506},
		{ id: 47, title: "Muhammad", startPage: 507, endPage: 510},
		{ id: 48, title: "Al-Fath", startPage: 511, endPage: 515},
		{ id: 49, title: "Al-Hujurat", startPage: 515, endPage: 517},
		{ id: 50, title: "Qaf", startPage: 518, endPage: 520},
		{ id: 51, title: "Ad-Dhariyat", startPage: 520, endPage: 523},
		{ id: 52, title: "At-Tur", startPage: 523, endPage: 525},
		{ id: 53, title: "An-Najm", startPage: 526, endPage: 528},
		{ id: 54, title: "Al-Qamar", startPage: 528, endPage: 531},
		{ id: 55, title: "Ar-Rahman", startPage: 531, endPage: 534},
		{ id: 56, title: "Al-Waqi'ah", startPage: 534, endPage: 537},
		{ id: 57, title: "Al-Hadid", startPage: 537, endPage: 541},
		{ id: 58, title: "Al-Mujadilah", startPage: 542, endPage: 545},
		{ id: 59, title: "Al-Hashr", startPage: 545, endPage: 548},
		{ id: 60, title: "Al-Mumtahanah", startPage: 549, endPage: 551},
		{ id: 61, title: "As-Saff", startPage: 551, endPage: 552},
		{ id: 62, title: "Al-Jumu'ah", startPage: 553, endPage: 554},
		{ id: 63, title: "Al-Munafiqun", startPage: 554, endPage: 555},
		{ id: 64, title: "At-Taghabun", startPage: 556, endPage: 557},
		{ id: 65, title: "At-Talaq,", startPage: 558, endPage: 559},
		{ id: 66, title: "At-Tahrim", startPage: 560, endPage: 561},
		{ id: 67, title: "Al-Mulk", startPage: 562, endPage: 564},
		{ id: 68, title: "Al-Qalam", startPage: 564, endPage: 566},
		{ id: 69, title: "Al-Haqqah", startPage: 566, endPage: 568},
		{ id: 70, title: "Al-Ma'arij", startPage: 568, endPage: 570},
		{ id: 71, title: "Nuh", startPage: 570, endPage: 571},
		{ id: 72, title: "Al-Jinn", startPage: 572, endPage: 573},
		{ id: 73, title: "Al-Muzammil", startPage: 574, endPage: 575},
		{ id: 74, title: "Al-Mudathir", startPage: 575, endPage: 577},
		{ id: 75, title: "Al-Qiyamah", startPage: 577, endPage: 578},
		{ id: 76, title: "Al-Insane", startPage: 578, endPage: 580},
		{ id: 77, title: "Al-Mursalat", startPage: 580, endPage: 581},
		{ id: 78, title: "An-Naba'", startPage: 582, endPage: 583},
		{ id: 79, title: "An-Nazi'at", startPage: 583, endPage: 584},
		{ id: 80, title: "'Abasa", startPage: 585, endPage: 586},
		{ id: 81, title: "At-Takwir", startPage: 586, endPage: 586},
		{ id: 82, title: "Al-Infitar", startPage: 587, endPage: 587},
		{ id: 83, title: "Al-Mutaffifeen", startPage: 587, endPage: 589},
		{ id: 84, title: "Al-Inshiqaq", startPage: 589, endPage: 590},
		{ id: 85, title: "Al-Buruj", startPage: 590, endPage: 590},
		{ id: 86, title: "At-Tariq", startPage: 591, endPage: 591},
		{ id: 87, title: "Al-A'la", startPage: 591, endPage: 592},
		{ id: 88, title: "Al-Ghashiya", startPage: 592, endPage: 593},
		{ id: 89, title: "Al-Fajr", startPage: 593, endPage: 594},
		{ id: 90, title: "Al-Balad", startPage: 594, endPage: 595},
		{ id: 91, title: "Ash-Shams", startPage: 595, endPage: 595},
		{ id: 92, title: "Al-Layl", startPage: 595, endPage: 596},
		{ id: 93, title: "Ad-Duha", startPage: 596, endPage: 596},
		{ id: 94, title: "Ash-Sharh", startPage: 596, endPage: 597},
		{ id: 95, title: "At-Tin", startPage: 597, endPage: 597},
		{ id: 96, title: "Al-'Alaq", startPage: 597, endPage: 598},
		{ id: 97, title: "Al-qadr", startPage: 598, endPage: 598},
		{ id: 98, title: "Al-Bayyinah", startPage: 598, endPage: 599},
		{ id: 99, title: "Az-Zalzala", startPage: 599, endPage: 599},
		{ id: 100, title: "Al-'Adiyat", startPage: 599, endPage: 600},
		{ id: 101, title: "Al-Qari'ah", startPage: 600, endPage: 600},
		{ id: 102, title: "At-Takathur", startPage: 600, endPage: 600},
		{ id: 103, title: "Al-'Asr", startPage: 601, endPage: 601},
		{ id: 104, title: "Al-Humazah", startPage: 601, endPage: 601},
		{ id: 105, title: "Al-Fil", startPage: 601, endPage: 601},
		{ id: 106, title: "Al-Quraish", startPage: 602, endPage: 602},
		{ id: 107, title: "Al-Ma'un", startPage: 602, endPage: 602},
		{ id: 108, title: "Al-Kauthar", startPage: 602, endPage: 602},
		{ id: 109, title: "Al-Kafirun", startPage: 603, endPage: 603},
		{ id: 110, title: "An-Nasr", startPage: 603, endPage: 603},
		{ id: 111, title: "Al-Masad", startPage: 603, endPage: 603},
		{ id: 112, title: "Al-Ikhlas", startPage: 604, endPage: 604},
		{ id: 113, title: "Al-Falaq", startPage: 604, endPage: 604},
		{ id: 114, title: "An-Nas", startPage: 604, endPage: 604}
  ];
	return {
		getAllSurahs: function() {
			return allSurahs;
		},
		getSurahById: function(id) {
			return _array_findById(allSurahs, id);
		}
	}
}]);
