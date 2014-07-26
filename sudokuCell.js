/* 
Sudoku Aid v0.2 by Nigel Whitley (c) Copyright 2005-2014
 */
	/*
	This is the object/code for managing a "cell" in the puzzle. The main function of 
	the sudokuCell object is to keep track of the possible values for that cell and
	whether a final value has been "fixed" in it (definitely allocated to the cell).
	There are helper functions for maintaining the "state" of each possible value.
	Initially all values are possible. As the puzzle is defined, then during the 
	solution process, some possible values are excluded. Depending on the level
	of aid, possible values may have attributes attached to denote additional 
	information for the user.
	*/
	function sudokuCell(block, parentElement, cellPosition) {

		this.block = block;
		//this.puzzle = this.block.puzzle;
		this.cellElement = parentElement;
		this.position = cellPosition;

		sudokuCell.prototype.init = function () {
			this.blockPosition = this.block.position;
			this.possibleValues = createArray(sudokuStatic.maxValue);
			this.possibleState = createArray(sudokuStatic.maxValue);
			this.clearValue();
			this.showCell();
		}

		sudokuCell.prototype.clearValue = function ()
		// Clear the fixed value in a square
		{
			this.currentValue = 0;
			this.resetPossibleValues();
		}

		sudokuCell.prototype.resetPossibleValues = function () {
			if ( ! this.isFixedValue() ) {
				this.possibleCount = sudokuStatic.maxValue;
				for ( var possible_index=1; possible_index <= sudokuStatic.maxValue; possible_index++) {
					this.possibleValues[possible_index] = possible_index;
					this.possibleState[possible_index] = "possible";
				}
			}
		}

		sudokuCell.prototype.isFixedValue = function () {
			return ( this.currentValue != 0 );
		}

		sudokuCell.prototype.isValuePossible = function ( value ) {
			return ( ( ! this.isPossibleExcluded(value) ) && ( ! this.isPossibleIgnored(value) ) );
		}

		sudokuCell.prototype.isPossibleExcluded = function (value) {
			return ( this.possibleState[value] === "excluded" );
		}

		sudokuCell.prototype.isPossibleIgnored = function (value) {
			return ( this.possibleState[value] === "ignored" );
		}

		sudokuCell.prototype.valueNotPossible = function (value) {
			return ( ! this.isValuePossible(value) );
		}

		sudokuCell.prototype.excludePossibleValue = function ( value ) {
			var stateChanged = false;
			if (! this.isPossibleExcluded(value)) {
				this.possibleState[value] = "excluded";
				this.possibleCount--;
				stateChanged = true;
			}
			return stateChanged;
		}

		// Need to have a state which indicates the value would be excluded
		// if the group or pin processing were set to filter rather than show. 
		// This allows the processing to ignore those "possible" values as the 
		// search continues but still display them in the cells.
		sudokuCell.prototype.ignorePossibleValue = function ( value ) {
			var stateChanged = false;
			if ( this.isValuePossible(value) ) {
				this.possibleState[value] = "ignored";
				stateChanged = true;
			}
			return stateChanged;
		}

		sudokuCell.prototype.onlyPossibleValue = function ( value ) {
			this.possibleState[value] = "single";
		}

		sudokuCell.prototype.setStateForPossibleValue = function ( state, value ) {
			var stateChanged = false;
			if (! this.isPossibleExcluded(value)) {
				if ( this.possibleState[value] !== state ) {
					this.possibleState[value] = state;
					stateChanged = true;
				}
			}
			return stateChanged;
		}

		sudokuCell.prototype.addStateForPossibleValue = function ( state, value ) {
			if ( this.isValuePossible(value) ) {
				if ( this.possibleState[value].indexOf(state) == -1 ) {
					this.possibleState[value] = this.possibleState[value] + " " + state;
				}
			}
		}

		sudokuCell.prototype.fixValue = function (element, event)
		// Fix a value in a square
		{
			var table_cell=element.parentNode.parentNode.parentNode;
			var cell_name = table_cell.name;
			var row = cell_name.substr( 4, 1);
			var column = cell_name.substr( 6, 1);

			var clicked_text=element.childNodes[0].nodeValue;
			this.currentValue = parseInt(clicked_text.valueOf());
			sudokuGlobal.puzzle.fixValue(clicked_text.valueOf(), new PuzzlePosition(this.blockPosition, this.position));

		}

		sudokuCell.prototype.getPossibleValues = function ()
		// Get all values which can be in the cell ie not excluded.
		{
			var possibleValues = new Array();
			// If the cell has a fixed value we return no possible values
			// It could be argued that there is only one possible value i.e.
			// the fixed value, but any calling process would need to check
			// separately for a fixed value regardless.
			if ( ! this.isFixedValue() ) {
				for ( var eachValue=1; eachValue <= sudokuStatic.maxValue ; eachValue++ ) {
					//debugFramework.showMessage2("value " + eachValue, "append");
					if ( this.isValuePossible(eachValue) ) {
						possibleValues.push(eachValue);
					}
				}

			}
			return possibleValues;

		}

		sudokuCell.prototype.showCell = function () {
			remove_children(this.cellElement);
			this.cellElement.className = "puzzleCell centred_text";
			if ( this.isFixedValue() ) {
				var currentText=document.createTextNode("");
				currentText.nodeValue = this.currentValue;
				this.cellElement.className = "puzzleCell centred_text fixed_value";
				this.cellElement.appendChild(currentText);
			} else {

				var possibleTable=document.createElement("TABLE");
				possibleTable.className = "centred_table set_font";
				this.cellElement.appendChild(possibleTable);
				var possibleValue = 1;
				for ( var eachRow=sudokuStatic.firstPossRow; eachRow <= sudokuStatic.lastPossRow; eachRow++) {
					var possibleRow=document.createElement("TR");
					possibleTable.appendChild(possibleRow);

					for ( var eachColumn=sudokuStatic.firstPossColumn; eachColumn <= sudokuStatic.lastPossColumn; eachColumn++) {
						var possibleDetail=document.createElement("TD");
						possibleRow.appendChild(possibleDetail);
						if ( this.isPossibleExcluded(possibleValue) ) {
							possibleDetail.className="possibleCell";
						} else {
							possibleDetail.className="possibleCell " + this.possibleState[possibleValue];
							var possibleText = document.createTextNode(possibleValue);
							possibleDetail.appendChild(possibleText);
							var that = this; 
							var loadfunc=function(e) {
								that.fixValue(this, e); // pass-through the event object
							}; 
							addEvent(possibleDetail, "click", loadfunc, false);
						}
						possibleValue++;
					}
				}

				this.cellElement.className ="puzzleCell";
			}
		}

		this.init();
	}
