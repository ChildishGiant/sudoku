/* globals sudoku */
// title:  Sudoku
// author: ChildishGiant
// desc:   An implementation of the classic game of sudoku
// script: js

// Options

// Changing this to false will disable the need to hold down x to move the cursor
const hold_to_move = true;

// Changing this to false will make any square with multiple answers show as *
const minis_on = true;

// Changing this to true will tell you whenever you mess up, instead of only when you press hint
const auto_fail = false;

// Setting this to a valid puzzle string will load that puzzle over generating one
const set_puzzle = false;
// Here's a really tough one I use for testing
// set_puzzle = "29583476137462159816879524354127398672691843583945617295238761448716235961354982.";

// How long menu arrows stay "blinked" in or out for in ms
const blink_rate = 250;


// Colours

// Colour index for mini pips
const mini_colour = 10;

// Colour index for numbers filled in by the computer
const confirmed_colour = 13;

// Colour index for numbers filled in by the player
const user_colour = 12;

// Colour index for highlighting hints
const hint_colour = 8;

// Colour for the popup when an error's checked
const box_colour = 5;

// Colours for different difficulties to use
const diffColours = [10, 4, 8, 5, 7, 9];

// Colour used to write dev text
const dev_colour = 14;

// Turns on some dev tools
var dev = false;

// Here ends the variables you should fiddle with without reading the code;

// https://github.com/robatron/sudoku.js
// eslint-disable-next-line
(function(root){var sudoku=root.sudoku={};sudoku.DIGITS="123456789";var ROWS="ABCDEFGHI";var COLS=sudoku.DIGITS;var SQUARES=null;var UNITS=null;var SQUARE_UNITS_MAP=null;var SQUARE_PEERS_MAP=null;var MIN_GIVENS=17;var NR_SQUARES=81;var DIFFICULTY={"easy":62,"medium":53,"hard":44,"very-hard":35,"insane":26,"inhuman":17};sudoku.BLANK_CHAR='.';sudoku.BLANK_BOARD=".................................................................................";function initialize(){SQUARES=sudoku._cross(ROWS,COLS);UNITS=sudoku._get_all_units(ROWS,COLS);SQUARE_UNITS_MAP=sudoku._get_square_units_map(SQUARES,UNITS);SQUARE_PEERS_MAP=sudoku._get_square_peers_map(SQUARES,SQUARE_UNITS_MAP)}sudoku.generate=function(difficulty,unique){if(typeof difficulty==="string"||typeof difficulty==="undefined"){difficulty=DIFFICULTY[difficulty]||DIFFICULTY.easy}difficulty=sudoku._force_range(difficulty,NR_SQUARES+1,MIN_GIVENS);unique=unique||true;var blank_board="";for(var i=0;i<NR_SQUARES;i+=1){blank_board+='.'}var candidates=sudoku._get_candidates_map(blank_board);var shuffled_squares=sudoku._shuffle(SQUARES);for(var si in shuffled_squares){var square=shuffled_squares[si];var rand_candidate_idx=sudoku._rand_range(candidates[square].length);var rand_candidate=candidates[square][rand_candidate_idx];if(!sudoku._assign(candidates,square,rand_candidate)){break}var single_candidates=[];for(var si in SQUARES){var square=SQUARES[si];if(candidates[square].length==1){single_candidates.push(candidates[square])}}if(single_candidates.length>=difficulty&&sudoku._strip_dups(single_candidates).length>=8){var board="";var givens_idxs=[];for(var i in SQUARES){var square=SQUARES[i];if(candidates[square].length==1){board+=candidates[square];givens_idxs.push(i)}else{board+=sudoku.BLANK_CHAR}}var nr_givens=givens_idxs.length;if(nr_givens>difficulty){givens_idxs=sudoku._shuffle(givens_idxs);for(var i=0;i<nr_givens-difficulty;i+=1){var target=parseInt(givens_idxs[i]);board=board.substr(0,target)+sudoku.BLANK_CHAR+board.substr(target+1)}}if(sudoku.solve(board)){return board}}}return sudoku.generate(difficulty)};sudoku.solve=function(board,reverse){var report=sudoku.validate_board(board);if(report!==true){throw report}var nr_givens=0;for(var i in board){if(board[i]!==sudoku.BLANK_CHAR&&sudoku._in(board[i],sudoku.DIGITS)){nr_givens+=1}}if(nr_givens<MIN_GIVENS){throw "Too few givens. Minimum givens is "+MIN_GIVENS}reverse=reverse||false;var candidates=sudoku._get_candidates_map(board);var result=sudoku._search(candidates,reverse);if(result){var solution="";for(var square in result){solution+=result[square]}return solution}return false};sudoku.get_candidates=function(board){var report=sudoku.validate_board(board);if(report!==true){throw report}var candidates_map=sudoku._get_candidates_map(board);if(!candidates_map){return false}var rows=[];var cur_row=[];var i=0;for(var square in candidates_map){var candidates=candidates_map[square];cur_row.push(candidates);if(i%9==8){rows.push(cur_row);cur_row=[]}i+=1}return rows};sudoku._get_candidates_map=function(board){var report=sudoku.validate_board(board);if(report!==true){throw report}var candidate_map={};var squares_values_map=sudoku._get_square_vals_map(board);for(var si in SQUARES){candidate_map[SQUARES[si]]=sudoku.DIGITS}for(var square in squares_values_map){var val=squares_values_map[square];if(sudoku._in(val,sudoku.DIGITS)){var new_candidates=sudoku._assign(candidate_map,square,val);if(!new_candidates){return false}}}return candidate_map};sudoku._search=function(candidates,reverse){if(!candidates){return false}reverse=reverse||false;var max_nr_candidates=0;var max_candidates_square=null;for(var si in SQUARES){var square=SQUARES[si];var nr_candidates=candidates[square].length;if(nr_candidates>max_nr_candidates){max_nr_candidates=nr_candidates;max_candidates_square=square}}if(max_nr_candidates===1){return candidates}var min_nr_candidates=10;var min_candidates_square=null;for(si in SQUARES){var square=SQUARES[si];var nr_candidates=candidates[square].length;if(nr_candidates<min_nr_candidates&&nr_candidates>1){min_nr_candidates=nr_candidates;min_candidates_square=square}}var min_candidates=candidates[min_candidates_square];if(!reverse){for(var vi in min_candidates){var val=min_candidates[vi];var candidates_copy=JSON.parse(JSON.stringify(candidates));var candidates_next=sudoku._search(sudoku._assign(candidates_copy,min_candidates_square,val));if(candidates_next){return candidates_next}}}else{for(var vi=min_candidates.length-1;vi>=0;vi-=1){var val=min_candidates[vi];var candidates_copy=JSON.parse(JSON.stringify(candidates));var candidates_next=sudoku._search(sudoku._assign(candidates_copy,min_candidates_square,val),reverse);if(candidates_next){return candidates_next}}}return false};sudoku._assign=function(candidates,square,val){var other_vals=candidates[square].replace(val,"");for(var ovi in other_vals){var other_val=other_vals[ovi];var candidates_next=sudoku._eliminate(candidates,square,other_val);if(!candidates_next){return false}}return candidates};sudoku._eliminate=function(candidates,square,val){if(!sudoku._in(val,candidates[square])){return candidates}candidates[square]=candidates[square].replace(val,'');var nr_candidates=candidates[square].length;if(nr_candidates===1){var target_val=candidates[square];for(var pi in SQUARE_PEERS_MAP[square]){var peer=SQUARE_PEERS_MAP[square][pi];var candidates_new=sudoku._eliminate(candidates,peer,target_val);if(!candidates_new){return false}}}if(nr_candidates===0){return false}for(var ui in SQUARE_UNITS_MAP[square]){var unit=SQUARE_UNITS_MAP[square][ui];var val_places=[];for(var si in unit){var unit_square=unit[si];if(sudoku._in(val,candidates[unit_square])){val_places.push(unit_square)}}if(val_places.length===0){return false;}else if(val_places.length===1){var candidates_new=sudoku._assign(candidates,val_places[0],val);if(!candidates_new){return false}}}return candidates};sudoku._get_square_vals_map=function(board){var squares_vals_map={};if(board.length!=SQUARES.length){throw "Board/squares length mismatch."}else{for(var i in SQUARES){squares_vals_map[SQUARES[i]]=board[i]}}return squares_vals_map};sudoku._get_square_units_map=function(squares,units){var square_unit_map={};for(var si in squares){var cur_square=squares[si];var cur_square_units=[];for(var ui in units){var cur_unit=units[ui];if(cur_unit.indexOf(cur_square)!==-1){cur_square_units.push(cur_unit)}}square_unit_map[cur_square]=cur_square_units}return square_unit_map};sudoku._get_square_peers_map=function(squares,units_map){var square_peers_map={};for(var si in squares){var cur_square=squares[si];var cur_square_units=units_map[cur_square];var cur_square_peers=[];for(var sui in cur_square_units){var cur_unit=cur_square_units[sui];for(var ui in cur_unit){var cur_unit_square=cur_unit[ui];if(cur_square_peers.indexOf(cur_unit_square)===-1&&cur_unit_square!==cur_square){cur_square_peers.push(cur_unit_square)}}}square_peers_map[cur_square]=cur_square_peers}return square_peers_map};sudoku._get_all_units=function(rows,cols){var units=[];for(var ri in rows){units.push(sudoku._cross(rows[ri],cols))}for(var ci in cols){units.push(sudoku._cross(rows,cols[ci]))}var row_squares=["ABC","DEF","GHI"];var col_squares=["123","456","789"];for(var rsi in row_squares){for(var csi in col_squares){units.push(sudoku._cross(row_squares[rsi],col_squares[csi]))}}return units};sudoku.board_string_to_grid=function(board_string){var rows=[];var cur_row=[];for(var i in board_string){cur_row.push(board_string[i]);if(i%9==8){rows.push(cur_row);cur_row=[]}}return rows};sudoku.board_grid_to_string=function(board_grid){var board_string="";for(var r=0;r<9;r+=1){for(var c=0;c<9;c+=1){board_string+=board_grid[r][c]}}return board_string};sudoku.print_board=function(board){var report=sudoku.validate_board(board);if(report!==true){throw report}var V_PADDING=" ";var H_PADDING='\n';var V_BOX_PADDING="  ";var H_BOX_PADDING='\n';var display_string="";for(var i in board){var square=board[i];display_string+=square+V_PADDING;if(i%3===2){display_string+=V_BOX_PADDING}if(i%9===8){display_string+=H_PADDING}if(i%27===26){display_string+=H_BOX_PADDING}}console.log(display_string)};sudoku.validate_board=function(board){if(!board){return "Empty board"}if(board.length!==NR_SQUARES){return "Invalid board size. Board must be exactly "+NR_SQUARES+" squares."}for(var i in board){if(!sudoku._in(board[i],sudoku.DIGITS)&&board[i]!==sudoku.BLANK_CHAR){return "Invalid board character encountered at index "+i+": "+board[i]}}return true};sudoku._cross=function(a,b){var result=[];for(var ai in a){for(var bi in b){result.push(a[ai]+b[bi])}}return result};sudoku._in=function(v,seq){return seq.indexOf(v)!==-1};sudoku._first_true=function(seq){for(var i in seq){if(seq[i]){return seq[i]}}return false};sudoku._shuffle=function(seq){var shuffled=[];for(var i=0;i<seq.length;i+=1){shuffled.push(false)}for(var i in seq){var ti=sudoku._rand_range(seq.length);while(shuffled[ti]){ti=(ti+1)>(seq.length-1)?0:(ti+1)}shuffled[ti]=seq[i]}return shuffled};sudoku._rand_range=function(max,min){min=min||0;if(max){return Math.floor(Math.random()*(max-min))+min}else{throw "Range undefined"}};sudoku._strip_dups=function(seq){var seq_set=[];var dup_map={};for(var i in seq){var e=seq[i];if(!dup_map[e]){seq_set.push(e);dup_map[e]=true}}return seq_set};sudoku._force_range=function(nr,max,min){min=min||0;nr=nr||0;if(nr<min){return min}if(nr>max){return max}return nr};initialize();})(this);
// eslint-disable-next-line
var ogs=[[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false]];

