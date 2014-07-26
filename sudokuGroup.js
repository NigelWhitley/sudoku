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

	function sudokuCellSet(originalCells) {
	// When looking for groups we will start with all cells in a unit (a block, row or 
	// column) then remove any fixed values. There are two types of group which we will 
	// term "naked" and "covered". "Naked" groups consist of cells which contain only
	// the values in group. "Covered" groups consist of cells which also contain 
	// possible values other than those in the group : they constrained by the 
	// number of possible positions for the values in the group.
	
	// It is worth pointing out that if the set of cells contains one group, it must 
	// contain at least one other. To explain, if there are seven cells remaining and 
	// three of those form a group for three values then the other four cells must hold 
	// the other four values. On further inspection it may be that those four can be 
	// divided into more than one group, perhaps a group a 3 and a single, but if not
	// it will be a group of four. For this reason, we use the cell set to iteratively
	// process the remaining cells in the set until all groups have been found (which 
	// may be none).

	// Another aspect of identifying groups is that all the values do not need to be 
	// in all of the cells. Indeed, when looking for groups it is quite common to 
	// find a group of 3 where the cells contain the three possible pairs of values 
	// e.g. a group of (4 ,6, 9) where one cell contains (4, 6), a second (4, 9) and 
	// the other (6, 9).

	// Finding groups will be an iterative process and may be quite compute-intensive. 
	// My approach is to look for "naked" groups first, then search for "covered" groups 
	// in any remaining cells.
	
	// For the "naked" groups we generate a list sorted by number of possible 
	// values per cell. For the "covered" groups we want a list of values sorted by 
	// the number of possible positions.
	// The sorting is just to try to find smaller groups first.

	// The specifics of finding each groups can be found in the relevant methods -
	// buildNakedGroup and buildCoveredGroup.

	// originalCells is an array of puzzle positions, typically the cells for 
	// a unit (block, row or column)
		sudokuCellSet.prototype.init = function (originalCells) {
			this.groups = new Array(); //keeps track of groups as we find them
			this.possibleSet = sudokuCellSet.withoutFixedValues(originalCells);
			this.workingSet = new Array();
			//debugFramework.showMessage("CellSet init");
			// Only add a cell to the workingSet if it has no fixed value
			this.buildListForNakedSearch();
			if ( this.workingSet.length > 0 ) {
				this.sortListForNakedSearch();
				this.buildNakedGroups();
				//debugFramework.showMessage("calling bCG");
			}
		}

		// remove the value from the specified cell in the workingSet
		sudokuCellSet.prototype.removeValue = function (cellIndex, value) {
			var values = this.workingSet[cellIndex].values;
			for ( var valueIndex = 0; valueIndex < values.length; valueIndex++ ) {
				if ( values[valueIndex] === value ) {
					this.workingSet[cellIndex].values.splice(valueIndex, 1);
					break;
				}
			}
			
		}

		// remove the value from each cell in the workingSet
		sudokuCellSet.prototype.removeValueFromWorkingSet = function (value) {
			for ( var cellIndex = 0; cellIndex < this.workingSet.length; cellIndex++ ) {
				this.removeValue(cellIndex, value);
			}
			
		}

		// Remove the position from the workingSet.
		// Since each element of the element of workingSet has a unique position, 
		// remove a position is the same as removing an element.
		sudokuCellSet.prototype.removePositionFromWorkingSet = function (position) {
			for ( var cellIndex = this.workingSet.length - 1; cellIndex >= 0; cellIndex-- ) {
				if ( position.isSameAs(this.workingSet[cellIndex].position ) ) {
					this.workingSet.splice(cellIndex, 1);
				}
			}
			
		}

		// sort the workingSet based on the number of possible values
		sudokuCellSet.prototype.buildListForNakedSearch = function () {
			for ( var cellIndex = 0; cellIndex < this.possibleSet.length; cellIndex++ ) {
				var cellPos = this.possibleSet[cellIndex];
				var cell = sudokuGlobal.puzzle.getCell(this.possibleSet[cellIndex]);
				// Ignore any cell which has a fixed value
				if ( ! cell.isFixedValue() ) {
					var values = cell.getPossibleValues().slice(0);
					this.workingSet.push({
						values: values,
						position: this.possibleSet[cellIndex]
						});
					//debugFramework.showMessage2("CellSet init values " + this.workingSet[this.workingSet.length-1].values.length + " pos " + this.workingSet[this.workingSet.length-1].position + " values " + values.length, "append");
				}
			}
			
		}

		// sort the workingSet based on the number of possible values
		sudokuCellSet.prototype.sortListForNakedSearch = function () {
			this.workingSet.sort( function( aCell, otherCell ) {
				return aCell.values.length - otherCell.values.length
			});
			
		}

		// Identifying a group requires defining stopping conditions. We need a 
		// stopping condition for when it succeeds and something for when it 
		// fails. 
		// Note that, for a valid solution, it is impossible for the number of 
		// values to be fewer than the number of positions because that would 
		// mean at least one of the cells must be empty. 
		// Our success condition should be simple - after adding a 
		// position and all its possible values to the potential group, it
		// is valid if the number of values and positions matches. 
		// Unfortunately, our success condition is also true for the entire 
		// working set so a good failure condition is that all values in the 
		// working set are used. We could use all positions instead but, since we 
		// know the number of positions must be no more than the number of values, 
		// the number of values will be met sooner or, at least, at the same time.
		sudokuCellSet.prototype.buildNakedGroups = function () {
			// The search process is iterative so we use a stack to keep 
			// track of the cell positions used. The stack only records the 
			// index in the workingSet.
			var buildStack = new Array();
			// We limit the size of groups to ensure we find the smallest 
			// groups. If we did not then, for example, a set of cells (4,6), 
			// (3,6) and (3,6) might be identified as a group of three cells 
			// rather than a group of two cells and a group containing a single cell 
			// (which must hold the value four once the possible values from the 
			// group of two have been excluded).
			// We gradually increase the limit until either it is the entire workingSet 
			// or a group is found.
			var initialGroupSizeLimit = 1;
			var groupSizeLimit = initialGroupSizeLimit;
			var sizeOfLargestGroup = 0;
			var workingGroup = new sudokuGroup();
			var workingIndex = 0;
			var groupFound = false;
			var buildComplete = false;
			do {
				//if (workingIndex < this.workingSet.length ) 
					//debugFramework.showMessage("bNG push  " + workingIndex, "append");
				buildStack.push(workingIndex);
				workingGroup.addValues(this.workingSet[workingIndex].values);
				workingGroup.addPosition(this.workingSet[workingIndex].position);
				//debugFramework.showMessage("bNG push  " + workingIndex + " values " + workingGroup.values, "append");
				// If we have used all values in the workingSet, then we cannot 
				// have found a naked group
				if ( ( workingGroup.countsMatch() ) && ( buildStack.length !== this.workingSet.length ) ) {
					// Group found and is formed as workingGroup.
					// The check against stack size is to ignore a "group" which is all 
					// of the remaining cells (because that doesn't help at all).
					// Need to remove from workingSet the elements with indexes in buildStack
					// Then need to remove any values in the new group from the remaining 
					// cells in the workingSet.
					//debugFramework.showMessage("bNG group found " + workingGroup.values, "append");
					var groupSize = workingGroup.getValueCount();
					if ( groupSize > sizeOfLargestGroup ) {
						sizeOfLargestGroup = groupSize;
					}
					this.groups.push(workingGroup);
					do {
						var removeIndex = buildStack.pop();
						this.workingSet.splice(removeIndex, 1);
					} while ( buildStack.length > 0 );
					var valuesAsArray = workingGroup.getValuesAsArray();
					for ( var valueIndex = 0; valueIndex < valuesAsArray.length; valueIndex++ ) {
						var removeValue = valuesAsArray[valueIndex];
						//debugFramework.showMessage("bNG group remove " + removeValue, "append");
						this.removeValueFromWorkingSet(removeValue);
					}
					workingGroup = new sudokuGroup();
					groupSizeLimit = initialGroupSizeLimit;
					workingIndex = 0;
				} else {
					workingIndex++;
					if ( ( workingGroup.valueCount === this.workingSet.length ) || 
						( workingGroup.valueCount > groupSizeLimit ) || 
						( workingIndex === this.workingSet.length ) ) {
						// We have used all values or have exhausted the workingSet with this combination, 
						// so no group found and we must try again with the next combination, if there is one. 
						// That can be generated by backtracking and moving to the next possible cell position.
						workingIndex = buildStack.pop();
						workingIndex++;
						if ( workingIndex === this.workingSet.length ) {
							if ( buildStack.length === 0 ) {
								if ( ( groupSizeLimit + 1) < this.workingSet.length ) {
									groupSizeLimit++;
									workingIndex = 0;
								} else {
									buildComplete = true;
								}
							} else {
								workingIndex = buildStack.pop();
								workingIndex++;
								//debugFramework.showMessage("bNG double pop " + workingIndex, "append");
							}
						}
						workingGroup = new sudokuGroup();
						//debugFramework.showMessage("bNG rebuilding " + workingIndex, "append");
						for ( var rebuildIndex = 0; rebuildIndex < buildStack.length; rebuildIndex++ ) {
							workingGroup.addValues(this.workingSet[rebuildIndex].values);
							workingGroup.addPosition(this.workingSet[rebuildIndex].position);
						}
						//debugFramework.showMessage("bNG all values " + workingIndex, "append");
					}
				}
			} while ( ! buildComplete );

			// Check whether the number of cells remaining in the working set 
			// is smaller than the largest group found. If so, create a group 
			// from the working set and use that in place of the largest group
			// This means that the smallest groups will always be returned. 
			//
			// We can also just do nothing if there have been no groups found.
			// We initialised the "largest size" variable to zero, because any 
			// working set must be larger than that. So, if no groups have been 
			// found, then the check for whether the size of the remaining set 
			// is smaller than the largest must be false.
			if ( this.workingSet.length < sizeOfLargestGroup ) {
				workingGroup = new sudokuGroup();
				//debugFramework.showMessage("bNG rebuilding " + workingIndex, "append");
				for ( var rebuildIndex = 0; rebuildIndex < this.workingSet.length; rebuildIndex++ ) {
					workingGroup.addValues(this.workingSet[rebuildIndex].values);
					workingGroup.addPosition(this.workingSet[rebuildIndex].position);
				}
				// Need to sort the groups into size order so we can 
				// replace the largest. If two are the same size, it 
				// doesn't matter which we replace.
				this.groups.sort(function (aGroup, otherGroup) {
					return aGroup.getValueCount - otherGroup.getValueCount;
				});
				this.groups[this.groups.length - 1] = workingGroup;
			}
		}

		this.init(originalCells);

	}

	// Some "static" functions for removing cells from a list of positions
	// These are useful outside this routine e.g. when dealing with the 
	// resulting groups. In each case the original list of positions is a
	// zero-based array of cell positions in the puzzle.
	sudokuCellSet.withoutFixedValues = function ( originalPositions ) {
		// We want to build a new array which excludes any cell with a
		// fixed value. Note that we don't change the original array.
		var remainingPositions = new Array();
		for ( var cellIndex = 0; cellIndex < originalPositions.length; cellIndex++ ) {
			var cellPos = originalPositions[cellIndex];
			var cell = sudokuGlobal.puzzle.getCell(cellPos);
			// Ignore any cell which has a fixed value
			if ( ! cell.isFixedValue() ) {
				remainingPositions.push(cellPos);
				//debugFramework.showMessage2("withoutFixedValues pushing " + cellPos);
			}
		}
		return remainingPositions;
	}

	sudokuCellSet.withoutGroup = function ( originalPositions, group ) {
		// We want to build a new array which excludes any cell in the 
		// group. Note that we don't change the original array.
		var groupPositions = group.getPositionAsArray();
		var remainingPositions = sudokuCellSet.withoutPositions ( originalPositions, groupPositions );
		return remainingPositions;
	}

	sudokuCellSet.withoutPositions = function ( originalPositions, removePositions ) {
		// We want to build a new array which excludes any cell in the 
		// second array of positions. Note that we don't change the 
		// original arrays.
		var remainingPositions = new Array();
		for ( var cellIndex = 0; cellIndex < originalPositions.length; cellIndex++ ) {
			var cellPos = originalPositions[cellIndex];
			var keepCell = true;
			for ( var removeIndex = 0; removeIndex < removePositions.length; removeIndex++ ) {
				var removePos = removePositions[removeIndex];
				if ( cellPos.isSameAs(removePos) ) {
					keepCell = false;
					//debugFramework.showMessage2("withoutPositions pushing " + cellPos);
				}
			}
			var cell = sudokuGlobal.puzzle.getCell(cellPos);
			// Ignore any cell which has a fixed value
			if ( keepCell ) {
				remainingPositions.push(cellPos);
				//debugFramework.showMessage2("withoutPositions pushing " + cellPos);
			}
		}
		return remainingPositions;
	}

