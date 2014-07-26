/* 
Sudoku Aid v0.2 by Nigel Whitley (c) Copyright 2005-2014
 */
	/*
	This is the object/code for generating and managing controls for the puzzle. 
	The only controls at present are a select box for the offered level of aid 
	and an "undo" to allow the user to backtrack.
	Since it must interact with the puzzle object itself, some of the elements
	are made available directly though the sudokuGlobal namespace.
	*/

	function sudokuControls() {

		var controlsForm;
		var undoButton;
		//var undoInfo = new Array();
		//var undoCount = 0;

		sudokuStatic.aidLevels = [["Basic","basic"], ["Auto","auto"], ["Show Groups","showgrp"], ["Filter Groups","filgrp"], ["Show Pins","showpin"], ["Filter Pins","filpin"]];

		sudokuControls.prototype.init = function () {
			// Sudoku puzzle is built as nested tables (sacrilege I know).
			// This could be done with nested divs, but the layout of the puzzle is
			// integral to the design of the code so form and function 
			// are far more intertwined than most applications.
			//this.controlsSection = document.getElementById("controls_section");
			remove_children(sudokuGlobal.controlsSection);
			this.buildControls();
		}

		sudokuControls.prototype.buildControls = function () {
			controlsForm = document.createElement("form");
			sudokuGlobal.controlsSection.appendChild(controlsForm);
			this.buildUndoButton();
			this.buildAidLevel();
		}

		sudokuControls.prototype.buildUndoButton = function () {
			undoButton = document.createElement("input");

			undoButton.setAttribute("type","button");
			undoButton.setAttribute("name","undoButton");
			undoButton.setAttribute("value","Undo");

			//this.loadUndoFixValue(undoButton);
			var that = this; 
			var loadfunc=function(e) {
				that.undo(this, e); // pass-through the event object
			}; 
			addEvent(undoButton, "click", loadfunc, false);
			undoButton.className = "hide";
			controlsForm.appendChild(undoButton);
		}

		sudokuControls.prototype.buildAidLevel = function () {
			sudokuGlobal.aidLevel = document.createElement("select");

			sudokuGlobal.aidLevel.setAttribute("name","aidLevel");

			for (var levelIndex = 0; levelIndex < sudokuStatic.aidLevels.length; levelIndex++) {
				var aidLevelOption = document.createElement("option");
				//debugFramework.showMessage("level index " + levelIndex);
				//debugFramework.showMessage("text " + this.aidLevels[levelIndex][0]);
				aidLevelOption.value = sudokuStatic.aidLevels[levelIndex][1];
				var aidLevelOptionText = document.createTextNode(sudokuStatic.aidLevels[levelIndex][0]);
				aidLevelOption.appendChild(aidLevelOptionText);
				sudokuGlobal.aidLevel.appendChild(aidLevelOption);
			}
			sudokuGlobal.currentAidLevel = 1;
			sudokuGlobal.aidLevel.selectedIndex = sudokuGlobal.currentAidLevel;

			var that = this; 
			var levelChange=function(e) {
				sudokuGlobal.controls.storeUndo("SetAidLevel", sudokuGlobal.currentAidLevel);
				that.aidLevelChanged(); // ensure context is this object
			}; 
			addEvent(sudokuGlobal.aidLevel, "change", levelChange, false);
			//this.aidLevel.className = "hide";
			controlsForm.appendChild(sudokuGlobal.aidLevel);
		}

		sudokuControls.prototype.aidLevelChanged = function () {
			var changedLevel = sudokuGlobal.aidLevel.value;
			//debugFramework.showMessage("Level was " + sudokuGlobal.currentAidLevel + " now " + changedLevel);
			//sudokuStatic.aidLevels = [["Basic","basic"], ["Auto","auto"], ["Show Groups","showgrp"], ["Filter Groups","filgrp"], ["Show Pins","showpin"], ["Filter Pins","filpin"]];
			//var oldDebugState = debugFramework.enableDebug();
			for ( var checkLevel = 0; checkLevel < sudokuStatic.aidLevels.length; checkLevel++ ) {
				if ( changedLevel === sudokuStatic.aidLevels[checkLevel][1] ) {
					//var oldDebugState = debugFramework.enableDebug();
					//debugFramework.showMessage("Level was " + sudokuGlobal.currentAidLevel + " now " + checkLevel);
					sudokuGlobal.currentAidLevel = checkLevel;
					//debugFramework.restoreDebug(oldDebugState);
					break;
				}
			}
			//debugFramework.restoreDebug(oldDebugState);

			sudokuGlobal.puzzle.provideAid();
			
		}

		sudokuControls.prototype.storeUndo = function (undoAction, undoData) {
			sudokuGlobal.undoList[sudokuGlobal.undoCount++] = [undoAction, undoData];
			undoButton.className = "";
		}

		sudokuControls.prototype.undo = function () {
		// Undo an action - this will be either a FixValue or change of Aid Level
			var undoInfo = sudokuGlobal.undoList[--sudokuGlobal.undoCount];
			var undoAction = undoInfo[0];
			var undoData = undoInfo[1];
			if (sudokuGlobal.undoCount == 0) {
				undoButton.className = "hide";
			}
			
			sudokuGlobal.puzzle.undo(undoAction, undoData);

			//var undoCell = this.blocks[blockRow][blockColumn].cells[cellRow][cellColumn];
			//var undoValue = undoCell.currentValue;

		}

		this.init();

	}