// Menu/ui stuff
var mode = "menu";
var dif = 1;
var pos = 0;
var boxpos = 0;

var startTime;
var stopTime;

// Globals
var grid;
// Copy of the original grid for if the player restarts
var restartGrid;
var current;
// array with list of hints OR false if there's an error
var hints = [];
var selected = {
	"x": 0,
	"y": 0
};
var aDown = false;
var presses = [];


// Consts
const start = [40, 32];
const secondStart = [33, 137];
const gridSize = 24;
const difficulties = [
	"Easy",	"Medium", "Hard", "Very Hard", "Insane", "Inhuman"
];
// Values for different inputs, tile and number value
const dirs = {
	"-1": {
		"-1": [320, 1], // Top left
		"0":  [352, 4], // Left
		"1":  [384, 7], // Bottom left
	},
	"0": {
		"-1": [322, 2], // Up
		"0":  [354, 5], // Neutral
		"1":  [386, 8], // Down
	},
	"1": {
		"-1": [324, 3], // Top right
		"0":  [356, 6],	// Right
		"1":  [388, 9], // Bottom right
	}
};

function check () {

	var state = sudoku.board_grid_to_string(grid);

	try {

		// Check if solved
		if (state === sudoku.solve(state)) {

			stopTime = time();

			// Solved!
			mode = "win";
			// Stop function
			return;
		}

	} catch (Thrown) {
		// The lib doesn't like having arrays instead of numbers but that'll only happen when not solved
	}

	// If we're here, they haven't won
	// And that means we want to recalculate the hints
	calculateHints();
}

// Modified from this answer https://stackoverflow.com/a/43478439/8456445
function arraysEqual (_arr1, _arr2) {

	if (_arr1 == _arr2) {return true;}
	if (typeof _arr1 != "object" || typeof _arr2 != "object") {return false;}

	var arr1 = _arr1.concat().sort();
	var arr2 = _arr2.concat().sort();

	for (var i = 0; i < arr1.length; i++) {

		if (arr1[i] !== arr2[i]){
			return false;
		}

	}

	return true;

}

function calculateHints () {

	// Reset the list of hints
	hints = [];
	var empties = [];

	// Prepare grid for lib
	// I hate that setting an array in js to another var just points there
	var copy = JSON.parse(JSON.stringify(grid));


	// Replace all guesses that aren't finalised with empties
	// This version is only used for feeding to the lib, not for comparing
	for (var px = 0; px < 9; px++) {
		for (var py = 0; py < 9; py++) {

			if (typeof grid[px][py] == "object") {
				copy[px][py] = ".";
			}
		}
	}

	var strung = sudoku.board_grid_to_string(copy);
	var candidates = sudoku.get_candidates(strung);


	if (candidates !== false) {

		// If the sudoku's not impossible
		for (var x = 0; x < 9; x++) {
			for (var y = 0; y < 9; y++) {


				// If the cell's empty
				if (grid[x][y] === ".") {

					// Add empty cells to hints
					empties.push([x, y]);
				} else
				// If the cell's not empty
				if ((typeof grid[x][y] == "object" && grid[x][y].length > 1 || typeof grid[x][y] == "string")) {

					candidates[x][y] = candidates[x][y].split("");

					if (!arraysEqual(grid[x][y], candidates[x][y])) {

						// Add to list of hints
						hints.push([x, y]);
					}
				}
			}
		}

		// If there were no good clues
		if (hints.length === 0) {
			// Use the list of empty cells
			hints = empties.slice();
		}


	} else {
		// If the sudoku has been made impossible

		// Mark it as so in the hints
		hints = false;

		if (auto_fail) {
			// Bring up the dialog
			mode = "box";
		}
	}
}

