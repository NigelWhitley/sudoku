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


function dummyCallback() {
}


function initSudoku() {
    // Store references to various sections of the document in case
    // we need to manipulate them dynamically.
    sudokuGlobal.pageBody = document.body;
    sudokuGlobal.controlsSection = document.getElementById("controls_section");
    sudokuGlobal.contentSection = document.getElementById("content_section");
    sudokuGlobal.puzzleSection = document.getElementById("puzzle_section");
    sudokuGlobal.infoSection = document.getElementById("info_section");
    sudokuGlobal.titleSection = document.getElementById("title_section");
    sudokuGlobal.legalSection = document.getElementById("legal_section");

    sudokuGlobal.puzzle = new sudokuPuzzle();
    sudokuGlobal.puzzle.displayPuzzle();
    // Make the info section the same height as the puzzle section
    var puzzleHeight = sudokuGlobal.puzzleSection.offsetHeight;
    // We need to take off the border height
    sudokuGlobal.infoSection.setAttribute("style", "height:" + (puzzleHeight-2) + "px");
    sudokuGlobal.controls = new sudokuControls();
}



function includeSudokuJs() {
 loadJsFile("sudokuVars.js", "vars-js", //dynamically load and add this .js file
     function() {loadJsFile("sudokuPosition.js", "position-js",  //dynamically load and add this .js file
         function() {loadJsFile("sudokuCell.js", "cell-js",  //dynamically load and add this .js file
             function() {loadJsFile("sudokuGroup.js", "group-js",  //dynamically load and add this .js file
                 function() {loadJsFile("sudokuCellSet.js", "cell-set-js",  //dynamically load and add this .js file
                     function() {loadJsFile("sudokuBlock.js", "block-js",  //dynamically load and add this .js file
                         function() {loadJsFile("sudokuControls.js", "cpntrols-js",  //dynamically load and add this .js file
                             function() {loadJsFile("sudokuPuzzle.js", "puzzle-js", initSudoku);} //dynamically load and add this .js file                                                        
                         );}
                     );}
                 );}
             );}
         );}
     );}
 );
}
