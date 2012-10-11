
// based on http://stackoverflow.com/a/962890/90670
Array.prototype.shuffle = function() {
	var tmp, current, top = this.length;

    if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = this[current];
        this[current] = this[top];
        this[top] = tmp;
    }

    return this;
};

var sgudjonsson = sgudjonsson || {};

sgudjonsson.puzzle = (function() {

	var _puzzles = [],
		_width = 0,
		_height = 0,
        _history = {
            index: 0,
            stack: []
        };

	var _init = function(x,y) {

		_puzzles = [];
		_width = x;
		_height = y;

		// add (x*y) - 1 number of puzzles
		for(var i = 0; i < (x*y) - 1; i++) {
			_puzzles.push({number: i, isBlank: false});
		}

		// add the last puzzle as a blank puzzle
		_puzzles.push({number: _puzzles.length, isBlank: true});
		_puzzles.shuffle();

		// set the puzzle coords foreach y and x
		var index = 0;
		for(var yy = 0; yy < y; yy++) {
			for(var xx = 0; xx < x; xx++) {
				_puzzles[index].x = xx;
				_puzzles[index].y = yy;
				index++;
			}
		}

		return _puzzles;

	};

	var _checkPuzzleProgress = function() {

		// next puzzle should contain the next number in the sequence of 0 to ((x*y) - 1)
		var lastNumber = -1;
		for(var i = 0; i < _puzzles.length; i++) {
			if(_puzzles[i].number != lastNumber + 1)
				return false;
			lastNumber = _puzzles[i].number;
		}

		return true;
	};

	var _getBlankPuzzleIndex = function() {

		for(var i = 0; i < _puzzles.length; i++) {
			if(_puzzles[i].isBlank)
				return i;
		}

		throw "Missing blank puzzle piece!";

	};

	var _movePuzzleAtIndex = function(index) {

		var blankPuzzleIndex = _getBlankPuzzleIndex();

		if(blankPuzzleIndex == index)
			return undefined;

		var puzzleIndexesThatCanBeMoved = _getMovablePuzzleIndexes();

		if(puzzleIndexesThatCanBeMoved.indexOf(index) > -1) {

			var copyCurrentPuzzle = {
				number: _puzzles[index].number,
				x: _puzzles[blankPuzzleIndex].x,
				y: _puzzles[blankPuzzleIndex].y,
				isBlank: false
			};

			var copyBlankPuzzle = {
				number: _puzzles[blankPuzzleIndex].number,
				x: _puzzles[index].x,
				y: _puzzles[index].y,
				isBlank: true
			};

			_puzzles[index] = copyBlankPuzzle;
			_puzzles[blankPuzzleIndex] = copyCurrentPuzzle;

			var move = {
				blank: _puzzles[index],
				puzzle: _puzzles[blankPuzzleIndex]
			};

			_history.stack[++_history.index] = move;
			_history.stack.splice(_history.index + 1);

			return move;
		}

		return undefined;
	};

	var _undo = function() {
		if(_history.index > 0)
			return _history.stack[--_history.index];
	};

	var _redo = function() {
		if(_history.index < _history.stack.length - 1)
			return _history.stack[++_history.index];
	};


	var _getIndexByCoords = function(x, y) {

		for(var p in _puzzles)
			if(_puzzles[p].x == x && _puzzles[p].y == y)
				return _puzzles.indexOf(_puzzles[p]);					

		return undefined;
	};

	var _getMovablePuzzleIndexes = function() {

		var blankPuzzleIndex = _getBlankPuzzleIndex();
		var blankPuzzle = _puzzles[blankPuzzleIndex];

		var isCoordsOverflow = function(x, y) {
			if(x > (_width - 1) || x < 0 || y > (_height - 1) || y < 0)
				return true;

			return false;
		};


		var coords = {
			left: { x: blankPuzzle.x - 1, y: blankPuzzle.y },
			right: { x: blankPuzzle.x + 1, y: blankPuzzle.y },
			above: { x: blankPuzzle.x, y: blankPuzzle.y - 1},
			below: { x: blankPuzzle.x, y: blankPuzzle.y + 1}
		};

		var indexes = []
		for(var c in coords) {
			if(!isCoordsOverflow(coords[c].x, coords[c].y))
				indexes.push(_getIndexByCoords(coords[c].x, coords[c].y));
		}

		return indexes;
	};

	return {

		init: function(x,y) {
			return _init(x || 4, y || 4);
		},
		movePuzzleAtIndex: function(index) {
			return _movePuzzleAtIndex(index);
		},
		movePuzzleAtCoords: function(x, y) {
			return _movePuzzleAtIndex(_getIndexByCoords(x, y));
		},
		isComplete: function() {
			return _checkPuzzleProgress();
		},
		undo: function() {
			return _undo();
		},
		redo: function() {
			return _redo();
		},
		history: function() {
			return _history;
		},
		_debug: function() {

			var index = 0;
			for(var i = 0; i < _width; i++) {
				var numbers = [];
				for(var j = 0; j < _height; j++) {
					numbers.push(_puzzles[index].number);
					index++;
				}
				console.log(numbers.join());
			}

			return _checkPuzzleProgress();
		}

	};
	
})();