function set (number) {

	// Only set if not og
	if (!ogs[selected.x][selected.y]) {

		// If empty
		switch (typeof current) {
		case "string":
			grid[selected.x][selected.y] = number.toString();

			break;

		case "number":

			// Make sure not to add the same number twice
			if (current !== number) {
				grid[selected.x][selected.y] = [parseInt(current).toString(), number.toString()];
			}
			break;

		case "object":

			// Add to candidates if not already there
			if (current.indexOf(number.toString()) == -1) {
				grid[selected.x][selected.y] = current.concat(number.toString());
			}

			break;

		default:
			break;
		}

	}

	// Check if we've won (and recalculate hints if not)
	check();
}

function remove (number) {

	// Only remove if not og
	if (!ogs[selected.x][selected.y]) {


		// If empty
		switch (typeof current) {

		case "string":
			grid[selected.x][selected.y] = ".";

			break;

		case "number":

			grid[selected.x][selected.y] = ".";
			break;

		case "object":

			var index = grid[selected.x][selected.y].indexOf(number.toString());
			if (index > -1) {
				grid[selected.x][selected.y].splice(index, 1);
			}

			// If the cell's now empty, make it properly empty
			switch (grid[selected.x][selected.y].length) {
			case 0:
				grid[selected.x][selected.y] = ".";
				break;

			case 1:
				grid[selected.x][selected.y] = grid[selected.x][selected.y][0];
				break;

			default:
				break;
			}

			break;

		default:
			break;
		}
	}

	// Recalculate hints
	calculateHints();
}

function toggle (number) {



	if ([selected.x][selected.y] === ".") {
		set(number);
	} else

	if (typeof grid[selected.x][selected.y] == "object") {

		if (grid[selected.x][selected.y].indexOf(number.toString()) != -1) {
			remove(number);
		} else {
			set(number);
		}
	} else

	if (grid[selected.x][selected.y] == number) {
		remove(number);
	} else {
		set(number);
	}

}

function little (number) {

	number = parseInt(number);

	// Draw littles
	//       offset for font ↓
	var littleX = secondStart[1] + 3 + (gridSize * ((number + 2) % 3) );
	var littleY = secondStart[0] + 3 + (gridSize * (Math.round((number + 1) / 3) - 1));

	if (number < 8) {
		spr(256 + (number * 2), littleX, littleY, 0, 1, 0, 0, 2, 2);
	} else {
		spr(298 + ((number - 8) * 2), littleX, littleY, 0, 1, 0, 0, 2, 2);

	}
}

function printCentered (text, y, colour) {

	var width = print(text, 0, -6);
	print(text, (240 - width) / 2, y, colour);
}

