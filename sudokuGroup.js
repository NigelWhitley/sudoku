/* 
Sudoku Aid v0.2 by Nigel Whitley (c) Copyright 2005-2014
 */
/*
This file holds objects to simplify creating and managing a group of possible 
values and their possible positions. 
The use case here is for such situations as the "naked twins" when there are only the 
same two possible values in two cells in the same unit (row, column or block). In such
a scenario, even though we could not yet determine which value goes where, we could safely 
assert that those values are not possible in any other cells in that unit. 
For example, if the values 2 and 4 are the only values in the top cell of a column and
the same two values are the only ones in another cell in the same column, we know that
2 and 4 can be excluded as possibilities from all the other cells in the column.
The same applies to groups of three, four or more values when they are the only values 
in a group of cells within the unit. Note that the number of possible values and the 
number of possible cells must match since in the eventual solution there must be 
exactly one value for each cell.
The other related pattern is where a group of possible values occur in only an equal  
number of possible cells within a unit. In that scenario we can remove all other 
possible values from those cells.
Consider a row which has 7 cells where the value has not been fixed. The values 6 and 7 
are possible in only two of the cells, where one of the cells also contains the value 5 
and the other also contains the values 3 and 9. (So possible values are [5,6,7] in one 
cell and [3,6,7,9] in the second.) Since 6 and 7 must go in those two cells we can 
confidently exclude the other possible values (the 5 in one and the 3 and 9 in the other).
We will distinguish beween the two by calling the first "naked" groups and the second 
"covered" groups.
It may be helpful to note the similarity between this and the search for "single" values.
A "single" is essentially a group with a size of 1. (One possible value and one possible 
position.) If it is the only value in a cell it can be removed from the other cells in the 
unit. If a value can be in only one position in a unit then all other values can be 
excluded from consideration for that position.
*/

	function sudokuGroup() {
	// Define a group of possible values in the Sudoku square

		sudokuGroup.prototype.init = function () {
			// The list of values will be kept as a String, to simplify searching
			// The list of positions will be an array as we will normally be iterating
			// over that.
			this.valueCount = 0;
			// To make searching simpler, a value should always be sandwiched 
			// between valueSeparators. To facilitate this, the values String 
			// initially holds a valueSeparator. We will then need to only 
			// consistently add or remove the value and a pairing separator 
			// each time. 
			this.values = new String(sudokuStatic.valueSeparator);
			this.positions = new Array();
		}

		// Wrapper to hide the underlying implementation of the count.
		sudokuGroup.prototype.getPositionCount = function () {
			return this.positions.length;
		}

		// Wrapper to hide the underlying implementation of the count.
		sudokuGroup.prototype.getValueCount = function () {
			return this.valueCount;
		}

		// Wrapper to hide the underlying implementation of the values.
		sudokuGroup.prototype.getValuesAsArray = function () {
			var valuesAsArray = new Array();
			//debugFramework.showMessage2("group values orig " + this.values + "#");
			var values = new String( this.values.substr( sudokuStatic.valueSeparatorLength ) );
			while ( values.length > 0 ) {
				//debugFramework.showMessage2("group values " + values + "#", "append");
				var valueIndex = values.indexOf(sudokuStatic.valueSeparator);
				var value = values.substr(0, valueIndex);
				valuesAsArray.push(parseInt(value));
				values = values.substr( valueIndex + sudokuStatic.valueSeparatorLength );
			}
			return valuesAsArray;
		}

		// Wrapper to hide the underlying implementation of the positions.
		sudokuGroup.prototype.getPositionsAsArray = function () {
			//var positions = new Array();
			//for ( var cellIndex = 0; cellIndex < this.positions; cellIndex++ ) {
			//	positions.push( this.positions[cellIndex] );
			//}
			//return positions;
			return this.positions.slice(0);
		}

		// A group is established when the number of values it contains matches the 
		// number of positions.
		sudokuGroup.prototype.countsMatch = function () {
			if ( ( this.getValueCount() !== 0 ) && ( this.getPositionCount() !== 0 ) ) {
				return ( this.getValueCount() === this.getPositionCount() );
			} else {
				return false;
			}
		}

		// Find the specified value in the list.
		// Typically this will be needed when removing a value or by hasValue
		// when determining whether to add or remove a value.
		// Search the string of values for the value between valueSeparators.
		// Using a pair of separators allows to reliably distinguish between
		// values which could have multiple digits e.g. between 5, 25, 54.
		// Note that, when found, the index is of the first separator, not 
		// the value itself.
		sudokuGroup.prototype.findValue = function (searchValue) {
			return this.values.indexOf(sudokuStatic.valueSeparator + searchValue + sudokuStatic.valueSeparator);
		}

		// Does the group already contain the specified value?
		// We must search the string of values to determine the answer.
		// For consistent results we search for the value between 
		// valueSeparators.
		sudokuGroup.prototype.hasValue = function (searchValue) {
			return ( ! ( this.findValue(searchValue) === -1 ) );
		}

		// Add an array of values to the string of values if not already present.
		// Returns true if a value is added, false otherwise.
		sudokuGroup.prototype.addValues = function (values) {
			var added = false;
			//debugFramework.showMessage2("Group addvalues " + values);
			for (var eachValue=0 ; eachValue < values.length; eachValue++ ) {
				//debugFramework.showMessage2("Group addvalues " + values[eachValue], "append");
				if ( this.addValue( values[eachValue] ) ) {
					added = true;
				}
			}
			return true;
		}

		// Add a value to the string of values if it is not already present.
		// Returns true if a value is added, false otherwise.
		sudokuGroup.prototype.addValue = function (value) {
			if ( this.hasValue(value) ) {
				return false;
			} else {
				this.values = this.values + value + sudokuStatic.valueSeparator;
				this.valueCount++;
				//debugFramework.showMessage2("Group addvalue " + value + " count " + this.valueCount + " values " + this.values, "append");
				return true;
			}
		}

		// Remove a value from the string of values if it is already present.
		// Returns true if a value is removed, false otherwise.
		sudokuGroup.prototype.removeValue = function (value) {
			if ( this.hasValue(value) ) {
				return false;
			} else {
				this.values = this.values.replace(sudokuStatic.valueSeparator + value + sudokuStatic.valueSeparator, sudokuStatic.valueSeparator);
				this.valueCount--;
				return true;
			}
		}

		// Search for position in the list of positions.
		// Returns the array index if found and -1 otherwise
		sudokuGroup.prototype.findPosition = function (position) {
			// Must loop through positions until a match is found or end reached
			for ( var positionIndex=0; positionIndex < this.getPositionCount; positionIndex++ ) {
				if ( position.isSameAs(this.positions[positionIndex] ) ) {
					return positionIndex;
				}
			}
			return -1;
		}

		// Add a position to the list of positions if it is not already present.
		// Returns true if a position is added, false otherwise.
		sudokuGroup.prototype.hasPosition = function (position) {
			// Must loop through positions until a match is found or end reached
			return ( this.findPosition(position) !== -1 );
		}

		// Add a position to the list of positions if it is not already present.
		// Returns true if a position is added, false otherwise.
		sudokuGroup.prototype.addPosition = function (position) {
			if ( this.hasPosition(position) ) {
				return false;
			} else {
				this.positions.push(position);
				return true;
			}
		}

		// Add a list of positions to the list of positions if it is not already present.
		// Returns true if a position is added, false otherwise.
		sudokuGroup.prototype.addPositions = function (positions) {
			for ( var positionIndex = 0; positionIndex < positions.length; positionIndex++ ) {
				var position = positions[positionIndex];
				var positionAdded = false;
				if ( ! this.hasPosition(position) ) {
					this.positions.push(position);
					positionAdded = true;
				}
			}
		}

		// Remove a position from the list of positions if it is already present.
		// Returns true if a position is removed, false otherwise.
		sudokuGroup.prototype.removePosition = function (position) {
			if ( this.hasPosition(position) ) {
				return false;
			} else {
				this.positions.splice( this.findPosition(position), 1 );
				return true;
			}
		}

		sudokuGroup.prototype.toString = function () {
			var regExp = new RegExp(sudokuStatic.valueSeparator, "g");
			return this.values.substr(sudokuStatic.valueSeparatorLength).replace(regExp, ",");
		}

		this.init();
	}


