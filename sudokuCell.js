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
        this.excludedValues = new Array();

		sudokuCell.prototype.init = function () {
			this.blockPosition = this.block.position;
			this.possibleValues = createArray(sudokuStatic.maxValue);
			this.possibleState = createArray(sudokuStatic.maxValue);
			this.clear();
			this.showCell();
		}

		sudokuCell.prototype.clear = function () {
            this.clearExcludedValues();
			this.clearValue();
		}

		sudokuCell.prototype.clearValue = function ()
		// Clear the fixed value in a square
		{
			this.currentValue = 0;
			this.resetPossibleValues();
		}

		sudokuCell.prototype.clearExcludedValues = function ()
		// Clear the excluded values in a square
		{
			this.excludedValues = createArray(0);
		}


		sudokuCell.prototype.resetPossibleValues = function () {
			if ( ! this.isFixedValue() ) {
				this.possibleCount = 0;
				for ( var possible_index=1; possible_index <= sudokuStatic.maxValue; possible_index++) {
					this.possibleValues[possible_index] = possible_index;
                    // Excluded values are not possible
                    if (this.excludedValues.includes(possible_index)) {
                        this.possibleState[possible_index] = "excluded";
                    } else {                      
                        this.possibleState[possible_index] = "possible";
                        this.possibleCount++;
                    }
				}
			}
		}

		sudokuCell.prototype.isFixedValue = function () {
			return ( this.currentValue != 0 );
		}

		sudokuCell.prototype.isValuePossible = function ( value ) {
			return ( ( ! this.isValueExcluded(value) ) && ( ! this.isValueIgnored(value) ) );
		}

		sudokuCell.prototype.isValueExcluded = function (value) {
			return ( this.possibleState[value] === "excluded" );
		}

		sudokuCell.prototype.isValueIgnored = function (value) {
			return ( this.possibleState[value] === "impossible" );
		}

		sudokuCell.prototype.valueNotPossible = function (value) {
			return ( ! this.isValuePossible(value) );
		}


		sudokuCell.prototype.excludePossibleValue = function ( value ) {
			var stateChanged = false;
			if (! this.isValueExcluded(value)) {
				this.possibleState[value] = "excluded";
				this.possibleCount--;
				stateChanged = true;
			}
			return stateChanged;
		}


		sudokuCell.prototype.undoExcludePossibleValue = function ( value ) {
			var stateChanged = false;
            findValue = this.excludedValues.indexOf(value);
            this.excludedValues.splice(findValue, 1);
			if (this.isValueExcluded(value)) {
				this.possibleState[value] = "possible";
				this.possibleCount++;
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
				this.possibleState[value] = "impossible";
				stateChanged = true;
			}
			return stateChanged;
		}


		sudokuCell.prototype.onlyPossibleValue = function ( value ) {
			this.possibleState[value] = "single";
		}


		sudokuCell.prototype.setStateForPossibleValue = function ( state, value ) {
			var stateChanged = false;
			if (! this.isValueExcluded(value)) {
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


		// Fix the supplied value as the final value for that cell
		// We sanity check that it is not an impossible value i.e. it has not been marked as such by the "filter" aid options
		sudokuCell.prototype.clickPossibleValue = function (element, event)
		// Fix a value in a square
		{
			//console.log("Clicked possible value");
            var is_impossible = $(element).hasClass("impossible");
            if (!is_impossible) {
                var table_cell=element.parentNode.parentNode.parentNode;
                var cell_name = table_cell.name;
                var row = cell_name.substr( 4, 1);
                var column = cell_name.substr( 6, 1);

                var clicked_text=element.childNodes[0].nodeValue;
                var clickedValue = parseInt(clicked_text.valueOf());
                var clickedPosition = new PuzzlePosition(this.blockPosition, this.position);
                sudokuGlobal.puzzle.fixValue(clickedValue, clickedPosition);

                // Record the change so we can undo it
				sudokuGlobal.controls.storeUndo("FixValue", {value: clickedValue, position: clickedPosition});
            }

		}


		// Fix the supplied value as the final value for that cell
		// We sanity check that it is not an impossible value i.e. it has not been marked as such by the "filter" aid options
		sudokuCell.prototype.fixValue = function (value)
		// Fix a value in a square
		{
                this.currentValue = value;
		}


        // Used for manually removing a posssible value. It will add the value to a list of excluded values for the cell.
		sudokuCell.prototype.contextPossibleValue = function (element, event)
		// Remove a possible value in a square
		{
            //console.log("Removing from cell");
			var table_cell=element.parentNode.parentNode.parentNode;
			var cell_name = table_cell.name;
			var row = cell_name.substr( 4, 1);
			var column = cell_name.substr( 6, 1);
            console.log("row "+row+", column "+column);

			var clicked_text=element.childNodes[0].nodeValue;
            //console.log("excluding value "+clicked_text);
			var contextValue = parseInt(clicked_text.valueOf());
			var contextPosition = new PuzzlePosition(this.blockPosition, this.position);
			sudokuGlobal.puzzle.removeValue(parseInt(contextValue), contextPosition);
			sudokuGlobal.controls.storeUndo("RemoveValue", {value: contextValue, position: contextPosition});
            event.preventDefault();

		}

        // Used for manually removing a posssible value. It will add the value to a list of excluded values for the cell.
		sudokuCell.prototype.removeValue = function (value)
		// Remove a possible value in a square
		{
            //console.log("excluding value "+clicked_text);
			this.excludedValues.push(value);

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

		// Display the cell.
		// If it has a fixed value we display that value only (with a suitable class).
		// Otherwise we display the possible values in a table, with classes set to indicate how it is to be displayed.
		// For example, a value may be marked as "excluded" or be part of a group.
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
						if ( this.isValueExcluded(possibleValue) ) {
							possibleDetail.className="possibleCell";
						} else {
							possibleDetail.className="possibleCell " + this.possibleState[possibleValue];
							var possibleText = document.createTextNode(possibleValue);
							possibleDetail.appendChild(possibleText);
							var that = this;
                            
                            // Left click - fix value
							var clickfunc=function(e) {
								that.clickPossibleValue(this, e); // pass-through the event object
							}; 
							addEvent(possibleDetail, "click", clickfunc, false);
                            
                            // Right click - remove possible value
							var contextfunc=function(e) {
								that.contextPossibleValue(this, e); // pass-through the event object
							}; 
							addEvent(possibleDetail, "contextmenu", contextfunc, false);
						}
						possibleValue++;
					}
				}

				this.cellElement.className ="puzzleCell";
			}
		}

		this.init();
	}