// eslint-disable-next-line no-unused-vars
function TIC () {
	var mouseData = mouse();
	var mx = mouseData[0], my = mouseData[1], mp = mouseData[2];

	var up =    btn(0);
	var down =  btn(1);
	var left =  btn(2);
	var right = btn(3);
	var a =     btn(4);
	var b =     btn(5);


	switch (mode) {
	case "menu":

		map(30);

		if (btnp(0, 30, 30) || btnp(1, 30, 30)) {
			pos += 1;
		}

		print("Difficulty: ", 64, 110, 12);
		print(difficulties[dif], 124, 110, diffColours[dif]);

		print("Start", 105, 120, 12);


		var push = 0;
		if (time() % (blink_rate * 2) > blink_rate) { push = 3;}

		spr(302, (pos % 2 === 0 ? 53 : 94) - push, 108 + (pos % 2 * 10));
		spr(302, (pos % 2 === 0 ? 178 : 137) + push, 108 + (pos % 2 * 10), 0, 1, 1);

		// spr(302)

		// If on difficulty selector
		if (pos % 2 === 0) {

			// If left pressed
			if (btnp(2, 15, 15) && dif > 0) {
				dif -= 1;
			} else if (btnp(3, 15, 15) && dif < 5) {
				dif += 1;
			}


		} else {
			// If a pressed, start the game
			if (btnp(4, 30, 30)) {

				// If there's a set puzzle
				if (typeof set_puzzle === "string"){

					grid = sudoku.board_string_to_grid(set_puzzle);

				} else {
					// Generate a puzzle with the chosen difficulty
					grid = sudoku.board_string_to_grid(sudoku.generate(difficulties[dif].toLowerCase().replace(" ", "-")));
				}

				// Copy the grid for if the user wants to restart
				restartGrid = JSON.parse(JSON.stringify(grid));


				// Set OGs
				for (var ogX = 0; ogX < 9; ogX++) {
					for (var ogY = 0; ogY < 9; ogY++) {

						if (grid[ogY][ogX] != ".") {
							ogs[ogY][ogX] = true;
						}
					}
				}

				// Calculate hints for those so lazy that they need a button to show them the empty cells
				calculateHints();

				startTime = time();

				mode = "game";}
		}

		break;

	case "game":

		//  If x down
		if ((btn(6) || !hold_to_move) && !(a || b) ) {
		// Up
			if (btnp(0, 10, 6) && selected.x > 0) {
				selected.x -= 1;
			}

			// Down
			if (btnp(1, 10, 6) && selected.x < 8) {
				selected.x += 1;
			}

			// Left
			if (btnp(2, 10, 6) && selected.y > 0) {
				selected.y -= 1;
			}

			// Right
			if (btnp(3, 10, 6) && selected.y < 8) {
				selected.y += 1;
			}
		}

		map(0);


		// Mouse pressed
		if (mp) {

			// print(Math.floor((mx - start[0]) / 8) + ", " + Math.floor((my - start[1]) / 8), 1, 1, 12);

			var py = Math.floor((mx - start[0]) / 8);
			var px = Math.floor((my - start[1]) / 8);

			if (py >= 0 && py <= 8 &&
				px >= 0 && px <= 8 ){

				selected.y = py;
				selected.x = px;
			}
		}


		current = grid[selected.x][selected.y];


		if (current !== "." && typeof current === "string") {
			rect(137, 33, 71, 71, 0);
			current = parseInt(current);
			var scale = 4;

			var bigX = secondStart[1] + 4;
			var bigY = secondStart[0] + 4;
			if (current < 8) {
				spr(256 + (current * 2), bigX, bigY, 0, scale, 0, 0, 2, 2);
			} else {
				spr(298 + ((current - 8) * 2), bigX, bigY, 0, scale, 0, 0, 2, 2);
			}

		} else if (current === ".") {
			rect(137, 33, 71, 71, 0);

		} else if (typeof current == "object") {

			for (var num in current) {
				little(current[num]);
			}

		}

		// GUI

		// Buttons
		// A
		spr(a ? 291 : 290, 169, 125);
		// B
		spr(b ? 293 : 292, 177, 117);
		// X
		spr(btn(6) ? 295 : 294, 161, 117);
		// Y
		spr(btn(7) ? 297 : 296, 169, 109);

		// Button Labels
		print("Toggle", 134, 126, 12);
		print(hold_to_move ? "Move" : "", 136, 118, 12);
		print("Clear", 187, 118, 12);
		print("Hint", 179, 110, 12);



		// Joystick

		var direction = [0, 0];

		// Up
		if (up) { direction[1] -= 1; }
		// Down
		if (down) { direction[1] += 1; }
		// Left
		if (left) { direction[0] -= 1; }
		// Right
		if (right) { direction[0] += 1; }



		var entry = dirs[direction[0].toString()][direction[1].toString()];

		spr(entry[0], 69, 113, 8, 1, 0, 0, 2, 2);


		// Number on joystick
		if (a || b) {

			print(entry[1], 74 + direction[0], 118 + direction[1], 12, true);
			// font(entry[1], 74 + direction[0], 118 + direction[1], 0);
		}


		// If a is down
		if (btnp(4, 30)) {

			aDown = true;

		} if (aDown && !a) {
			// a released
			aDown = false;

			toggle(entry[1]);

		}

		// If b is down and it's not a protected cell
		if (b && !ogs[selected.x][selected.y]) {

			// Wipe cell
			grid[selected.x][selected.y] = ".";
			// Recalculate hints
			calculateHints();


		}

		// If y is pressed
		if (btn(7)) {

			// Draw hints
			if (hints !== false && typeof hints === "object") {

				for (var index = 0; index < hints.length; index++) {
					const hint = hints[index];

					if (dev) print(hint, 0, index * 10, dev_colour);

					rect((start[0] + 8 * hint[1]) + 1, (start[1] + 8 * hint[0]) + 1, 7, 7, hint_colour);

				}
			} else {

				// There's an error in the sudoku
				mode = "box";

			}
		}

		// Number keys
		if (keyp(28, 120, 120)) { toggle(1); }
		if (keyp(29, 120, 120)) { toggle(2); }
		if (keyp(30, 120, 120)) { toggle(3); }
		if (keyp(31, 120, 120)) { toggle(4); }
		if (keyp(32, 120, 120)) { toggle(5); }
		if (keyp(33, 120, 120)) { toggle(6); }
		if (keyp(34, 120, 120)) { toggle(7); }
		if (keyp(35, 120, 120)) { toggle(8); }
		if (keyp(36, 120, 120)) { toggle(9); }

		// Cursor
		rectb(start[0] + 8 * selected.y, start[1] + 8 * selected.x, 9, 9, 7);


		for (var x = 0; x < 9; x++) {
			for (var y = 0; y < 9; y++) {

				// Draw minis
				var miniStart = [
					start[0] + 8 * x + 2,
					start[1] + 8 * y + 2
				];

				//
				if (typeof grid[y][x] === "string" || !minis_on) {

					var toWrite = grid[y][x];

					toWrite = typeof grid[y][x] === "object" ? "*" : toWrite;

					// Draw board numbers
					print(

						// Print nothing for empty cells
						grid[y][x] === "."  ? " " : toWrite,
						miniStart[0],
						miniStart[1],
						// Change font colour based on if it's an og
						ogs[y][x] ? confirmed_colour : user_colour
					);



				} else {


					for (var i = 0; i < grid[y][x].length; i++) {

						var miniNum = grid[y][x][i];

						var miniX = miniStart[0] + (((miniNum + 2) % 3) * 2);

						var miniY = miniStart[1] + ( ((Math.round((miniNum + 1) / 3) - 1) % 3) * 2);

						pix(miniX, miniY, mini_colour);

					}
				}
			}
		}


		break;

	case "win":
		map(60);

		var timerecorded = stopTime - startTime;

		var minutes = Math.floor(timerecorded / 60000);
		var seconds = ((timerecorded % 60000) / 1000).toFixed(0);
		var formatted = minutes + ":" + (seconds < 10 ? "0" : "") + seconds + "." + Math.round(timerecorded) % 1000;

		var string = "Finished in " + formatted;

		if (isNaN(timerecorded)) {
			string = "You cheated!";
		}

		printCentered(string, 65, 14);

		break;

	case "box":

		var xpadding = 30;
		var ypadding = 42;
		rect(xpadding, ypadding, 240 - xpadding * 2, 136 - ypadding * 2, box_colour);


		printCentered("There's an error", 58, 14);

		printCentered("Continue", 75, 14);
		printCentered("Restart", 85, 14);

		if (btnp(0, 30, 30) || btnp(1, 30, 30)) {
			boxpos += 1;
		}

		var boxpush = 0;
		if (time() % (blink_rate * 2) > blink_rate) { boxpush = 3;}

		// Left arrow
		spr(302, 86 - boxpush, 73 + (boxpos % 2 * 10), 0);
		// Right arrow
		spr(302, 144 + boxpush, 73 + (boxpos % 2 * 10), 0, 1, 1);



		// If a pressed
		if (btnp(4, 30, 30)) {

			// If on restart selector
			if (boxpos % 2 === 1) {

				// I hate that setting an array in js to another var just points there
				grid = JSON.parse(JSON.stringify(restartGrid));
				// Recalculate hints
				calculateHints();

			}
			mode = "game";
			boxpos = 0;

		}


		break;

	default:
		print("uh oh");
		break;
	}

	if (btnp(0, 30, 30)) presses.push(0);
	if (btnp(1, 30, 30)) presses.push(1);
	if (btnp(2, 30, 30)) presses.push(2);
	if (btnp(3, 30, 30)) presses.push(3);
	if (btnp(4, 30, 30)) presses.push(4);
	if (btnp(5, 30, 30)) presses.push(5);

	if (JSON.stringify(presses) == JSON.stringify([0, 0, 1, 1, 2, 3, 2, 3, 5, 4])) {
		dev = true;
	}

	if (presses.length > 10) {
		presses.splice(0, 1);
	}

	if (dev) {
		print(current, 0, 0, dev_colour);
		print(typeof current, 0, 10, dev_colour);

		if (mp) {
			pix(mx, my, 14);
			print(mx + ", " + my, 0, 230, dev_colour);
		}
	}



}

