'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

'use strict';

var Stage = function () {
	function Stage(row, col, levelTotal) {
		var _this = this;

		_classCallCheck(this, Stage);

		this.row = row;
		this.col = col;
		this.levelTotal = levelTotal || 5;
		this.liElements = [];
		this.score = new Score();
		this.level = 1;
		this.MESSAGE = 'CONGRATULATIONS';
		this.TOTAL = 100 * this.levelTotal;

		var slider = document.querySelector('#level');
		slider.max = this.levelTotal;
		slider.addEventListener('change', function () {
			_this.level = slider.valueAsNumber;
			document.querySelector('#range-value').textContent = slider.value;
			_this.render();
		});
	}

	// DOM


	_createClass(Stage, [{
		key: 'prepstage',
		value: function prepstage() {
			this.ground = document.querySelector('#game');
			this.pause = document.querySelector('#pause');
			this.play = document.querySelector('#play');
			var span = document.createElement('span');
			var li = document.createElement('li');

			// create the grid
			for (var i = 0; i < this.row * this.col; i++) {
				var cloneLi = li.cloneNode(false),
				    cloneSpan = span.cloneNode(false);

				cloneLi.appendChild(cloneSpan);
				this.ground.appendChild(cloneLi);
				this.liElements.push(cloneLi);
			}
		}
	}, {
		key: 'start',
		value: function start() {

			this.prepstage();

			// set Interval in creating moles
			this.render();

			// bind interface events
			this.addEvents();
		}
	}, {
		key: 'render',
		value: function render() {
			var _this2 = this;

			//make sure timer is cleared whenever this function is called
			this.timer && this.timer.clear();

			this.timer = new Timer(this.level);

			var mole = new Mole(this.level);

			// caching the list elements for each level
			var prevMole = {};
			// caching
			this.timer.setTimer(function () {

				var moles = mole.create(_this2.row * _this2.col);

				// reset the state of moles we missed
				for (var prop in prevMole) {
					if (prevMole[prop] !== undefined) {
						prevMole[prop].querySelector('span').classList.remove(mole.className);
						prevMole[prop].querySelector('span').classList.remove('backdown');
					}
				}
				// populate new moles in DOM
				for (var el in moles) {
					prevMole[el] = _this2.liElements[el];
					prevMole[el].querySelector('span').classList.add(mole.className);
				}
			});
		}
	}, {
		key: 'addEvents',
		value: function addEvents() {
			var _this3 = this;

			var scoreDOM = document.querySelector('#score');
			var sliderDOM = document.querySelector('#level');
			var rangeDOM = document.querySelector('#range-value');

			this.pause.addEventListener('click', function (e) {
				_this3.timer.clear();
			});

			this.play.addEventListener('click', function (e) {
				_this3.render();
			});

			this.ground.addEventListener('click', function (e) {
				if (!e.target || e.target.nodeName.toLowerCase() !== 'span' || !e.target.classList.contains('popup')) {
					return;
				}
				// when clicked on a mole, increase score, update score in DOM, update mole class to play the down animation
				_this3.score.add();
				scoreDOM.innerHTML = _this3.score.total;
				e.target.classList.remove('popup');
				e.target.classList.add('backdown');

				// stop running the logic below when score is not enough to level up
				if (_this3.score.total % 100 !== 0) {
					return;
				}
				// it's time to level up or game over
				// reset the timer
				_this3.timer.clear();

				// Game over
				if (_this3.score.total === _this3.TOTAL) {
					scoreDOM.parentNode.innerHTML = _this3.MESSAGE;
					// game over reset all the moles
					_this3.liElements.forEach(function (el) {
						el.childNodes[0].classList.remove('popup');
					});
					return;
				}

				// max level is set in the slider input
				if (_this3.level < _this3.levelTotal) {
					_this3.level++;
				}

				// populate the moles
				_this3.render();
				sliderDOM.value = _this3.level;
				rangeDOM.textContent = _this3.level;
			}, false);
		}
	}]);

	return Stage;
}();

;

// Game design:
// speed increase by 100ms when level up

var Timer = function () {
	function Timer(level) {
		_classCallCheck(this, Timer);

		this.level = level || 1;
		this.timer = this.level < 4 ? 3000 - 100 * this.level : 3000 - 200 * this.level;
	}

	_createClass(Timer, [{
		key: 'setTimer',
		value: function setTimer(func) {
			var _this4 = this;

			// use recursive setTimeout instead of setInterval to make sure func() always runs in syncronous
			var intervalFunc = function intervalFunc() {
				func();

				_this4.interval = setTimeout(intervalFunc, _this4.timer);
			};
			this.interval = setTimeout(intervalFunc, this.timer);
		}
	}, {
		key: 'clear',
		value: function clear() {
			clearTimeout(this.interval);
		}
	}]);

	return Timer;
}();

;

var Score = function () {
	function Score() {
		_classCallCheck(this, Score);

		this.score = 0;
	}

	_createClass(Score, [{
		key: 'add',
		value: function add() {
			this.score += 10;
		}
	}, {
		key: 'total',
		get: function get() {
			return this.score;
		}
	}]);

	return Score;
}();

;

// Game design:
// when level up, increase instances of Mole
// when level is greater than 3, only increase speed of mole disappearing

var Mole = function () {
	function Mole(level) {
		_classCallCheck(this, Mole);

		this.level = level < 4 ? level : 3;
		this.className = 'popup';
	}

	// use hash map to store the mole active state
	// {index: speed}
	// Math.floor((Math.random() * grid): range of number is 1 - (grid-1)


	_createClass(Mole, [{
		key: 'create',
		value: function create(grid) {
			var obj = {};
			for (var i = 0; i < this.level; i++) {
				var index = Math.floor(Math.random() * grid + 1) - 1;
				obj[index] = true;
			}
			return obj;
		}
	}]);

	return Mole;
}();

;

// put together
var app = function () {

	function initialize() {
		var stage1 = new Stage(2, 3, 10);
		stage1.start();
	}

	return {
		init: initialize
	};
}();

app.init();