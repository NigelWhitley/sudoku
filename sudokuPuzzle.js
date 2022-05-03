/* 
Sudoku Aid v0.2 by Nigel Whitley (c) Copyright 2005-2014
 */

	/*
	This is the object/code for generating and managing the puzzle, in conjunction 
	with objects in sudokuBlock and sudokuCell and the controls from sudokuControls. 
	The data structure mimics the visual layout where the puzzle is made up of 
	"blocks" which are made up of "cells". A block has one cell for each value 
	(as required by the puzzle rules) and the puzzle has one block per value.
	There are helper functions for accessing rows and columns of cells across blocks.
	*/

	/*
	 * I've attempted to make the puzzle design generic and not restrict it
	 * to the original 9x9 pattern. So, the intent is that the main restriction 
	 * is a regular oblong layout.
	 * By regular I mean that the dimensions of the blocks within the puzzle is mirrored by 
	 * the layout of cells within the blocks. To support this, the longer dimension must be
	 * defined as a parameter along with the maximum value. Clearly the longer dimension must be
	 * a factor of the maximum value so that there is no remainder when the shorter dimension 
	 * is calculated. Naturally, in the original square puzzle the two dimensions will be the same.
	 * As an example, a puzzle with 6 values would have a longer dimension of 3 and a shorter
	 * dimension of 2. 
	 */

	function sudokuPuzzle() {


		sudokuPuzzle.prototype.getBlock = function (blockPosition) {
			return sudokuGlobal.blocks[blockPosition.row][blockPosition.column];
		}

		sudokuPuzzle.prototype.getCell = function (puzzlePosition) {
			return this.getBlock(puzzlePosition.block).getCell(puzzlePosition.cell);
		}

		sudokuPuzzle.prototype.isFixedValue = function (puzzlePosition) {
			return this.getBlock(puzzlePosition.block).isFixedValue(puzzlePosition.cell);
		}

		// The rowPosition is a Position_1d object
		sudokuPuzzle.prototype.getRowCells = function (rowPosition) {
			// Call the getRowCells function for each block in a row
			var cells = new Array();
			for (var column = sudokuStatic.firstBlockColumn; column <=sudokuStatic.lastBlockColumn; column++) {
				//debugFramework.showMessage("getRowCells pos " + rowPosition + " block " + column);
				//var blockCells = this.getBlock(new Position(rowPosition.block, column)).getRowCells(rowPosition.cell);
				//debugFramework.showMessage("getRowCells after row " + rowPosition + " length " + blockCells.length + " blockCells[0] " + blockCells[0], "append");
				//cells=cells.concat(blockCells);
				//debugFramework.showMessage("getRowCells after concat " + rowPosition + " length " + cells.length + " cells[0] " + cells[0], "append");
				cells = cells.concat(this.getBlock(new Position(rowPosition.block, column)).getRowCells(rowPosition.cell));
			}
			//debugFramework.showMessage("getRowCells end row " + rowPosition + " length " + cells.length + " cells[0] " + cells[0], "append");
			return cells;
		}

		// Wrapper for getRowCells but using the row from a "normal" puzzlePosition
		sudokuPuzzle.prototype.getPuzzleRowCells = function (puzzlePosition) {
			return this.getRowCells(new Position_1d(puzzlePosition.block.row, puzzlePosition.cell.row));
		}

		// The columnPosition is a Position_1d object
		sudokuPuzzle.prototype.getColumnCells = function (columnPosition) {
			// Call the getColumnCells function for each block in a column
			var cells = new Array();
			for (var row = sudokuStatic.firstBlockRow; row <=sudokuStatic.lastBlockRow; row++) {
				cells = cells.concat(this.getBlock(new Position(row, columnPosition.block)).getColumnCells(columnPosition.cell));
			}
			//debugFramework.showMessage("getColumnCells end col " + columnPosition + " length " + cells.length + " cells[0] " + cells[0], "append");
			return cells;
		}

		// Wrapper for getColumnCells but using the column from a "normal" puzzlePosition
		sudokuPuzzle.prototype.getPuzzleColumnCells = function (puzzlePosition) {
			return this.getColumnCells(new Position_1d(puzzlePosition.block.column, puzzlePosition.cell.column));
		}

		// The blockPosition is a Position object
		sudokuPuzzle.prototype.getBlockCells = function (blockPosition) {
			// Call the block's getBlockCells function
			//debugFramework.showMessage("getBlockCells pos " + blockPosition);
			return this.getBlock(blockPosition).getBlockCells();
		}

		// Wrapper for getBlockCells but using the block from a "normal" puzzlePosition
		sudokuPuzzle.prototype.getPuzzleBlockCells = function (puzzlePosition) {
			return this.getBlockCells(puzzlePosition.block);
		}

		sudokuPuzzle.prototype.getBlocks = function () {
			let allBlocks = new Array();
			for( var row=sudokuStatic.firstBlockRow; row <= sudokuStatic.lastBlockRow; row++) {

				for (var column=sudokuStatic.firstBlockColumn; column <= sudokuStatic.lastBlockColumn; column++) {
					var block = this.getBlock(new Position(row, column));
					allBlocks.push(block);
				}
			}
			return allBlocks;
		}

		sudokuPuzzle.prototype.clearFixedValues = function () {
			this.fixedValuesInRow = createArray(sudokuStatic.lastBlockRow, sudokuStatic.lastCellRow, sudokuStatic.maxValue);
			this.fixedValuesInColumn = createArray(sudokuStatic.lastBlockColumn, sudokuStatic.lastCellColumn, sudokuStatic.maxValue);
			this.fixedValuesInBlock = createArray(sudokuStatic.lastBlockRow, sudokuStatic.lastBlockColumn, sudokuStatic.maxValue);
		}

		// Clear the puzzle of all values
		sudokuPuzzle.prototype.clear = function () {
			this.clearFixedValues();
			let allBlocks = this.getBlocks();
			for ( var blockIndex = 0; blockIndex < allBlocks.length; blockIndex++ ) {
				allBlocks[blockIndex].clear();
			}
		}

		sudokuPuzzle.prototype.init = function () {
			this.controls = sudokuGlobal.controlsSection;
			// Remove the "fallback" text from the puzzle section 
			remove_children(sudokuGlobal.puzzleSection);
			// Sudoku puzzle is built as nested tables (sacrilege I know).
			// This could be done with nested divs, but the layout of the puzzle is
			// integral to the design of the code so form and function 
			// are far more intertwined than most applications.
			sudokuGlobal.puzzleSection.className = "";
			//sudokuGlobal.puzzleSection.className = "centred_text";
			sudokuGlobal.puzzleTable = document.createElement("TABLE");
			sudokuGlobal.puzzleTable.id = "puzzle";
			sudokuGlobal.puzzleTable.className = "centred_table set_font";
			for( var row=sudokuStatic.firstBlockRow; row <= sudokuStatic.lastBlockRow; row++) {
				var blockRow=document.createElement("TR");

				for (var column=sudokuStatic.firstBlockColumn; column <= sudokuStatic.lastBlockColumn; column++) {
					var currentBlock=document.createElement("TD");
					currentBlock.name = "block"+row+"_"+column;
					currentBlock.className = "puzzleBlock";

					var blockPosition = new Position(row, column);
					var block = new sudokuBlock(currentBlock, blockPosition);
					sudokuGlobal.blocks[row][column] = block;
					blockRow.appendChild(currentBlock);
				}
				sudokuGlobal.puzzleTable.appendChild(blockRow);
			}
			sudokuGlobal.puzzleSection.appendChild(sudokuGlobal.puzzleTable);
			//var block=this.getBlock(new Position(sudokuStatic.firstBlockRow, sudokuStatic.firstBlockColumn));
			this.clearFixedValues();
		}

		sudokuPuzzle.prototype.displayPuzzle = function ( ) {
			this.showAuto();
			this.showCells();
		}

		sudokuPuzzle.prototype.provideAid = function () {
			var aidLevel = sudokuGlobal.aidLevel.value;
			//debugFramework.showMessage("Level was " + sudokuGlobal.currentAidLevel + " now " + changedLevel);
			if (aidLevel == "basic") {
				sudokuGlobal.puzzle.showBasic();
			} else if (aidLevel == "auto") {
				sudokuGlobal.puzzle.showAuto();
			} else if (aidLevel == "showpin") {
				sudokuGlobal.puzzle.showPins();
			} else if (aidLevel == "filpin") {
				sudokuGlobal.puzzle.excludePinned();
			} else if (aidLevel == "showgrp") {
				sudokuGlobal.puzzle.showGroups();
			} else if (aidLevel == "filgrp") {
				sudokuGlobal.puzzle.excludeGroups();
			}
			sudokuGlobal.puzzle.showCells();
		}

		sudokuPuzzle.prototype.undo = function (undoAction, undoData) {
		// Undo the recorded action. 
			if (undoAction == "FixValue") {
				this.undoFixValue(undoData);
            } else if (undoAction == "RemoveValue") {
				this.undoRemoveValue(undoData);
			} else if (undoAction == "SetAidLevel") {
				sudokuGlobal.aidLevel.selectedIndex = undoData.previous;
				sudokuGlobal.controls.aidLevelChanged();
			}
		}

		sudokuPuzzle.prototype.redo = function (redoAction, redoData) {
		// Redo the recorded action. 
			if (redoAction == "FixValue") {
				this.fixValue(redoData.value, redoData.position);
				sudokuGlobal.controls.showUndoRedo();
            } else if (redoAction == "RemoveValue") {
				this.removeValue(redoData.value, redoData.position);
			} else if (redoAction == "SetAidLevel") {
				sudokuGlobal.aidLevel.selectedIndex = redoData.current;
				sudokuGlobal.controls.aidLevelChanged();
			}
		}

		sudokuPuzzle.prototype.undoFixValue = function (undoData) {
		// Cancel the fixing of a value in a cell and redisplay the possible values
			var undoValue = undoData.value;
			var undoPosition = undoData.position;
			var blockRow = undoPosition.block.row;
			var blockColumn = undoPosition.block.column;
			var cellRow = undoPosition.cell.row;
			var cellColumn = undoPosition.cell.column;

			var undoCell = this.getCell(undoPosition);

			undoCell.currentValue = 0;

			this.removeFixedValueInRow (undoValue, undoPosition);
			this.removeFixedValueInColumn (undoValue, undoPosition);
			this.removeFixedValueInBlock (undoValue, undoPosition);

			this.provideAid();
		}

		sudokuPuzzle.prototype.fixValue = function (valueToFix, puzzlePosition) {
			// Fix a value in a cell
			// When a final decision has been reached regarding the value to 
			// be assigned to a particular cell, this function ensures that 
			// all the related data is updated to reflect that. 
			// It notes that the value is now fixed in the row, column and block
			// so that it is not a possible value in those.
			// It then identifies any unique values for each cell from the new 
			// set of possible values in the puzzle. If there are no unique values 
			// it looks for "pins".
			// Next it records the fixed value in the cell.
			// Finally it shows the puzzle in its new condition.
			this.addFixedValueInRow (valueToFix, puzzlePosition);
			this.addFixedValueInColumn (valueToFix, puzzlePosition);
			this.addFixedValueInBlock (valueToFix, puzzlePosition);

			this.getCell(puzzlePosition).fixValue(valueToFix);

			//debugFramework.showMessage("Fixed value arr " + this.fixedValuesInColumn[puzzlePosition.block.column][puzzlePosition.cell.column]);

			this.provideAid();
			return false;
		}

        // Remove possible Value
		sudokuPuzzle.prototype.removeValue = function (valueToRemove, puzzlePosition) {
			// Remove a value in a cell
			// We can manually remove possible values from a cell
            // Typically this happens when spotting pins or groups 
			// It then identifies any unique values for each cell from the new 
			// set of possible values in the puzzle. If there are no unique values 
			// it looks for "pins".
			// Next it records the removed value in the "Undo" stack.
			// Finally it shows the puzzle in its new condition.
            console.log("Removing in puzzle");
			this.getCell(puzzlePosition).removeValue(valueToRemove);
    		this.excludePossibleValueForCell( valueToRemove, puzzlePosition );
			//debugFramework.showMessage("Fixed value arr " + this.fixedValuesInColumn[puzzlePosition.block.column][puzzlePosition.cell.column]);

			this.provideAid();
			return false;
		}

		sudokuPuzzle.prototype.undoRemoveValue = function (undoData) {
		// Cancel the fixing of a value in a cell and redisplay the possible values
			var undoPosition = undoData.position;
			var undoValue = undoData.value;
			var blockRow = undoPosition.block.row;
			var blockColumn = undoPosition.block.column;
			var cellRow = undoPosition.cell.row;
			var cellColumn = undoPosition.cell.column;

			var undoCell = this.getCell(undoPosition);

			undoCell.undoExcludePossibleValue(undoValue);

			this.provideAid();
		}

		sudokuPuzzle.prototype.showBasic = function () {
			// Basic level just builds the set of possible values in each
			// cell by eliminating the fixed values in the related
			// block, row and column.
			this.buildPossibleValues();
			return false;
		}

		sudokuPuzzle.prototype.showAuto = function () {
			// Singles level checks the set of possible values in each
			// cell for a value which is either the only possible value in a 
			// cell or which is unique in the related block, row or column. 
			// It then flags any such value found. 
			this.buildPossibleValues();
			this.hintsFound = this.checkForSingles();
            // If no singles were found, check for groups
			if ( ! this.hintsFound ) {
                // Only show which values would be excluded because of groups, don't remove them
				this.hintsFound = this.checkForGroups("show");
			}
			//console.log("shown auto");
			return false;
		}

		sudokuPuzzle.prototype.showPins = function () {
			// This level checks cells for useful intersections between block 
			// and row or column. For more information see checkForPins.
			// It then flags any such value found. 
			this.buildPossibleValues();
			this.hintsFound = this.checkForPins("show");
			this.hintsFound = this.checkForGroups("exclude") || this.hintsFound;
			this.hintsFound = this.checkForPins("show") || this.hintsFound;
			this.hintsFound = this.checkForSingles() || this.hintsFound;
			return false;
		}

		sudokuPuzzle.prototype.excludePinned = function () {
			// This level checks cells for useful intersections between block 
			// and row or column. For more information see checkForPins. 
			// It then flags any such value found and excludes the flagged
			// values from the intersecting block, row or column.
            
            // Because this is always used in conjunction with exclude groups we run the Pins processing both before and afterward.
            // This is because the two will interact so Pins can reveal Groups and vice versa but I'm not iterating exhaustively.
			this.buildPossibleValues();
			this.hintsFound = this.checkForPins("exclude");
			this.hintsFound = this.checkForGroups("exclude") || this.hintsFound;
			this.hintsFound = this.checkForPins("exclude") || this.hintsFound;
			this.hintsFound = this.checkForSingles() || this.hintsFound;
			return false;
		}

		sudokuPuzzle.prototype.showGroups = function () {
			// This level checks cells for useful intersections between block 
			// and row or column. For more information see checkForPins.
			// It then flags any such value found. 
			this.buildPossibleValues();
			this.hintsFound = this.checkForGroups("show");
			//this.hintsFound = this.checkForPins("exclude") || this.hintsFound;
			this.hintsFound = this.checkForSingles() || this.hintsFound;
			return false;
		}

		sudokuPuzzle.prototype.excludeGroups = function () {
			// This level checks cells for useful intersections between block 
			// and row or column. For more information see checkForPins. 
			// It then flags any such value found and excludes the flagged
			// values from the intersecting block, row or column.
			this.buildPossibleValues();
			//var oldDebugState = debugFramework.enableDebug();
			this.hintsFound = this.checkForGroups("exclude");
			//this.hintsFound = this.checkForPins("exclude") || this.hintsFound;
			//debugFramework.restoreDebug( oldDebugState );
			this.hintsFound = this.checkForSingles() || this.hintsFound;
			return false;
		}

		sudokuPuzzle.prototype.showCells = function () {
			// Call the showCell function for each cell in each block.
			for (var blockRow=sudokuStatic.firstBlockRow; blockRow <=  sudokuStatic.lastBlockRow; blockRow++) {
				for (var blockColumn=sudokuStatic.firstBlockColumn; blockColumn <= sudokuStatic.lastBlockColumn; blockColumn++) {
					var block = this.getBlock(new Position(blockRow, blockColumn));
					for (var cellRow=sudokuStatic.firstCellRow; cellRow <= sudokuStatic.lastCellRow; cellRow++) {
						for (var cellColumn=sudokuStatic.firstCellColumn; cellColumn <= sudokuStatic.lastCellColumn; cellColumn++) {
							block.getCell(new Position(cellRow, cellColumn)).showCell();
						}
					}
				}
			}
		}

		// A unit is a set of cells which have the constraint of each value
		// appearing once and only once. In other words it can be a block, row or
		// column. It is passed as a set of "maxValue" cell positions.
		sudokuPuzzle.prototype.buildFixedValuesInUnit = function ( unitCellPositions ) {
			var fixedValues = createArray(sudokuStatic.maxValue);
			for (unitCell=0; unitCell < sudokuStatic.maxValue; unitCell++) {
				var unitCellPosition = unitCellPositions[unitCell];
				if ( this.getCell(unitCellPosition).isFixedValue() ) {
					var cellValue = this.getCell(unitCellPosition).currentValue;
					fixedValues[cellValue] = unitCellPosition;
				}
			}
			return fixedValues;
		}

		sudokuPuzzle.prototype.buildFixedValuesInRow = function ( ) {
			for (var blockRow=sudokuStatic.firstBlockRow; blockRow <= sudokuStatic.lastBlockRow; blockRow++) {
				for (var cellRow=sudokuStatic.firstCellRow; cellRow <= sudokuStatic.lastCellRow; cellRow++) {
					var rowPosition = new Position_1d(blockRow, cellRow);
					this.fixedValuesInRow[blockRow][cellRow] = this.buildFixedValuesInUnit(this.getRowCells(rowPosition));
				}
			}
		}

		sudokuPuzzle.prototype.addFixedValueInRow = function (fixedValue, puzzlePosition) {
			this.fixedValuesInRow[puzzlePosition.block.row][puzzlePosition.cell.row][fixedValue] = puzzlePosition;
			return this.fixedValuesInRow;
		}

		sudokuPuzzle.prototype.removeFixedValueInRow = function (fixedValue, puzzlePosition) {
			this.fixedValuesInRow[puzzlePosition.block.row][puzzlePosition.cell.row][fixedValue] = undefined;
			return this.fixedValuesInRow;
		}

		sudokuPuzzle.prototype.buildFixedValuesInColumn = function ( ) {
			for (var blockColumn=sudokuStatic.firstBlockColumn; blockColumn <= sudokuStatic.lastBlockColumn; blockColumn++) {
				for (var cellColumn=sudokuStatic.firstCellColumn; cellColumn <= sudokuStatic.lastCellColumn; cellColumn++) {
					var columnPosition = new Position_1d(blockColumn, cellColumn);
					this.fixedValuesInColumn[blockColumn][cellColumn] = this.buildFixedValuesInUnit(this.getColumnCells(columnPosition));
				}
			}
		}

		sudokuPuzzle.prototype.addFixedValueInColumn = function (fixedValue, puzzlePosition) {
			this.fixedValuesInColumn[puzzlePosition.block.column][puzzlePosition.cell.column][fixedValue] = puzzlePosition;
			return this.fixedValuesInColumn;
		}

		sudokuPuzzle.prototype.removeFixedValueInColumn = function (fixedValue, puzzlePosition) {
			this.fixedValuesInColumn[puzzlePosition.block.column][puzzlePosition.cell.column][fixedValue] = undefined;
			return this.fixedValuesInColumn;
		}

		sudokuPuzzle.prototype.buildFixedValuesInBlock = function ( ) {
			for (var blockRow=sudokuStatic.firstBlockRow; blockRow <= sudokuStatic.lastBlockRow; blockRow++) {
				for (var blockColumn=sudokuStatic.firstBlockColumn; blockColumn <= sudokuStatic.lastBlockColumn; blockColumn++) {
					this.fixedValuesInBlock[blockRow][blockColumn] = this.buildFixedValuesInUnit( this.getBlockCells( new Position(blockRow, blockColumn) ) );
					//this.getBlock(new Position(blockRow, blockColumn)).buildFixedValuesInBlock();
				}
			}
		}

		sudokuPuzzle.prototype.addFixedValueInBlock = function (fixedValue, puzzlePosition) {
			this.fixedValuesInBlock[puzzlePosition.block.row][puzzlePosition.block.column][fixedValue] = puzzlePosition;
			return this.fixedValuesInBlock;
		}

		sudokuPuzzle.prototype.removeFixedValueInBlock = function (fixedValue, puzzlePosition) {
			this.fixedValuesInBlock[puzzlePosition.block.row][puzzlePosition.block.column][fixedValue] = undefined;
			return this.fixedValuesInBlock;
		}

		sudokuPuzzle.prototype.excludePossibleValueForCell = function ( value, puzzlePosition ) {
			this.getBlock(puzzlePosition.block).getCell(puzzlePosition.cell).excludePossibleValue( value );
		}

		sudokuPuzzle.prototype.undoExcludePossibleValueForCell = function ( value, puzzlePosition ) {
			this.getBlock(puzzlePosition.block).getCell(puzzlePosition.cell).undoExcludePossibleValue( value );
		}

		sudokuPuzzle.prototype.resetPossibleValues = function ( ) {
			for (var blockRow=sudokuStatic.firstBlockRow; blockRow <= sudokuStatic.lastBlockRow; blockRow++) {
				for (var blockColumn=sudokuStatic.firstBlockColumn; blockColumn <= sudokuStatic.lastBlockColumn; blockColumn++) {
					this.getBlock(new Position(blockRow, blockColumn)).resetPossibleValues();
				}
			}
		}

		sudokuPuzzle.prototype.buildPossibleValues = function ( ) {
			this.resetPossibleValues();
			for (var blockRow=sudokuStatic.firstBlockRow; blockRow <= sudokuStatic.lastBlockRow; blockRow++) {
				for (var blockColumn=sudokuStatic.firstBlockColumn; blockColumn <= sudokuStatic.lastBlockColumn; blockColumn++) {
					var blockPosition = new Position(blockRow, blockColumn);
					//var block = this.getBlock(blockPosition);
					for (var cellRow=sudokuStatic.firstCellRow; cellRow <= sudokuStatic.lastCellRow; cellRow++) {
						for (var cellColumn=sudokuStatic.firstCellColumn; cellColumn <= sudokuStatic.lastCellColumn; cellColumn++) {
							var puzzlePosition = new PuzzlePosition(blockPosition, new Position(cellRow, cellColumn));
							//debugFramework.showMessage("build cell row " + cellRow + " column " + cellColumn + " Fixed value arr " + this.fixedValuesInColumn[puzzlePosition.block.column][puzzlePosition.cell.column], "append");
							this.collateFixedValues(puzzlePosition);
						}
					}
				}
			}
		}

		sudokuPuzzle.prototype.collateFixedValues = function ( puzzlePosition ) {
			var fixedValuesInRow = this.fixedValuesInRow[puzzlePosition.block.row][puzzlePosition.cell.row];
			var fixedValuesInColumn = this.fixedValuesInColumn[puzzlePosition.block.column][puzzlePosition.cell.column];
			//debugFramework.showMessage("fixedvaluesInBlock row " + puzzlePosition.block.row);
			var fixedValuesInBlock = this.fixedValuesInBlock[puzzlePosition.block.row][puzzlePosition.block.column];
			for (var valueIndex=1; valueIndex <= sudokuStatic.maxValue; valueIndex++) {
				if (fixedValuesInBlock[valueIndex] !== undefined) {
					this.excludePossibleValueForCell(valueIndex, puzzlePosition);
				} else if (fixedValuesInRow[valueIndex] !== undefined) {
					this.excludePossibleValueForCell(valueIndex, puzzlePosition);
				} else if (fixedValuesInColumn[valueIndex] !== undefined) {
					this.excludePossibleValueForCell(valueIndex, puzzlePosition);
				}
			}
		}

		sudokuPuzzle.prototype.checkForSingles = function () {
			// Check first for a value being in only one possible place.
			// If so, we can ignore all other possible values in that cell
			//debugFramework.showMessage("cfs block");
			var singlesFound = this.checkForSinglesByBlock();
			//debugFramework.showMessage("cfs row");
			singlesFound = singlesFound + this.checkForSinglesByRow();
			//debugFramework.showMessage("cfs column");
			singlesFound = singlesFound + this.checkForSinglesByColumn();
			//debugFramework.showMessage("cfs end");
			return (singlesFound > 0);
		}

		// A unit is a set of cells which have the constraint of each value
		// appearing once and only once. In other words it can be a block, row or
		// column. It is passed as a set of "maxValue" cell positions.
		// A "single" is the value which can be in only a particular cell, either
		// because all other possible values have been excluded for that cell or 
		// because that is the only possible cell for that value within the unit.
		sudokuPuzzle.prototype.checkForSinglesByUnit = function ( unitCellPositions ) {
			var singlesFound = 0;
			//debugFramework.showMessage("cfsbu start ");
			var onlyValue = createArray(sudokuStatic.maxValue);
			var possiblePositions = createArray(sudokuStatic.maxValue);
			for (var unitCell=0; unitCell < unitCellPositions.length; unitCell++) {
				//debugFramework.showMessage("cfsbu unit unitCell " + unitCell + " position " + unitCellPositions[unitCell], "append");
				var cell = this.getCell(unitCellPositions[unitCell]);
				if ( ! cell.isFixedValue() ) {
					var possibleValues = cell.getPossibleValues();
					//for (var possibleValue=1; possibleValue <= sudokuStatic.maxValue; possibleValue++) {
					if ( possibleValues.length === 1 ) {
						//debugFramework.showMessage("cfsbu ct " + cell.possibleCount + " value " + possibleValue + " status " + cell.possibleState[possibleValue] + " at " + unitCellPositions[unitCell], "append");
						onlyValue[possibleValues[0]] = unitCellPositions[unitCell];
					}
					for (var valueIndex=0; valueIndex < possibleValues.length; valueIndex++) {
						var possibleValue = possibleValues[valueIndex];
						if ( cell.isValuePossible(possibleValue) ) {
							if ( typeof possiblePositions[possibleValue] === 'undefined' ) {
								possiblePositions[possibleValue] = new Array();
							}
							possiblePositions[possibleValue].push( unitCellPositions[unitCell] );
						}
					}
				}
			}

			//debugFramework.showMessage("cfsbu checking ");
			for (var possibleValue=1; possibleValue <= sudokuStatic.maxValue; possibleValue++) {
				if ( typeof onlyValue[possibleValue] !== 'undefined' ) {
					//debugFramework.showMessage("cfsbu only value " + possibleValue, "append");
					this.getCell(onlyValue[possibleValue]).onlyPossibleValue(possibleValue);
					singlesFound++;
				} else if ( ( typeof possiblePositions[possibleValue] !== 'undefined' ) && ( possiblePositions[possibleValue].length === 1 ) ) {
					//debugFramework.showMessage("cfsbu only pos " + possibleValue);
					this.getCell(possiblePositions[possibleValue][0]).onlyPossibleValue(possibleValue);
					singlesFound++;
				}
			}
			//debugFramework.showMessage("cfsbu end ");
			return singlesFound;
		}

		sudokuPuzzle.prototype.checkForSinglesByRow = function () {
			var singlesFound = 0;
			//debugFramework.showMessage("cfsbr block");
			for (var blockRow=sudokuStatic.firstBlockRow; blockRow <= sudokuStatic.lastBlockRow; blockRow++) {
				for (var cellRow=sudokuStatic.firstCellRow; cellRow <= sudokuStatic.lastCellRow; cellRow++) {
					var rowPosition = new Position_1d(blockRow, cellRow);
					//debugFramework.showMessage("cfsbr unit row " + blockRow + " cell " + cellRow + " pos " + rowPosition);
					singlesFound = singlesFound + this.checkForSinglesByUnit( this.getRowCells(rowPosition) );
				}
			}
			return singlesFound;
		}

		sudokuPuzzle.prototype.checkForSinglesByColumn = function () {
			var singlesFound = 0;
			for (var blockColumn=sudokuStatic.firstBlockColumn; blockColumn <= sudokuStatic.lastBlockColumn; blockColumn++) {
				for (var cellColumn=sudokuStatic.firstCellColumn; cellColumn <= sudokuStatic.lastCellColumn; cellColumn++) {
					var columnPosition = new Position_1d(blockColumn, cellColumn);
					singlesFound = singlesFound + this.checkForSinglesByUnit( this.getColumnCells(columnPosition) );
				}
			}
			return singlesFound;
		}

		sudokuPuzzle.prototype.checkForSinglesByBlock = function ( ) {
			var singlesFound = 0;
			//debugFramework.showMessage("cfsbb block");
			for (var blockRow=sudokuStatic.firstBlockRow; blockRow <= sudokuStatic.lastBlockRow; blockRow++) {
				for (var blockColumn=sudokuStatic.firstBlockColumn; blockColumn <= sudokuStatic.lastBlockColumn; blockColumn++) {
					//debugFramework.showMessage("cfsbb unit row " + blockRow + " column " + blockColumn);
					singlesFound = singlesFound + this.checkForSinglesByUnit( this.getBlockCells( new Position(blockRow, blockColumn) ) );
					//this.getBlock(new Position(blockRow, blockColumn)).buildFixedValuesInBlock();
				}
			}
			return singlesFound;
		}

		sudokuPuzzle.prototype.checkForPins = function (pinAction) {
			// Blocks and rows intersect across several cells, as do blocks and columns.
			// Where that intersection contains all possible values according to one 
			// rule or limitation, it therefore contains all possible values according
			// to the limitation on the intersecting block, row, or column.
			// I refer to this behaviour as "pinning".
			// For example, if all values in a row for the value "2" are in the same block,
			// we know that any values of "2" elsewhere in that block can be ignored. 
			// The same logic applies vice versa ie values from a block pinning that row,
			// and for the interaction between blocks and columns. 
			// Note that the only possible such interaction between row and column implies a single value.
			//this.stateChanged = false;
			var pinningValuesFound = this.checkForPinsFromBlock(pinAction);
			pinningValuesFound = this.checkForPinsFromRow(pinAction) || pinningValuesFound;
			pinningValuesFound = this.checkForPinsFromColumn(pinAction) || pinningValuesFound;
			//debugFramework.showMessage("cfp after checks length " + pinningValues.length);
			return pinningValuesFound;
		}

		// A unit is a set of cells which have the constraint of each value
		// appearing once and only once. In other words it can be a block, row or
		// column. It is passed as a set of "maxValue" cell positions.
		// A "pin" occurs when the only possible positions for a value in one 
		// kind of unit are in the cells it shares with a different unit, for 
		// example the cells shared between a block and a row.
		sudokuPuzzle.prototype.checkForPinsByUnit = function ( unitCellPositions ) {
			var singlesFound = 0;
			//debugFramework.showMessage("cfpbu start ");
			var possiblePositions = createArray(sudokuStatic.maxValue);
			for (var unitCell=0; unitCell < unitCellPositions.length; unitCell++) {
				//debugFramework.showMessage("cfpbu unit unitCell " + unitCell + " position " + unitCellPositions[unitCell], "append");
				var cell = this.getCell(unitCellPositions[unitCell]);
				if ( ! cell.isFixedValue() ) {
					for (var possibleValue=1; possibleValue <= sudokuStatic.maxValue; possibleValue++) {
						if ( cell.isValuePossible(possibleValue) ) {
							if ( typeof possiblePositions[possibleValue] === 'undefined' ) {
								possiblePositions[possibleValue] = new Array();
							}
							possiblePositions[possibleValue].push( unitCellPositions[unitCell] );
						}
					}
				}
			}

			//debugFramework.showMessage("cfpbu checking ");
			pinningValues = new Array();
			for (var possibleValue=1; possibleValue <= sudokuStatic.maxValue; possibleValue++) {
				// For a pin to occur the number of possible positions cannot exceed the 
				// longer dimension , e.g. in a 3x2 puzzle there cannot be four. If the 
				// intersecting dimension is the shorter one then that would be the maximum
				// but I chose to ignore that extra complexity.
				var pinType = "none";
				var pinningPositions = new Array();
				if ( ( typeof possiblePositions[possibleValue] !== 'undefined' ) && ( possiblePositions[possibleValue].length <= sudokuStatic.longPuzzleDimension ) ) {
					// Now need to check whether those positions are all in an intersecting area.
					// To do that we need to compare the first two values and determine what units 
					// they share, then check for the same relationship with any remaining positions.
					// Only if all are in the overlap can we say there is a pin.
					// (Normally we would be checking for pins if there is more than one possible position
					// but for now we will check for the possibility of a single value too).
					//debugFramework.showMessage("cfpbu only pos " + possibleValue);
					pinningPositions.push(possiblePositions[possibleValue][0]);
				
					if ( possiblePositions[possibleValue].length === 1) {
						pinType = "single";
					} else {
						// The only possible valid intersection with more than one position is between 
						// a) block and row OR
						// b) block and column
						// Therefore we first check the block is the same, then check whether the other
						// relationship holds.
						if ( pinningPositions[0].isSameBlockAs(possiblePositions[possibleValue][1]) ) {
							pinningPositions.push(possiblePositions[possibleValue][1]);
							if ( pinningPositions[0].isSameRowAs(possiblePositions[possibleValue][1]) ) {
								pinType = "row";
								for (positionIndex=2; positionIndex < possiblePositions[possibleValue].length; positionIndex++) {
									if ( ( pinningPositions[0].isSameBlockAs(possiblePositions[possibleValue][positionIndex]) )
									  && ( pinningPositions[0].isSameRowAs(possiblePositions[possibleValue][positionIndex]) ) ) {
										pinningPositions.push(possiblePositions[possibleValue][positionIndex]);
									} else {
										pinType = "none";
										break;
									}
								}
							} else if ( pinningPositions[0].isSameColumnAs(possiblePositions[possibleValue][1]) ) {
								pinType = "column";
								for (positionIndex=2; positionIndex < possiblePositions[possibleValue].length; positionIndex++) {
									if ( ( pinningPositions[0].isSameBlockAs(possiblePositions[possibleValue][positionIndex]) )
									  && ( pinningPositions[0].isSameColumnAs(possiblePositions[possibleValue][positionIndex]) ) ) {
										pinningPositions.push(possiblePositions[possibleValue][positionIndex]);
									} else {
										pinType = "none";
										break;
									}
								}
							}
						}
					}
				}
				if (pinType !== 'none') {
					//var pinningInfo = [pinType, possibleValue, pinningPositions];
					var pinningValue = {type: pinType, value: possibleValue, positions: pinningPositions};
					//debugFramework.showMessage("cfpfu found type " + pinType + " value " + possibleValue + " pos " + pinningPositions);
					pinningValues.push(pinningValue);
					//pinningValues.push({type: pinType, value: possibleValue, positions: pinningPositions});
				}
			}
			//debugFramework.showMessage("cfpbu end ");
			//debugFramework.showMessage("cfpfu end length " + pinningValues.length, "append" );
			return pinningValues;
		}

		sudokuPuzzle.prototype.checkForPinsFromBlock = function ( pinnedAction ) {
			var pinningValues = new Array();
			//debugFramework.showMessage("cfpfb block");
			for (var blockRow=sudokuStatic.firstBlockRow; blockRow <= sudokuStatic.lastBlockRow; blockRow++) {
				for (var blockColumn=sudokuStatic.firstBlockColumn; blockColumn <= sudokuStatic.lastBlockColumn; blockColumn++) {
					//debugFramework.showMessage("cfpfb unit row " + blockRow + " column " + blockColumn);
					pinningValues = pinningValues.concat( this.checkForPinsByUnit( this.getBlockCells( new Position(blockRow, blockColumn) ) ) );
					//debugFramework.showMessage("cfpfb checked at row " + blockRow + " column " + blockColumn + " length " + pinningValues[blockRow][blockColumn].length, "append");
				}
			}

			var pinnedState;
			if ( pinnedAction === "exclude" ) {
				pinnedState = "excluded";
			} else {
				pinnedState = "impossible";
			}

			for (var pinningIndex=0; pinningIndex < pinningValues.length; pinningIndex++) {
				var pinningInfo = pinningValues[pinningIndex];
				if ( pinningInfo.type === "single" || pinningInfo.type === "row" ) {
					for ( var pinningPosition=0; pinningPosition < pinningInfo.positions.length; pinningPosition++ ) {
						this.getCell(pinningInfo.positions[pinningPosition]).addStateForPossibleValue("rowpin", pinningInfo.value);
					}

					// Exclude the value from the possibles in the rest of row
					var pinningPosition = pinningInfo.positions[0];
					var cells = this.getPuzzleRowCells(pinningPosition);
					for ( var cellIndex = 0; cellIndex < cells.length; cellIndex++ ) {
						var cellPosition = cells[cellIndex];
						if ( ! cellPosition.isSameBlockAs(pinningPosition) ) {
							//debugFramework.showMessage("cfpfb exclude row pos " + cellPosition + " value " + pinningInfo.value, "append");
							this.getCell(cellPosition).setStateForPossibleValue(pinnedState, pinningInfo.value);
						}
					}
				}

				if ( pinningInfo.type === "single" || pinningInfo.type === "column" ) {
					for ( var pinningPosition=0; pinningPosition < pinningInfo.positions.length; pinningPosition++ ) {
						this.getCell(pinningInfo.positions[pinningPosition]).addStateForPossibleValue("columnpin", pinningInfo.value);
					}

					// Exclude the value from the possibles in the rest of column
					var pinningPosition = pinningInfo.positions[0];
					var cells = this.getPuzzleColumnCells(pinningPosition);
					for ( var cellIndex = 0; cellIndex < cells.length; cellIndex++ ) {
						var cellPosition = cells[cellIndex];
						if ( ! cellPosition.isSameBlockAs(pinningPosition) ) {
							//debugFramework.showMessage("cfpfb exclude col pos " + cellPosition + " value " + pinningInfo.value, "append");
							this.getCell(cellPosition).setStateForPossibleValue(pinnedState, pinningInfo.value);
						}
					}
				}
			}
			return pinningValues;
		}

		sudokuPuzzle.prototype.checkForPinsFromRow = function ( pinnedAction ) {
			var pinningValues = createArray();
			//debugFramework.showMessage("cfpfb block");
			for (var blockRow=sudokuStatic.firstBlockRow; blockRow <= sudokuStatic.lastBlockRow; blockRow++) {
				for (var cellRow=sudokuStatic.firstCellRow; cellRow <= sudokuStatic.lastCellRow; cellRow++) {
					//debugFramework.showMessage("cfpfb unit row " + blockRow + " column " + blockColumn);
					var rowPosition = new Position_1d(blockRow, cellRow);
					//var rowCells = this.getRowCells( rowPosition );
					//debugFramework.showMessage("cfpfb cells " +  rowCells );
					//pinningValues = pinningValues.concat( this.checkForPinsByUnit( rowCells ) );
					pinningValues = pinningValues.concat( this.checkForPinsByUnit( this.getRowCells( rowPosition ) ) );
				}
			}

			var pinnedState;
			if ( pinnedAction === "exclude" ) {
				pinnedState = "excluded";
			} else {
				pinnedState = "impossible";
			}

			for (var pinningIndex=0; pinningIndex < pinningValues.length; pinningIndex++) {
				var pinningInfo = pinningValues[pinningIndex];
				if ( pinningInfo.type === "single" || pinningInfo.type === "row" ) {
					for ( var pinningPosition=0; pinningPosition < pinningInfo.positions.length; pinningPosition++ ) {
						this.getCell(pinningInfo.positions[pinningPosition]).addStateForPossibleValue("rblockpin", pinningInfo.value);
					}

					// Exclude the value from the possibles in the rest of row
					var pinningPosition = pinningInfo.positions[0];
					var cells = this.getPuzzleBlockCells(pinningPosition);
					for ( var cellIndex = 0; cellIndex < cells.length; cellIndex++ ) {
						var cellPosition = cells[cellIndex];
						if ( ! cellPosition.isSameRowAs(pinningPosition) ) {
							//debugFramework.showMessage("cfpfr exclude rblk pos " + cellPosition + " value " + pinningInfo.value, "append");
							//this.getCell(cellPosition).excludePossibleValue(pinningInfo.value);
							this.getCell(cellPosition).setStateForPossibleValue(pinnedState, pinningInfo.value);
						}
					}
				}
			}
			return pinningValues;
		}

		sudokuPuzzle.prototype.checkForPinsFromColumn = function ( pinnedAction ) {
			var pinningValues = createArray();
			//debugFramework.showMessage("cfpfb block");
			for (var blockColumn=sudokuStatic.firstBlockColumn; blockColumn <= sudokuStatic.lastBlockColumn; blockColumn++) {
				for (var cellColumn=sudokuStatic.firstCellColumn; cellColumn <= sudokuStatic.lastCellColumn; cellColumn++) {
					var columnPosition = new Position_1d(blockColumn, cellColumn);
					//debugFramework.showMessage("cfpfb unit row " + blockRow + " column " + blockColumn);
					pinningValues = pinningValues.concat( this.checkForPinsByUnit( this.getColumnCells( columnPosition ) ) );
				}
			}

			var pinnedState;
			if ( pinnedAction === "exclude" ) {
				pinnedState = "excluded";
			} else {
				pinnedState = "impossible";
			}

			for (var pinningIndex=0; pinningIndex < pinningValues.length; pinningIndex++) {
				var pinningInfo = pinningValues[pinningIndex];
				if ( pinningInfo.type === "single" || pinningInfo.type === "column" ) {
					for ( var pinningPosition=0; pinningPosition < pinningInfo.positions.length; pinningPosition++ ) {
						this.getCell(pinningInfo.positions[pinningPosition]).addStateForPossibleValue("cblockpin", pinningInfo.value);
					}

					// Exclude the value from the possibles in the rest of row
					var pinningPosition = pinningInfo.positions[0];
					var cells = this.getPuzzleBlockCells(pinningPosition);
					for ( var cellIndex = 0; cellIndex < cells.length; cellIndex++ ) {
						var cellPosition = cells[cellIndex];
						if ( ! cellPosition.isSameColumnAs(pinningPosition) ) {
							//debugFramework.showMessage("cfpfc exclude cblk pos " + cellPosition + " value " + pinningInfo.value, "append");
							//this.getCell(cellPosition).excludePossibleValue(pinningInfo.value);
							this.getCell(cellPosition).setStateForPossibleValue(pinnedState, pinningInfo.value);
						}
					}
				}
			}
			return pinningValues;
		}

		sudokuPuzzle.prototype.checkForGroups = function (groupAction) {
			// For our purposes a "group" refers to a subset of possible values and positions within a unit 
            // (block, row or column). The number of values must match the number of positions within the group 
            // and that number must be fewer then the number of values still to be solved within that unit. So a
            // group of three would be formed within a unit with seven unsolved positions if there were three
            // positions which could only contain any of three values. 
			//debugFramework.showMessage("checkForGroups by row", "append");
			//this.stateChanged = false;
			var groups = this.checkForGroupsByRow(groupAction);
			//debugFramework.showMessage("checkForGroups by column", "append");
			groups = groups.concat( this.checkForGroupsByColumn(groupAction) );
			//debugFramework.showMessage("checkForGroups by block", "append");
			groups = groups.concat( this.checkForGroupsByBlock(groupAction) );
			return (groups.length > 0);
		}

		// A unit is a set of cells which have the constraint of each value
		// appearing once and only once. In other words it can be a block, row or
		// column. It is passed as a set of "maxValue" cell positions.
		// A "group" occurs when the only possible positions for a subset of 
		// values in the unit are in a subset of cells and the number of cells 
		// matches the number of values.
		sudokuPuzzle.prototype.checkForGroupsByUnit = function ( unitCellPositions, groupState, groupsAction ) {
			//debugFramework.showMessage("checkForGroups by unit", "append");
			var cellSet = new sudokuCellSet( unitCellPositions );
			var possibleCellPositions = cellSet.possibleSet;
			for (var groupIndex=0; groupIndex < cellSet.groups.length; groupIndex++) {
				//debugFramework.showMessage("checkForGroups by unit index " + groupIndex, "append");
				var group = cellSet.groups[groupIndex];
				var values = group.getValuesAsArray();
				var groupPositions = group.getPositionsAsArray();
				//debugFramework.showMessage("cfgbr group values " + values);
				for ( var cellIndex = 0; cellIndex < groupPositions.length; cellIndex++ ) {
					//debugFramework.showMessage("cfgbr group cell index is " + cellIndex + " pos " + positions[cellIndex], "append");
					var cell = this.getCell(groupPositions[cellIndex]);
					for ( var valueIndex = 0; valueIndex < values.length; valueIndex++ ) {
						if ( cell.isValuePossible(values[valueIndex]) ) {
							//debugFramework.showMessage("setting css state for row group index " + valueIndex, "append");
							cell.addStateForPossibleValue(groupState, values[valueIndex]);
							cell.addStateForPossibleValue("group" + groupIndex, values[valueIndex]);
							//debugFramework.showMessage("set css state for row group");
						}
					}
				}

				var valueState;
				if ( groupsAction === "exclude" ) {
					valueState = "excluded";
				} else {
					valueState = "impossible";
				}

				//var oldDebugState = debugFramework.enableDebug();
				//debugFramework.showMessage( "cFGBU exclude group values " + values.toString() );

				// Remove the values in the group from the rest of the cells in the unit
				var remainingPositions = sudokuCellSet.withoutPositions( possibleCellPositions, groupPositions );
				//debugFramework.showMessage( "exclude group values from " + remainingPositions );
				for ( var cellIndex = 0; cellIndex < remainingPositions.length; cellIndex++ ) {
					var cell = this.getCell(remainingPositions[cellIndex]);
					for ( var valueIndex = 0; valueIndex < values.length; valueIndex++ ) {
						debugFramework.showMessage("ignoring value " + values[valueIndex], "append");
						//cell.excludePossibleValue(values[valueIndex]);
						this.stateChanged = cell.setStateForPossibleValue(valueState, values[valueIndex]) || this.stateChanged;
						//debugFramework.showMessage("excluded value");
					}
				}

				// Remove any values not in the group from the group cells
				for ( var cellIndex = 0; cellIndex < groupPositions.length; cellIndex++ ) {
					//debugFramework.showMessage("cfgbr group cell index is " + cellIndex + " pos " + positions[cellIndex], "append");
					var cell = this.getCell(groupPositions[cellIndex]);
					var possibleValues = cell.getPossibleValues();
					for ( var valueIndex = 0; valueIndex < possibleValues.length; valueIndex++ ) {
						if ( ! group.hasValue( possibleValues[valueIndex] ) ) {
							debugFramework.showMessage("ignoring value " + valueIndex, "append");
							//cell.excludePossibleValue(possibleValues[valueIndex]);
							this.stateChanged = cell.setStateForPossibleValue( valueState, possibleValues[valueIndex])|| this.stateChanged;
							//debugFramework.showMessage("set css state for row group");
						}
					}
				}
				//debugFramework.restoreDebug(oldDebugState);
			}
			return cellSet.groups;
		}

		sudokuPuzzle.prototype.checkForGroupsByRow = function ( groupsAction ) {
			var groups = new Array();
			//debugFramework.showMessage("cfgbr checking action " + groupsAction);
			for (var blockRow=sudokuStatic.firstBlockRow; blockRow <= sudokuStatic.lastBlockRow; blockRow++) {
				for (var cellRow=sudokuStatic.firstCellRow; cellRow <= sudokuStatic.lastCellRow; cellRow++) {
					//debugFramework.showMessage("cfgbr unit block " + blockRow + " cell " + cellRow);
					//var rowPosition = new Position_1d(1, 2);
					var rowPosition = new Position_1d(blockRow, cellRow);
					groups = groups.concat( this.checkForGroupsByUnit( this.getRowCells( rowPosition ), "rowgroup", groupsAction ) );
				}
			}

			return groups;
		}

		sudokuPuzzle.prototype.checkForGroupsByColumn = function ( groupsAction ) {
			var groups = new Array();
			//debugFramework.showMessage("cfgbc checking action " + groupsAction);
			for (var blockColumn=sudokuStatic.firstBlockColumn; blockColumn <= sudokuStatic.lastBlockColumn; blockColumn++) {
				for (var cellColumn=sudokuStatic.firstCellColumn; cellColumn <= sudokuStatic.lastCellColumn; cellColumn++) {
					//debugFramework.showMessage("cfgbc unit block " + blockColumn + " cell " + cellColumn);
					//debugFramework.showMessage("cfgbc unit block 3 cell 2");
					//var columnPosition = new Position_1d(3, 2);
					var columnPosition = new Position_1d(blockColumn, cellColumn);
					groups = groups.concat( this.checkForGroupsByUnit( this.getColumnCells( columnPosition ), "columngroup", groupsAction ) );
				}
			}

			return groups;
		}

		sudokuPuzzle.prototype.checkForGroupsByBlock = function ( groupsAction ) {
			var groups = new Array();
			//debugFramework.showMessage("cfgbb checking action " + groupsAction);
			for (var blockRow=sudokuStatic.firstBlockRow; blockRow <= sudokuStatic.lastBlockRow; blockRow++) {
				for (var blockColumn=sudokuStatic.firstBlockColumn; blockColumn <= sudokuStatic.lastBlockColumn; blockColumn++) {
					//debugFramework.showMessage("cfgbb unit row " + blockRow + " col " + blockColumn);
					var blockPosition = new Position(blockRow, blockColumn);
					groups = groups.concat( this.checkForGroupsByUnit( this.getBlockCells( blockPosition ), "blockgroup", groupsAction ) );
				}
			}

			return groups;
		}

		this.init();

	}