// <TILES>
// 001:2222222220000000200000002000000020000000200000002000000020000000
// 002:2000000020000000200000002000000020000000200000002000000020000000
// 003:2222222200000000000000000000000000000000000000000000000000000000
// 004:2000000000000000000000000000000000000000000000000000000000000000
// 016:5555555500000000000000000000000000000000000000000000000000000000
// 017:5555555550000000500000005000000050000000500000005000000050000000
// 018:5555555520000000200000002000000020000000200000002000000020000000
// 019:5222222250000000500000005000000050000000500000005000000050000000
// 020:5000000050000000500000005000000050000000500000005000000050000000
// 021:5000000000000000000000000000000000000000000000000000000000000000
// 064:0000000000000000000000000000000000000000000000000000000c00000ccc
// 065:000000000000000000000000000000000000000000000000c0000000cc000000
// 066:00000000000000000000000000000000000000000ccccc000ccccc000ccccc00
// 067:000000000000000000000000000000000000000000000000000000cc00000ccc
// 068:00000000000000000000000000000000000000000000000000000000cc000000
// 069:0000000000000000000000000000000000ccccc00cccccc00cccccc00cccccc0
// 072:00000000000000000000000000000000000000000000ccc0000cccc000cccccc
// 074:000000000000000000000000000000000000000000cc00000ccccc000cccccc0
// 076:000000000000000000000000000000cc000000cc000000cc000000cc000000cc
// 077:000000000000000000000000cccc0000cccc0000cccc0000cccc0000cccc0000
// 080:00000ccc00000ccc000000cc0000000c0000000c000000000000000000000000
// 081:ccc00000cccc0000cccc0000ccccc000cccccc00cccccc000cccc0000cc00000
// 082:0ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc00
// 083:0000cccc0000cccc000ccccc00cccccc0cccccccccccccc00ccccc00000cc000
// 084:ccc00000cc000000c0000000c000000000000000000000000000000c0000000c
// 085:0ccccc000ccccc00cccccc00cccccc00ccccc000ccccc000ccccc000ccccc000
// 088:000ccccc000ccccc0000cccc00000ccc000000cc0000000c0000000c00000000
// 089:c0000000cc00000cccc0000ccccc00cccccc0ccccccccccccccccccccccccccc
// 090:cccccc00cccccc00ccccc000cccc0000ccc00000ccc00000cc000000c0000000
// 091:00000000000000000000000000000000000000000000000000000000cccccccc
// 092:000000cc000000cc000000cc000000cc000000cc000000cc000000cccccccccc
// 093:cccc0000cccc0000cccc0000cccc0000cccc0000cccc0000cccc0000cccccccc
// 094:00000000000000000000000000000000000000000000000000000000cccccccc
// 095:00000000000000000000000000000000000000000000000000000000cc000000
// 096:0000000000000000000ccccc000ccccc000ccccc000ccccc0000000000000000
// 097:0000000000000000cccccccccccccccccccccccccccccccc0000000c000000cc
// 098:0ccccc000ccccc00cccccccccccccccccccccccccccccccccccccc00cccccc00
// 099:0000000000000000cccccccccccccccccccccccccccccccc0000000000000000
// 100:0000000c000000cccc0000cccc000ccccc000ccccc000ccc0000cccc0000cccc
// 101:cccccccccccccccccccccccccccccccccccccccccc000000cc000000cc000000
// 102:cccccccccccccccccccccccccccccccccccccccc000000cc00000ccc00000ccc
// 103:ccccccc0ccccccc0ccccccc0ccccccc0ccccccc0ccc00000ccc00000ccc00000
// 104:00000000000000000000000c000000cc00000ccc0000cccc000ccccc00cccccc
// 105:0cccccccccccccc0ccccccccccccccccccccccccccccccccccc0cccccc00cccc
// 106:0000000000000000000000000000000000000000c0000000c0000000c0000000
// 107:ccccccccccccccccccccccccccccccccccccc000ccccc000ccccc000ccccc000
// 108:cccccccccccccccccccccccccccccccc000000cc000000cc000000cc000000cc
// 109:cccccccccccccccccccccccccccccccccccc0000cccc0000cccc0000cccc0000
// 110:cccccccccccccccccccccccccccccccc00000ccc00000ccc00000ccc00000ccc
// 111:cc000000cc000000cc000000cc000000cc000000cc000000cc000000cc000000
// 112:000000000000000000000000000000000000000c000000cc0000cccc000ccccc
// 113:00000ccc000ccccc00cccccc0cccccccccccccc0cccccc00ccccc000ccc00000
// 114:cccccc0ccccccccccccccccc0ccccccc0ccccc0c0ccccc000ccccc000ccccc00
// 115:c0000000cc000000cccc0000ccccc000cccccc00ccccccc00ccccccc00cccccc
// 116:000ccccc000ccccc00cccccc0ccccccc0ccccccccccccccc0cccccccc0ccc00c
// 117:ccc00000ccc00000ccc00000ccc00000ccc00000ccc00000cccc0000cccc0000
// 118:00000ccc00000ccc00000ccc00000ccc00000ccc0000cccc0000cccc0000cccc
// 119:ccc00000ccc00000ccc00000cc000000cc000000cc000000cc000000cc000000
// 120:0ccccccc00cccccc000ccc00000cc00000000000000000000000000000000000
// 121:c000cccc00000ccc00000ccc00000ccc00000ccc00000ccc00000ccc0000cccc
// 122:cc000000cc000000cc000000cc000000cc000000ccc00000ccc00000ccc00000
// 123:ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000
// 124:000000cc000000cc000000cc000000cc000000cc000000cc000000cc000000cc
// 125:cccc0000cccc0000cccc0000cccc0000cccc0000cccc0000cccc0000cccc0000
// 126:00000ccc00000ccc00000ccc00000ccc00000ccc00000ccc00000ccc00000ccc
// 127:cc000000cc000000cc000000cc000000cc000000cc000000cc000000cc000000
// 128:0ccccccc00cccccc000cccc0000ccc0000000000000000000000000000000000
// 129:cc000000c000000000000000000000cc00000ccc00000ccc0000cccc0000cccc
// 130:0ccccc000ccccc000ccccc00c0000000ccc00000ccc00000cc000000cc000000
// 131:000ccccc0000cccc00000cc00000000000000000000000000000000000000000
// 132:c00c000c0000000c0000000c0000000c00000000000000000000000000000000
// 133:cccc0000cccc0000ccccc000ccccc000ccccc000cccccc00cccccc000ccccc00
// 134:0000cccc0000cccc000ccccc000ccccc000ccccc00cccccc00cccccc00cccccc
// 135:cc000000c0000000c0000000c0000000c0000000000000000000000000000000
// 136:00000000000000000000000000000000000000000000000c000000cc00000ccc
// 137:000ccccc00cccccc00cccccc0cccccccccccccccccccc0ccccccc0cccccc00cc
// 138:ccc00000ccc00000ccc00000ccc00000ccc00000ccc00000cccc0000cccc0000
// 139:ccccc000ccccc000ccccc000cccccccccccccccccccccccccccccccccccccccc
// 140:000000cc000000cc000000cccccccccccccccccccccccccccccccccccccccccc
// 141:cccc0000cccc0000cccc0000cccccccccccccccccccccccccccccccccccccccc
// 142:00000ccc00000ccc00000ccccccccccccccccccccccccccccccccccccccccccc
// 143:cc000000cc000000cc000000cc000000cc000000cc000000cc000000cc000000
// 144:00cccccc00cccccc00cccccc00cccccc00000000000000000000000c0000000c
// 145:cccccccccccccccccccccccccccccccc0cccccc0cccccc00ccccc000ccccc000
// 146:cccccccccccccccccccccccccccccccc00000000000000000000000000000000
// 147:cccccccccccccccccccccccccccccccc000ccccc00cccccc0cccccc00cccccc0
// 149:0cccccc00cccccc000cccccc00cccccc000ccccc000ccccc000ccccc0000cccc
// 150:0cccccc00cccccc0cccccc00cccccc00cccccc00ccccc000ccccc000cccc0000
// 152:0000cccc000ccccc0ccccccc0ccccccc00ccccc0000ccc00000cc00000000000
// 153:ccc000cccc0000ccc00000cc000000cc0000000c0000000c0000000c000000cc
// 154:cccc0000cccc0000cccc0000cccc0000cccc0000cccc0000cccc0000cccc0000
// 155:ccccc000ccccc000000000000000000000000000000000000000000000000000
// 156:000000cc000000cc000000cc000000cc000000cc000000cc000000cc000000cc
// 157:cccc0000cccc0000cccc0000cccc0000cccc0000cccc0000cccc0000cccc0000
// 158:000000000000000000000000000000000000cc0000ccccc000cccccc00cccccc
// 160:000000cc000000cc0000000c0000000000000000000000000000000000000000
// 161:ccccc000ccccccc0cccccccc0ccccccc000ccccc00000ccc0000000c0000000c
// 162:000000000000000ccc0000cccccc0ccccccccccccccccccccccccccccccccccc
// 163:cccccc00ccccc000ccccc000cccc0000ccc00000cc000000ccc00000ccccc000
// 164:0000000000000000000000000000000000000000000000000000000c000000cc
// 165:0000cccc0000cccc000ccccc00cccccc0cccccccccccccccccccccc0cccccc00
// 166:cccc0000cccc0000ccccc000cccccc00ccccccc0cccccccc0ccccccc00cccccc
// 167:000000000000000000000000000000000000000000000000c0000000cc000000
// 169:000000cc000000cc000000cc000000cc000000cc00000ccc00000ccc0000cccc
// 170:cccc0000cccc0000cccc0000ccc00000ccc00000ccc00000ccc00000ccc000cc
// 171:00000000000000000000000000000000000000000000000000000000cccccccc
// 172:000000cc000000cc000000cc000000cc000000cc000000cc00cccccccccccccc
// 173:cccc0000cccc0000cccc0000cccc0000cccc0000cccc0ccccccccccccccccccc
// 174:000ccccc000ccccc0000cccc0000cccc00000ccccccccccccccccccccccccccc
// 175:c0000000c0000000cc000000cc000000ccc00000ccc00000cccc0000cccc0000
// 176:00000000000000000000000000000ccc0ccccccc00cccccc00cccccc000ccccc
// 177:00000ccc000ccccccccccccccccccccccccccccccccccc00cccc0000c0000000
// 178:cccccccccccccccccccc000ccc00000000000000000000000000000000000000
// 179:ccccccccccccccccccccccc00cccccc0000ccc000000000c0000000000000000
// 180:00000ccc0000cccc00cccccc0cccccccccccccccccccccccccccccc00cccc000
// 181:ccccc000cccc0000ccc00000cc000000c0000000000000000000000000000000
// 182:000ccccc0000cccc00000ccc000000cc0000000c000000000000000000000000
// 183:cccc0000ccccc000ccccccc0ccccccccccccccc0ccccccc000cccc00000cc000
// 184:00ccc00000cccccc00cccccc00cccccc00cccccc000ccccc0000000000000000
// 185:00ccccccccccccccccccccccccccccccccccccc0ccccc0000000000000000000
// 186:cc000ccccc000cccc0000ccc00000ccc00000ccc000000000000000000000000
// 187:cccccccccccccccccccccccccccccccccccc0000000000000000000000000000
// 188:ccccccccccccccccccccccccccccc00000000000000000000000000000000000
// 189:ccccccccccccccccccccc0000000000000000000000000000000000000000000
// 190:cccccccccccccc0c0000000c0000000000000000000000000000000000000000
// 191:ccccc000ccccc000ccccc000cccccc00cccccc000ccccc000ccc000000000000
// 192:000ccc00000000000000000000000000000ccccc00cccccc00cccccc00cccccc
// 193:00000000000000000000000000000000cccccccccccccccccccccccccccccccc
// 194:00000000000000000000000000000000ccc0000ccccc00cccccc00cccccc00cc
// 195:00000000000000000000000000000000cccc0000ccccc000ccccc000ccccc000
// 196:00cc0000000000000000000000000000000cccc000cccccc00cccccc00cccccc
// 197:000000000000000000000000000000000000cccc000ccccc000ccccc000ccccc
// 198:00000000000000000000000000000000cccccccccccccccccccccccccccccccc
// 199:00000000000000000000000000000000cc000000ccc00000cccc0000ccccc000
// 200:000000000000000000000000000000000ccccccccccccccccccccccccccccccc
// 201:00000000000000000000000000000000cccccccccccccccccccccccccccccccc
// 202:00000000000000000000000000000000ccc0000ccccc00cccccc00cccccc00cc
// 203:00000000000000000000000000000000cccc0000ccccc000ccccc000ccccc00c
// 204:000000000000000000000000000000000cccccc00cccccccccccccc0cccccc00
// 205:000000000000000000000000000000000000cccc000ccccc000ccccc000ccccc
// 206:00000000000000000000000000000000c0000000cc00000ccc00000ccc00000c
// 207:00000000000000000000000000000000cccc0000ccccc000ccccc000ccccc000
// 208:00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc
// 209:ccccccccccccccccc00000ccc00000ccc0000000cccccccccccccccccccccccc
// 210:cccc00cccccc00cccccc00cccccc00cc000000cccccc00cccccc00cccccc00cc
// 211:ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000
// 212:00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc
// 213:000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc
// 214:cccccccccccccccccc00000ccc00000ccc00000ccc00000ccc00000ccc00000c
// 215:ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000
// 216:ccccccccccccccccccccccc0ccccccc0ccccccc0ccccccc0ccccccc0ccccccc0
// 217:cccccccccccccccc000000cc000000cc000000cc000000cc000000cc000000cc
// 218:cccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cc
// 219:ccccc00cccccc0cccccccccccccccccccccccccccccccccccccccccccccccccc
// 220:cccccc00ccccc000cccc0000cccc0000ccc00000cc000000ccc00000ccc00000
// 221:000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc
// 222:cc00000ccc00000ccc00000ccc00000ccc00000ccc00000ccc00000ccc00000c
// 223:ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000
// 224:00cccccc00cccccc000ccccc00000000000ccccc00cccccc00cccccc00cccccc
// 225:cccccccccccccccccccccccc000000cc000000ccc00000cccccccccccccccccc
// 226:cccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cc
// 227:ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000cccccccccccccccc
// 228:00cccccc00cccccc00cccccc00cccccc00cccccc00cccccccccccccccccccccc
// 229:000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc
// 230:cc00000ccc00000ccc00000ccc00000ccc00000ccc00000ccccccccccccccccc
// 231:ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000
// 232:ccccccc0ccccccc0ccccccc0ccccccc0ccccccc0ccccccc0cccccccccccccccc
// 233:000000cc000000cc000000cc000000cc000000cc000000cccccccccccccccccc
// 234:cccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cccccc00cc
// 235:cccccccccccccccccccccccccccccccccccccc0cccccc00cccccc000ccccc000
// 236:cccc0000cccc0000ccccc000ccccc000cccccc00cccccc00ccccccc0ccccccc0
// 237:000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc
// 238:cc00000ccc00000ccc00000ccc00000ccc00000ccc00000ccccccccccccccccc
// 239:ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000ccccc000
// 240:00cccccc00cccccc00cccccc00cccccc00000000000000000000000000000000
// 241:cccccccccccccccccccccccccccccccc00000000000000000000000000000000
// 242:cccc00cccccc00cccccc00cccccc00cc00000000000000000000000000000000
// 243:cccccccccccccccccccccccccccccccc00000000000000000000000000000000
// 244:cccccccccccccccccccccccccccccccc00000000000000000000000000000000
// 245:000ccccc000ccccc000ccccc000ccccc00000000000000000000000000000000
// 246:cccccccccccccccccccccccccccccccc00000000000000000000000000000000
// 247:ccccc000cccc0000cccc0000ccc0000000000000000000000000000000000000
// 248:cccccccccccccccccccccccccccccccc00000000000000000000000000000000
// 249:cccccccccccccccccccccccccccccccc00000000000000000000000000000000
// 250:cccc00cccccc00cccccc00cccccc00cc00000000000000000000000000000000
// 251:ccccc000ccccc000ccccc000ccccc00000000000000000000000000000000000
// 252:0ccccccc00cccccc00cccccc000ccccc00000000000000000000000000000000
// 253:000ccccc000cccccc00cccccc00ccccc00000000000000000000000000000000
// 254:cccccccccccccccccccccccccccccccc00000000000000000000000000000000
// 255:ccccc000ccccc000ccccc000ccccc00000000000000000000000000000000000
// </TILES>

