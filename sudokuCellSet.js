/* 
Sudoku Aid v0.1 by Nigel Whitley (c) Copyright 27/05/2005
 */
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

		// build the workingSet of the possible values for each (unfixed) cell position
		sudokuCellSet.prototype.buildListForNakedSearch = function () {
			for ( var cellIndex = 0; cellIndex < this.possibleSet.length; cellIndex++ ) {
				var cellPos = this.possibleSet[cellIndex];
				var cell = sudokuGlobal.puzzle.getCell(this.possibleSet[cellIndex]);
				// Ignore any cell which has a fixed value
				if ( ! cell.isFixedValue() ) {
                    // Make a copy of the values in the cell
					var values = cell.getPossibleValues().slice();
					this.workingSet.push({
						position: this.possibleSet[cellIndex],
                        valueCount: values.length,
						values: values
						});
					//debugFramework.showMessage2("CellSet init values " + this.workingSet[this.workingSet.length-1].values.length + " pos " + this.workingSet[this.workingSet.length-1].position + " values " + values.length, "append");
				}
			}
			
		}

		// sort the workingSet based on the number of possible values
		sudokuCellSet.prototype.sortListForNakedSearch = function () {
            // Sort the working set into ascending order i.e. cells with fewest values are first
			this.workingSet.sort( function( aCell, otherCell ) {
				return aCell.count - otherCell.count
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

