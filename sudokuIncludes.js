/* 
Sudoku Aid v0.2 by Nigel Whitley (c) Copyright 2005-2014
 */
 
/*
This file is just to load all of the constituent Javascript files from one place.
This keeps the specifics of the Javascript implementation away from the HTML HEAD and 
let me add/remove or rename things without touching the main HTML file.
Once everything became relatively stable I could have folded the definitions back into the 
HEAD of the HTML, but leaving it means I have more flexibilty if/when I want to do 
*another* major revision. :-D
*/

loadJsFile("sudokuVars.js"); //dynamically load and add this .js file
loadJsFile("sudokuPosition.js"); //dynamically load and add this .js file
loadJsFile("sudokuCell.js"); //dynamically load and add this .js file
loadJsFile("sudokuGroup.js"); //dynamically load and add this .js file
loadJsFile("sudokuBlock.js"); //dynamically load and add this .js file
loadJsFile("sudokuControls.js"); //dynamically load and add this .js file
loadJsFile("sudokuPuzzle.js"); //dynamically load and add this .js file