// <SPRITES>
// 002:00000000000000000000000c000000cc000000cc000000000000000000000000
// 003:00000000cc000000cc000000cc000000cc000000cc000000cc000000cc000000
// 004:0000000000000ccc0000cccc000ccc00000cc000000000000000000000000ccc
// 005:00000000ccc00000cccc000000ccc000000cc000000cc00000ccc000cccc0000
// 006:0000000000000ccc0000cccc000ccc00000cc00000000000000000000000000c
// 007:00000000ccc00000cccc000000ccc000000cc000000cc00000ccc000cccc0000
// 008:0000000000000000000000000000000c000000cc00000ccc0000ccc0000ccc00
// 009:000000000cc00000ccc00000ccc00000ccc000000cc000000cc000000cc00000
// 010:00000000000ccccc000ccccc000cc000000cc000000ccccc000ccccc00000000
// 011:00000000ccccc000ccccc0000000000000000000ccc00000cccc000000ccc000
// 012:0000000000000ccc0000cccc000ccc00000cc000000cc000000cc000000ccccc
// 013:00000000ccc00000cccc000000ccc000000cc0000000000000000000ccc00000
// 014:00000000000ccccc000ccccc0000000000000000000000000000000000000000
// 015:00000000ccccc000ccccc000000cc000000cc00000ccc0000ccc0000ccc00000
// 018:0000000000000000000000000000000000000000000000cc000000cc00000000
// 019:cc000000cc000000cc000000cc000000cc000000cccc0000cccc000000000000
// 020:0000cccc000ccc00000cc000000cc000000cc000000ccccc000ccccc00000000
// 021:ccc0000000000000000000000000000000000000ccccc000ccccc00000000000
// 022:0000000c0000000000000000000cc000000ccc000000cccc00000ccc00000000
// 023:cccc000000ccc000000cc000000cc00000ccc000cccc0000ccc0000000000000
// 024:000cc000000ccccc000ccccc0000000000000000000000000000000000000000
// 025:0cc00000ccccc000ccccc0000cc000000cc000000cc000000cc0000000000000
// 026:000000000000000000000000000cc000000ccc000000cccc00000ccc00000000
// 027:000cc000000cc000000cc000000cc00000ccc000cccc0000ccc0000000000000
// 028:000ccccc000cc000000cc000000cc000000ccc000000cccc00000ccc00000000
// 029:cccc000000ccc000000cc000000cc00000ccc000cccc0000ccc0000000000000
// 030:0000000c0000000c0000000c0000000c0000000c0000000c0000000c00000000
// 031:cc000000c0000000c0000000c0000000c0000000c0000000c000000000000000
// 034:0aaaaaa0aaa44aaaaa4aa4aaaa4aa4aaaa4444aaaa4aa4aa4aaaaaa404444440
// 035:000000000aaaaaa0aaa44aaaaa4aa4aaaa4aa4aaaa4444aaaa4aa4aa0aaaaaa0
// 036:0555555055111555551551555511155555155155551115551555555101111110
// 037:0000000005555550551115555515515555111555551551555511155505555550
// 038:0777777077277277772772777772277777277277772772772777777202222220
// 039:0000000007777770772772777727727777722777772772777727727707777770
// 040:0888888088388388883883888883338888888388888338883888888303333330
// 041:0000000008888880883883888838838888833388888883888883388808888880
// 042:0000000000000ccc0000cccc000ccc00000cc000000cc000000ccc000000cccc
// 043:00000000ccc00000cccc000000ccc000000cc000000cc00000ccc000cccc0000
// 044:0000000000000ccc0000cccc000ccc00000cc000000cc000000ccc000000cccc
// 045:00000000ccc00000cccc000000ccc000000cc000000cc000000cc000ccccc000
// 046:000000000000c0000000cc000000ccc00000cccc0000ccc00000cc000000c000
// 058:0000cccc000ccc00000cc000000cc000000ccc000000cccc00000ccc00000000
// 059:cccc000000ccc000000cc000000cc00000ccc000cccc0000ccc0000000000000
// 060:00000ccc0000000000000000000cc000000ccc000000cccc00000ccc00000000
// 061:ccccc000000cc000000cc000000cc00000ccc000cccc0000ccc0000000000000
// 064:8888ffff88ffeddd8fedde9e8fdeeeeefedeeeeefdeeeeeefd9eeeeefdeeeeee
// 065:f8888888eff88888ddef8888eedf8888eedef888eeedf888ee9df888eeedf888
// 066:88888fff888ffedd88fedde988fdeeee8fedeeee8fdeeeee8fd9eeee8fdeeeee
// 067:ff888888deff8888eddef888eeedf888eeedef88eeeedf88eee9df88eeeedf88
// 068:888888ff8888ffed888fedde888fdeee88fedeee88fdeeee88fd9eee88fdeeee
// 069:fff88888ddeff8889eddef88eeeedf88eeeedef8eeeeedf8eeee9df8eeeeedf8
// 080:fedeeeeef9deeeee8fedde9e8f99eddd88ff9999888fbbbb8888ffbb888888ff
// 081:eedef888eed9f888ddebf888e99bf8889bbf8888bbbf8888bff88888f8888888
// 082:8fedeeee8f9deeee88fedde988f99edd888fb999888fbbbb8888ffbb888888ff
// 083:eeedef88eeed9f88eddef888de99f88899bf8888bbbf8888bff88888f8888888
// 084:88fedeee88f9deee88fbedde88fb99ed888fbb99888fbbbb8888ffbb888888ff
// 085:eeeedef8eeeed9f89eddef88dde99f88999ff888bbbf8888bff88888f8888888
// 096:888888888888ffff88ffeddd8fedde9e8fdeeeeefedeeeeefdeeeeeefd9eeeee
// 097:88888888f8888888eff88888ddef8888eedf8888eedef888eeedf888ee9df888
// 098:8888888888888fff888ffedd88fedde988fdeeee8fedeeee8fdeeeee8fd9eeee
// 099:88888888ff888888deff8888eddef888eeedf888eeedef88eeeedf88eee9df88
// 100:88888888888888ff8888ffed888fedde888fdeee88fedeee88fdeeee88fd9eee
// 101:88888888fff88888ddeff8889eddef88eeeedf88eeeedef8eeeeedf8eeee9df8
// 112:fdeeeeeefedeeeeef9deeeee8fedde9e8f99eddd88ff99998888ffbb888888ff
// 113:eeedf888eedef888eed9f888ddebf888e99f88889bbf8888bff88888f8888888
// 114:8fdeeeee8fedeeee8f9deeee88fedde988f99edd888fb9998888ffbb888888ff
// 115:eeeedf88eeedef88eeed9f88eddef888de99f88899bf8888bff88888f8888888
// 116:88fdeeee88fedeee88f9deee88fbedde888f99ed888fbb998888ffbb888888ff
// 117:eeeeedf8eeeedef8eeeed9f89eddef88dde99f88999ff888bff88888f8888888
// 128:88888888888888888888ffff88ffeddd8fedde9e8fdeeeeefedeeeeefdeeeeee
// 129:8888888888888888f8888888eff88888ddef8888eedf8888eedef888eeedf888
// 130:888888888888888888888fff888ffedd88fedde988fdeeee8fedeeee8fdeeeee
// 131:8888888888888888ff888888deff8888eddef888eeedf888eeedef88eeeedf88
// 132:8888888888888888888888ff8888ffed888fedde888fdeee88fedeee88fdeeee
// 133:8888888888888888fff88888ddeff8889eddef88eeeedf88eeeedef8eeeeedf8
// 144:fd9eeeeefdeeeeeefedeeeeef9deeeee8fedde9e8f99eddd88ff99998888ffff
// 145:ee9df888eeedf888eedef888eed9f888ddef8888e99f88889ff88888f8888888
// 146:8fd9eeee8fdeeeee8fedeeee8f9deeee88fedde988f99edd888ff99988888fff
// 147:eee9df88eeeedf88eeedef88eeed9f88eddef888de99f88899ff8888ff888888
// 148:88fd9eee88fdeeee88fedeee88f9deee888fedde888f99ed8888ff99888888ff
// 149:eeee9df8eeeeedf8eeeedef8eeeed9f89eddef88dde99f88999ff888fff88888
// </SPRITES>

