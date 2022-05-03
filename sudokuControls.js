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
		var loadButton;
		var saveButton;
		var undoButton;
		var redoButton;
		var fileSelector;
		var undoIndex = 0;
		var puzzleFile = 'sudoku.dat';
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
			this.buildLoadButton();
			this.buildSaveButton();
			this.buildUndoButton();
			this.buildRedoButton();
			this.buildAidLevel();
		}


		sudokuControls.prototype.buildButton = function (buttonName, buttonLabel, buttonAction, initialClass) {
			var button = document.createElement("input");

			button.setAttribute("type","button");
			button.setAttribute("name",buttonName);
			button.setAttribute("value",buttonLabel);

			//this.loadUndoFixValue(saveButton);
			var loadfunc=function(e) {
				buttonAction(this, e); // pass-through the event object
			}; 
			addEvent(button, "click", loadfunc, false);
			button.className = initialClass;
			controlsForm.appendChild(button);
			return button;
		}


		// We use the HTML5 file selector to load a puzzle file.
		// The approach is to have the selector hidden then, when the "Load" button is clicked, 
		// we simulate a click on it which brings up the file selector dialog.
		// If/when the user selects a file we need to respond to the "change" event for the selector.
		sudokuControls.prototype.buildLoadButton = function () {
			// Respond to a file selection
			fileSelector = $('#file-selector');
			var that = this;
			fileSelector.change( function() { that.loadFile() });

			// To show the file selector dialog when the "Load" button is clicked we simulate a click on the selector
			var fileClick = function () {
				fileSelector.click();
			}
			saveButton = this.buildButton("LoadButton", "Load", fileClick, "");
		}


		sudokuControls.prototype.buildSaveButton = function () {
			saveButton = this.buildButton("saveButton", "Save", this.saveFile, "hide");
		}


		sudokuControls.prototype.buildUndoButton = function () {
			undoButton = this.buildButton("undoButton", "Undo", this.undo, "hide");
		}


		sudokuControls.prototype.buildRedoButton = function () {
			var initClass = "";
			// We hide the redo button if the the undo list is empty
			if (sudokuGlobal.undoList.length === 0) {
				initClass = "hide";
			}
			redoButton = this.buildButton("redoButton", "Redo", this.redo, initClass);
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
				var aidLevel = {previous: sudokuGlobal.currentAidLevel};
				that.aidLevelChanged(); // ensure context is this object
                aidLevel.current = sudokuGlobal.currentAidLevel;
				sudokuGlobal.controls.storeUndo("SetAidLevel", aidLevel);
			}; 
			addEvent(sudokuGlobal.aidLevel, "change", levelChange, false);
			//this.aidLevel.className = "hide";
			controlsForm.appendChild(sudokuGlobal.aidLevel);
		}

		sudokuControls.prototype.changeAidLevel = function (aidLevel) {
			
			sudokuGlobal.currentAidLevel = aidLevel;
			//debugFramework.restoreDebug(oldDebugState);

			sudokuGlobal.puzzle.provideAid();
			
		}

		sudokuControls.prototype.aidLevelChanged = function () {
			this.changeAidLevel(sudokuGlobal.aidLevel.selectedIndex);
			
		}

		// We display the Undo, Redo and Save butons depending on the state of the Undo list
		sudokuControls.prototype.showUndoRedo = function () {
			if (undoIndex === 0) {
				undoButton.className = "hide";
				saveButton.className = "hide";
			} else {
				undoButton.className = "";
				saveButton.className = "";				
			}

			if (sudokuGlobal.undoList.length === undoIndex){
				redoButton.className = "hide";
			} else {
				redoButton.className = "";				
			}
		}


		sudokuControls.prototype.storeUndo = function (undoAction, undoData) {
			sudokuGlobal.undoList[undoIndex++] = [undoAction, undoData];
			sudokuGlobal.undoList.length = undoIndex;
			this.showUndoRedo();
		}


		sudokuControls.prototype.undo = function () {
		// Undo an action - this will be either a FixValue or change of Aid Level
			var undoInfo = sudokuGlobal.undoList[--undoIndex];
			var undoAction = undoInfo[0];
			var undoData = undoInfo[1];
			if (undoIndex === 0) {
				undoButton.className = "hide";
				saveButton.className = "hide";
			}
			redoButton.className = "";
			
			sudokuGlobal.puzzle.undo(undoAction, undoData);

			//var undoCell = this.blocks[blockRow][blockColumn].cells[cellRow][cellColumn];
			//var undoValue = undoCell.currentValue;

		}


		sudokuControls.prototype.redo = function () {
		// Undo an action - this will be either a FixValue or change of Aid Level
			var undoInfo = sudokuGlobal.undoList[undoIndex++];
			var undoAction = undoInfo[0];
			var undoData = undoInfo[1];
			if (undoIndex === 1) {
				undoButton.className = "";
			}
			if (undoIndex === sudokuGlobal.undoList.length) {
				redoButton.className = "hide";
			}
			
			sudokuGlobal.puzzle.redo(undoAction, undoData);

			//var undoCell = this.blocks[blockRow][blockColumn].cells[cellRow][cellColumn];
			//var undoValue = undoCell.currentValue;

		}


		sudokuControls.prototype.saveFile = function (saveAction, saveData) {
			// Build the set of data we want to store
			// Basically we store the list of actions the user has taken to create the puzzle in its current state
			var puzzleData = {
				undoList: sudokuGlobal.undoList,
				undoIndex: undoIndex
			};

			saveTextFile(puzzleFile, JSON.stringify(puzzleData));
		}


		sudokuControls.prototype.loadFile = function () {
			//console.log("loadFile called");
			// Load the set of sudoku data
			// Basically we restore the puzzle state by redoing the actions the user has taken
			var selectedFile = fileSelector[0].files[0];

			let reader = new FileReader(selectedFile);
			let that = this;

			reader.onload = function() {
				//console.log(reader.result);
				that.loadPuzzleData(JSON.parse(reader.result));
				sudokuGlobal.puzzle.provideAid();
			};

			reader.onerror = function() {
				console.log(reader.error);
			};

			reader.readAsText(selectedFile);
		}


		sudokuControls.prototype.loadPuzzleData = function (puzzleData) {
			//console.log("loadPuzzleData called");
			//console.log(puzzleData);
			// Load the set of sudoku data
			// Basically we restore the puzzle state by redoing the actions the user has taken
			// Start by clearing out the existing undo list
			sudokuGlobal.undoList = new Array();
			undoIndex = 0;
			sudokuGlobal.puzzle.clear();
			var undoData;

			// Now populate it with the loaded data
			let undoCount = puzzleData.undoList.length;
			for (puzzleIndex = 0; puzzleIndex < undoCount; puzzleIndex++) {
				let undoInfo = puzzleData.undoList[puzzleIndex];
				let undoAction = undoInfo[0];
				switch (undoAction) {
					case "FixValue":
						let positionData = undoInfo[1].position;
						let position = new PuzzlePosition(new Position(positionData.block.row, positionData.block.column), new Position(positionData.cell.row, positionData.cell.column));
						undoData = {value: undoInfo[1].value, 
									position: position};
					default:
						undoData = undoInfo[1];
						break;
				}
				this.storeUndo(undoAction, undoData);
			}

			// Now reset the undoIndex and redo each action up to the stored undoIndex
			undoIndex = 0;
			var loadedUndoIndex = puzzleData.undoIndex;
			for (puzzleIndex = 0; puzzleIndex < loadedUndoIndex; puzzleIndex++) {
				this.redo();
			}

			//console.log("loadPuzzleData ending");
			//console.log(sudokuGlobal.undoList);
		}


		this.init();

	}
