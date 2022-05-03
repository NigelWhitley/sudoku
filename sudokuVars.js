/* 
Sudoku Aid v0.2 by Nigel Whitley (c) Copyright 2005-2014
 */
	// Define "namespaces" for values which are global to the program.
	// Those which are not expected to change are under sudokuStatic and are 
	// typically parameters.
	// Those which could change or are defined dynamically are under sudokuGlobals.

	sudokuStatic = {};
	sudokuStatic.maxValue = 9;
	sudokuStatic.longPuzzleDimension = 3;

	sudokuStatic.setDimensions = function() {
		sudokuStatic.shortPuzzleDimension = sudokuStatic.maxValue / sudokuStatic.longPuzzleDimension;

		sudokuStatic.blocksWide = sudokuStatic.shortPuzzleDimension;
		sudokuStatic.blocksHigh = sudokuStatic.longPuzzleDimension;
		sudokuStatic.cellsWide = sudokuStatic.longPuzzleDimension;
		sudokuStatic.cellsHigh = sudokuStatic.shortPuzzleDimension;
		sudokuStatic.possWide = sudokuStatic.longPuzzleDimension;
		sudokuStatic.possHigh = sudokuStatic.shortPuzzleDimension;

		sudokuStatic.firstBlockRow = 1;
		sudokuStatic.lastBlockRow = ( sudokuStatic.blocksHigh + 1 ) - sudokuStatic.firstBlockRow;
		sudokuStatic.firstBlockColumn = 1;
		sudokuStatic.lastBlockColumn = ( sudokuStatic.blocksWide + 1 ) - sudokuStatic.firstBlockColumn;

		sudokuStatic.firstCellRow = 1;
		sudokuStatic.lastCellRow = ( sudokuStatic.cellsHigh + 1 ) - sudokuStatic.firstBlockRow;
		sudokuStatic.firstCellColumn = 1;
		sudokuStatic.lastCellColumn = ( sudokuStatic.cellsWide + 1 ) - sudokuStatic.firstBlockColumn;

		sudokuStatic.firstPossRow = 1;
		sudokuStatic.lastPossRow = ( sudokuStatic.possHigh + 1 ) - sudokuStatic.firstBlockRow;
		sudokuStatic.firstPossColumn = 1;
		sudokuStatic.lastPossColumn = ( sudokuStatic.possWide + 1 ) - sudokuStatic.firstBlockColumn;
	}
	sudokuStatic.setDimensions();
	sudokuStatic.valueSeparator = new String(':');
	sudokuStatic.valueSeparatorLength = sudokuStatic.valueSeparator.length;

	sudokuGlobal = {};
	sudokuGlobal.blocks = createArray(sudokuStatic.lastBlockRow, sudokuStatic.lastBlockColumn);
	sudokuGlobal.currentValues = new Array(sudokuStatic.maxValue);
	sudokuGlobal.possibleValues = new Array();
	sudokuGlobal.undoList = new Array();
	sudokuGlobal.undoCount = 0;
    
