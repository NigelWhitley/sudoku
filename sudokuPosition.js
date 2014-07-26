/* 
Sudoku Aid v0.2 by Nigel Whitley (c) Copyright 2005-2014
 */
/*
This file holds objects to simplify manipulation of positions within the puzzle 
and a value associated with it.
*/

	function Position(aRow, aColumn)
	// Define a coordinate in the Sudoku square
	{
		this.row = aRow;
		this.column = aColumn;

		Position.prototype.isSameRowAs = function (otherPosition) {
			return this.row == otherPosition.row;
		}

		Position.prototype.isSameColumnAs = function (otherPosition) {
			return this.column == otherPosition.column;
		}

		Position.prototype.isSameAs = function (otherPosition) {
			return (this.isSameRowAs(otherPosition) && this.isSameColumnAs(otherPosition));
		}

		Position.prototype.toString = function () {
			return this.row + ":" + this.column;
		}
	}

	function Position_1d(aBlock, aCell)
	// Define a coordinate in the Sudoku square
	{
		this.block = aBlock;
		this.cell = aCell;

		Position_1d.prototype.isSameBlockAs = function (otherPosition) {
			return this.block == otherPosition.block;
		}

		Position_1d.prototype.isSameCellAs = function (otherPosition) {
			return this.cell == otherPosition.cell;
		}

		Position.prototype.isSameAs = function (otherPosition) {
			return (this.isSameBlockAs(otherPosition) && this.isSameCellAs(otherPosition));
		}

		Position_1d.prototype.toString = function () {
			return this.block + ":" + this.cell;
		}
	}

	function PuzzlePosition(aBlockPosition, aCellPosition)
	// Define a (cell) position in the Sudoku puzzle using both block and cell coordinates
	{
		this.block = new Position(aBlockPosition.row, aBlockPosition.column);
		this.cell = new Position(aCellPosition.row, aCellPosition.column);

		PuzzlePosition.prototype.isSameRowAs = function (otherPosition) {
			return this.block.isSameRowAs(otherPosition.block) && this.cell.isSameRowAs(otherPosition.cell);
		}

		PuzzlePosition.prototype.isSameColumnAs = function (otherPosition) {
			return this.block.isSameColumnAs(otherPosition.block) && this.cell.isSameColumnAs(otherPosition.cell);
		}

		PuzzlePosition.prototype.isSameBlockAs = function (otherPosition) {
			return this.block.isSameRowAs(otherPosition.block) && this.block.isSameColumnAs(otherPosition.block);
		}

		PuzzlePosition.prototype.isSameCellAs = function (otherPosition) {
			return this.cell.isSameRowAs(otherPosition.cell) && this.cell.isSameColumnAs(otherPosition.cell);
		}

		PuzzlePosition.prototype.isSameAs = function (otherPosition) {
			return this.isSameBlockAs(otherPosition) && this.isSameCellAs(otherPosition);
		}

		PuzzlePosition.prototype.toString = function () {
			return this.block + ":" + this.cell;
		}
	}

	function CellValue(aCellPosition, aValue)
	// Get the value of a Sudoku cell
	{
		this.value = aValue;
		this.cell = new Position(aCellPosition.row, aCellPosition.column);

		CellValue.prototype.toString = function () {
			return this.cell + "=" + this.value;
		}
	}

	function PuzzleValue(aPuzzlePosition, aValue)
	// Set a value in a Sudoku cell
	{
		this.value = aValue;
		this.puzzlePosition = new PuzzlePosition(aPuzzlePosition.block, aPuzzlePosition.cell);

		PuzzleValue.prototype.toString = function () {
			return this.puzzlePosition + "=" + this.value;
		}
	}
