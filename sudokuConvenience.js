/* 
Sudoku Aid v0.2 by Nigel Whitley (c) Copyright 2005-2014
 */
	function addEvent(element, eventType, eventFunction, useCapture)
	{
		// Add an event to an element : cross-browser
		if (element === undefined) {
			alert("Cannot add event with no element specified");
		} else if (element.addEventListener){
			element.addEventListener(eventType, eventFunction, useCapture);
			return true;
		} else if (element.attachEvent){
			element.attachEvent("on"+eventType, function () {eventFunction.call(element, window.event)});
		} else {
			alert("Handler could not be added");
		}
	}

	function removeEvent(element, eventType, eventFunction, useCapture)
	{
		// Remove an event to an element : cross-browser
		if (element.removeEventListener){
			element.removeEventListener(eventType, eventFunction, useCapture);
			return true;
		} else if (element.detachEvent){
			var r = element.detachEvent("on"+eventType, eventFunction);
			return r;
		} else {
			alert("Handler could not be removed");
		}
	}


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


	function remove_children(main_element) {
		if ( ( main_element ) ) {
			for (var child_index=main_element.childNodes.length-1; child_index>=0; child_index--) {
				remove_children(main_element.childNodes[child_index]);
				main_element.removeChild(main_element.childNodes[child_index]);
			}
		}
	}

	// Set the current option in a select box using its value rather than an index.
	// Parameters
	// selectBox: This is the select box for which an option must be selected
	// value: This is the value which needs to be selected from the options of selectBox.
	function selectItemByValue(selectBox, value){

		for (var option=0; option < selectBox.options.length; option++)
		{
			if (selectBox.options[option].value == value) {
				selectBox.selectedIndex = option;
				break;
			}
		}
	}



	// This function allows creation of "multi-dimensional" arrays
	// and uses an effective base 1 instead of 0
	// e.g. createArray (10,20) will create an array of 10 21-element arrays
	//	and one empty element because Javascript arrays are zero-based.
	//      However, the zero element will be empty and therefore take no space.
	//	So arrays can be indexed like [1][2] or [10,20].
	function createArray(arrayEnd) {
		//var arr = new Array(arrayEnd || 0),
		//	i = arrayEnd;
		var arraySize = arrayEnd + 1;
		//make_debug("Make array length " + arraySize);
		var arr = new Array(arraySize || 0);

		if (arguments.length > 1) {
			//make_debug("Make arrays");
			var args = Array.prototype.slice.call(arguments, 1);
			var eachArray = 0;
			while (eachArray++ < arrayEnd) {
				//make_debug("Make inner array " + eachArray);
				arr[eachArray] = createArray.apply(this, args);
			}
		}

		return arr;
	}
