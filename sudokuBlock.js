/* 
Sudoku Aid v0.2 by Nigel Whitley (c) Copyright 2005-2014
 */
	/*
	This is the object/code for managing a "block" in the puzzle. The data structure 
	mimics the visual layout where a block made up of a rectangular set of "cells".
	A block has one cell for each value (as required by the puzzle rules) and the 
	puzzle has one block per value.
	There are helper functions for accessing rows and columns of cells within the block.
	*/

	function sudokuBlock(parentElement, blockPosition) {

		// The block is one of the restrictive elements in a Sudoku puzzle.
		// We need to show this as a visual element and consider it in any
		// solution evaluation.
		// Although normally we want to separate form from function, I have combined 
		// them in this object. My justification is that the logical (function) aspect
		// is essentially an expression of the visual layout: any fundamental change
		// to the display side would have a major effect on the logical processing 
		// hence voiding the major reason for keeping them separate.
		// Further, the display processing is primarily in the setup after which the 
		// visual changes are at cell rather than block level. The display 
		// processing can be isolated within the object to just the init() function.

		//this.puzzle = puzzle;
		this.parentElement = parentElement;
		this.position = blockPosition;

		this.cells = createArray(sudokuStatic.lastCellRow, sudokuStatic.lastCellColumn);

		sudokuBlock.prototype.getCell = function (cellPosition) {
			return this.cells[cellPosition.row][cellPosition.column];
		}

		sudokuBlock.prototype.isFixedValue = function (cellPosition) {
			return this.getCell(cellPosition).isFixedValue();
		}

		sudokuBlock.prototype.getRowCells = function (row) {
			var cells = new Array();
			for (var column = sudokuStatic.firstCellColumn; column <=sudokuStatic.lastCellColumn; column++) {
				//debugFramework.showMessage("block getRowCells block " + this.position + " pos " + row + " column " + column);
				cells.push( new PuzzlePosition( this.position, new Position(row, column) ) );
			}
			//debugFramework.showMessage("block getRowCells end row " + row + " length " + cells.length + " cells[0] " + cells[0], "append");
			return cells;
		}

		sudokuBlock.prototype.getCellRow = function (cellPosition) {
			return this.getRowCells(cellPosition.row);
		}

		sudokuBlock.prototype.getPuzzleRow = function (puzzlePosition) {
			if (this.block.isSameAs(puzzlePosition.block)) {
				return this.getRowCells(puzzlePosition.cell.row);
			} else {
				return undefined;
			}
		}

		sudokuBlock.prototype.getColumnCells = function (column) {
			var cells = new Array();
			for (var row = sudokuStatic.firstCellRow; row <=sudokuStatic.lastCellRow; row++) {
				cells.push( new PuzzlePosition( this.position, new Position(row, column) ) );
			}
			return cells;
		}

		sudokuBlock.prototype.getCellColumn = function (cellPosition) {
			return this.getColumnCells(cellPosition.column);
		}

		sudokuBlock.prototype.getPuzzleColumn = function (puzzlePosition) {
			if (this.block.isSameAs(puzzlePosition.block)) {
				return this.getColumnCells(puzzlePosition.cell.column);
			} else {
				return undefined;
			}
		}

		sudokuBlock.prototype.getBlockCells = function () {
			var cells = new Array(sudokuStatic.cellsWide * sudokuStatic.cellsHigh);
			cell_index = 0;
			for (var row = sudokuStatic.firstCellRow; row <=sudokuStatic.lastCellRow; row++) {
				for (var column = sudokuStatic.firstCellColumn; column <=sudokuStatic.lastCellColumn; column++) {
					cells[cell_index++] = new PuzzlePosition( this.position, new Position(row, column));
				}
			}
			return cells;
		}

		sudokuBlock.prototype.getPuzzleBlock = function (puzzlePosition) {
			if (this.block.isSameAs(puzzlePosition.block)) {
				return this.getBlockCells();
			} else {
				return undefined;
			}
		}

		sudokuBlock.prototype.showCells = function () {
			for (var row = sudokuStatic.firstCellRow; row <=sudokuStatic.lastCellRow; row++) {
				for (var column = sudokuStatic.firstCellColumn; column <=sudokuStatic.lastCellColumn; column++) {
					let cell = this.getCell(new Position(row, column));
					cell.showCell();
				}
			}
		}

		sudokuBlock.prototype.resetPossibleValues = function ( ) {
			for (var cellRow=sudokuStatic.firstCellRow; cellRow <= sudokuStatic.lastCellRow; cellRow++) {
				for (var cellColumn=sudokuStatic.firstCellColumn; cellColumn <= sudokuStatic.lastCellColumn; cellColumn++) {
					this.getCell(new Position(cellRow, cellColumn)).resetPossibleValues();
				}
			}
		}

		sudokuBlock.prototype.clear = function ( ) {
			for (var cellRow=sudokuStatic.firstCellRow; cellRow <= sudokuStatic.lastCellRow; cellRow++) {
				for (var cellColumn=sudokuStatic.firstCellColumn; cellColumn <= sudokuStatic.lastCellColumn; cellColumn++) {
					this.getCell(new Position(cellRow, cellColumn)).clear();
				}
			}
		}

		sudokuBlock.prototype.init = function () {
			// To keep things neat, the block is presented as a <TABLE>
			// where each of the cells is a <TD>.
			var blockTable = document.createElement("TABLE");
			for( var row=sudokuStatic.firstCellRow; row <= sudokuStatic.lastCellRow; row++) {
				var blockRow=document.createElement("TR");

				for (var column=sudokuStatic.firstCellColumn; column <= sudokuStatic.lastCellColumn; column++) {
					var currentCell=document.createElement("TD");

					currentCell.name = "cell"+row+"_"+column;
					currentCell.className ="puzzleCell";
					var cellPosition = new Position(row, column);
					var cell = new sudokuCell(this, currentCell, cellPosition);
					// This assignment needs to match the getCell function
					this.cells[row][column] = cell;
					blockRow.appendChild(currentCell);
				}
				blockTable.appendChild(blockRow);
			}
			parentElement.appendChild(blockTable);
		}

		sudokuBlock.prototype.buildFixedValuesInRow = function ( rowPosition ) {
			var fixedValues = createArray(sudokuStatic.maxValue);
			var cellRow = rowPosition.cell;
			for (column=sudokuStatic.firstCellColumn; column <= sudokuStatic.lastCellColumn; column++) {
				var cellValue = this.getCell(new Position(cellRow, column)).currentValue;
				if ( cellValue != 0 ) {
					fixedValues[cellValue] = new PuzzlePosition(this.position, new Position(cellRow, column));
				}
			}
			return fixedValues;
		}

		sudokuBlock.prototype.buildFixedValuesInColumn = function ( columnPosition ) {
			var fixedValues = createArray(sudokuStatic.maxValue);
			var cellColumn = columnPosition.cell;
			for (row=sudokuStatic.firstCellRow ; row <= sudokuStatic.lastCellRow; row++) {
				var cellValue = this.getCell(new Position(row, cellColumn)).currentValue;
				if ( cellValue != 0 ) {
					fixedValues[cellValue] = new PuzzlePosition(this.position, new Position(row, cellColumn));
				}
			}
			return fixedValues;
		}

		sudokuBlock.prototype.buildFixedValuesInBlock = function () {
			this.fixedValues = createArray(sudokuStatic.maxValue);
			//var fixedValues = createArray(this.maxValue);
			//var cellColumn = rowPosition.cellPosition;
			for (row=sudokuStatic.firstCellRow; row <= sudokuStatic.lastCellRow; row++) {
				for (column=sudokuStatic.firstCellColumn; column <= sudokuStatic.lastCellColumn; column++) {
					var cellValue = this.getCell(new Position(row, column)).currentValue;
					if ( cellValue != 0 ) {
						this.fixedValues[cellValue] = new PuzzlePosition(this.position, new Position(row, column));
					}
				}
			}
			return this.fixedValues;
		}

		sudokuBlock.prototype.addFixedValueInBlock = function (fixedValue, puzzlePosition) {
			this.fixedValues[fixedValue] = puzzlePosition;
			return this.fixedValues;
		}

		//debugFramework.showMessage("Sudoku Aid block init code");
		//debugFramework.showMessage("Sudoku Aid block coord " + this.position.row + ", " + this.position.column);
		this.init();
	}