// <MAP>
// 001:0000000000000000000000000000000000000000000000000000000000000000000000000004142434445464748494a4b4c4d4e4f400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 002:0000000000000000000000000000000000000000000000000000000000000000000000000005152535455565758595a5b5c5d5e5f500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 003:0000000000000000000000000000000000000000000000000000000000000000000000000006162636465666768696a6b6c6d6e6f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 004:0000000000112121112121112121410000110101110101110101410000000000000000000007172737475767778797a7b7c7d7e7f700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 005:0000000000311010311010311010410000410000410000410000410000000000000000000008182838485868788898a8b8c8d8e8f800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 006:0000000000311010311010311010410000410000410000410000410000000000000000000009192939495969798999a9b9c9d9e9f900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 007:000000000011212111212111212141000011010111010111010141000000000000000000000a1a2a3a4a5a6a7a8a9aaabacadaeafa00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 008:000000000031101031101031101041000041000041000041000041000000000000000000000b1b2b3b4b5b6b7b8b9babbbcbdbebfb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 009:000000000031101031101031101041000041000041000041000041000000000000000000000c1c2c3c4c5c6c7c8c9cacbcccdcecfc00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 010:000000000011212111212111212141000011010111010111010141000000000000000000000d1d2d3d4d5d6d7d8d9dadbdcdddedfd00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 011:000000000031101031101031101041000041000041000041000041000000000000000000000e1e2e3e4e5e6e7e8e9eaebecedeeefe00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 012:000000000031101031101031101041000041000041000041000041000000000000000000000f1f2f3f4f5f6f7f8f9fafbfcfdfefff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 013:000000000001010101010101010151000001010101010101010151000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </MAP>

