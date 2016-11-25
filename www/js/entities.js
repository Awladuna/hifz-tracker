app.factory('User', [function () {
	function User(userData) {
		if (userData) {
			this.setData(userData);
		}
	};
	User.prototype = {
		setData: function (userData) {
			angular.extend(this, userData);
		},
		getStats: function () {
			if (!this.wirds) { return []; }
			return [
				{ color: '#ef473a', count: this.wirds.filter(function (w) { return w.rating === 'POOR'; }).length },
				{ color: '#ffc900', count: this.wirds.filter(function (w) { return w.rating === 'WEAK'; }).length },
				{ color: '#387ef5', count: this.wirds.filter(function (w) { return w.rating === 'OKAY'; }).length },
				{ color: '#33cd5f', count: this.wirds.filter(function (w) { return w.rating === 'PERFECT'; }).length }
			]
		}
	};
	return User;
}]);
