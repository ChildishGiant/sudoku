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
