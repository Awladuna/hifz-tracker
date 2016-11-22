app.filter('excludeItemsById', function () {
		return function (items, excludedItems) {
			// Skip the filter if no excluded items
			if (!excludedItems || !excludedItems.length) { return items; }
			// Filter out excluded items
			return items.filter(function (item) {
				return !excludedItems.some(function (eItem) {
					return eItem.id === item.id;
				});
			});
		};
	});

app.filter('localizeDate', function () {
		return function (date) {
			if (!date) return;
			// var code = LanguageService.getPreferred().code;
			var code = allLanguages[0].code;
			return moment(date, 'l').locale(code).format('l');
		};
	});

app.filter('surahName', function () {
		return function (startPage) {
			if (!startPage) return;
			var containingSurahs = allSurahs.filter(function (surah) {
				return surah.startPage <= startPage && surah.endPage >= startPage;
			});
			return containingSurahs[0] ? containingSurahs[0].title : "";
		};
	});