// <WAVES>
// 000:00000000ffffffff00000000ffffffff
// 001:0123456789abcdeffedcba9876543210
// 002:0123456789abcdef0123456789abcdef
// </WAVES>

// <SFX>
// 000:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000304000000000
// </SFX>

// <PALETTE>
// 000:140c1c44243430346d854c30346524d04648757161597dced27d2c292e4e6daa2c191730deeed6647392424c6e111111
// </PALETTE>

// <COVER>
// 000:3e8000007494648393160f00880077000012ffb0e45445353414055423e2033010000000129f40402000ff00c2000000000f0088007841c0c1edee6d43564200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080ff001080c1840b0a1c388031a2c58c0b1a3c780132a4c9841b2a5cb88133a6cd8c1b3a7cf80234a8c1942b4a9c398235aac59c2b5abc790336acc9943b6adcb98337aecd9c3b7afcf90438a0d1a44b8a1d3a8439a2db810a9a3d5a0599a3d00737a63d8a84dae44ba4592e35587532275cad33ca14da70dce954b217a2857bf07c29dc9c6906dd187750ac51b971f6f548b77eadc0ca71ead52c00ef6344c98517a57c28d527deae7fbe163c795d2fdbb391223e8c139037eebf9d167eac69d43460dd2307dd3d50b4ba64b2b10fa66db2163b58d1b1375c1b5bd6bf6cd237f2de2d7b71f4e1eac99317898977b3f6c3d73f27fa9cf93a4dc4d5337fccfd1b3fff64dbcbcb9f4dad3775f7c7efcfbdfbde3e79f4f297d7f69f3f58f47cfcf1d3d7d8df9c70e5081e5e7b61181fdf7e1128ee516c0af7ddd76f06b7a067431e57e0e4870268b1256d1a787f58751a8771a16ba92690678901276fd88b1d87b2246216764ade7826b8e2264c1e245b136816d8016682266793298a5988116092428894a9588dd863a2954a45922b7e89f83a9f705a2944e493b1e7f1a493323911aa8afd0983a79f5e354129775ad876a99652a925aa917d9674a1760ec9b5d07b52d984ad9dc947f51d86e5c896e0812299b422a18a0ae8eb66220778ec9c82f89520aa924ad61c8296e9d51c7d5639b864a79e8a67ee94ed2a1aeaa69a57ebdfff97a62ac92c824e68c76ea77e872b64ac9a57fed77506e51c1ba8e5fa17efabba0761d394465ae669857a2bb6e5ac011b9d5381da4b6d25b5def6f9e4be66993027bdda7b892dacaa2a382b91ea9bf82ab6a259a651b87ebb0facb1ca4b3f629dea39fe6fbaf28b6e6fb1c1f6ea5492ee0c6ae58bfada5e2885ceabc0b1952e3cd3a3baee4c51ffb7dea7adafaabeea146cbd173a9e6d90d6ab22b768de2c51f1c72aaa13eebd9af98aa7b237b8b363b3aa6c03beb01f8bffa9cf1f6c0460d8e2dc8271d7ee7b0b299c1b0db2f0d6ca2d76e3d41f78727ac68627d6afc85bfbfa67de578c81b5dde6f9a0b1dd175976fac153bdee68d667cd33bc5d339c643fffb773edc262c35f29491cbc4ffd48bddd423943f1bab91e78b9dc064c95b3e2062e71f0eac68dc164eb830c07b3c2077d0731de936e1a69ecf1dde6b7906eb78975b0abcd4aeb8937e8a8f1d3532c7a7847bbb84bbce47fe436ba9a93ea0e22e565be89a2fecf3f0d74f2df4f43daeea688753696dfdacee5f9994edf11eb5f6f8a75acb31a1befe0c78f5b31df9fe880a8f2ffcfd47ccce3fa8ef5efeb9fa7b86efbabeabbfdffc2310ad65b9ee5992bc51fa8450c6f53da18bfbcfc7d076904da14a0f7071c02107083b3805ff277e042bdbd8389aba064b6c7adb2459e8e7224bfdd6438d14fe4ef4857c14bd90bb7e2c7d1c0b0742cb125c048c2c3ed49ffa18b34f1e30358169516015d7322226f079839a4a52118854c39931d4805cd0a41b4863c01a01918204c2a7176825ba1671ba8654be1a17d8844e2ad01d81dbf06af2a8374d22374e8f6c726a15b4664506c052646c2bd5767808400e01f98c6413ada0f835ca06127188bb03ebe228a7ab22d135301cc1e5e028c9420dcfec7394d46a8a39bdb8f930f174e3689525f7ceb2f9405f899455a429594e335212d59f5c84aa1b599a4b520da191a4ae9037894cc26a13f898cc46a23799ccc66a33f990d4de850576324ce536a238dc875db66550110800000ed4584833c93216e181d3494cedc16ca47dc4c4b3bc49ab77a04cb94fc972931c95fc18093fb93dae4d1993579c34dbc531457592820c40abd4cb4160124fc172f39f96f4c7a441c98fcc72986488ec65d417d9b0dd022433afd3dc044f1afdc97644d1a62d19259aa9fdb6762471add17016356ae7197254d4a515d76d37f9bf4a8694d76f6b1ccf35231dc2aa15f8a84d4aa255a9a2479d25797c3451a141893dc7aaa720a20d186bac6a655c94353ba605576759e28940627512936d4baa57dac6d6bab5fda07d8bac57ea47dabad5feaeda08000b3
// </COVER>

