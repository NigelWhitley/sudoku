          Sudoku Aid
          ----------
An aid to solving the logic puzzle commonly known as Sudoku, licensed under the GPL.

When Sudoku enjoyed its first flush of popularity nearly a decade ago I got frustrated when trying to solve some puzzles.  It was rarely clear whether the problem was that I had made a mistake, missed a deduction or that the puzzle was a "bad" one. The <a href="sudoku/sudoku.html">Sudoku helper</a> was the result.

IMHO, "bad" puzzles need a guess rather than just deductions.  That might be because the puzzle has more than one possible solution or perhaps that the route to a solution required a "posit". Using a posited value might then result in an invalid solution which allowed that possible value to be eliminated. However, a guess is still a guess even if the process is obfuscated through the language used to describe it.

Ideally there would be some program that could reduce the problem by running through the deductions, so revealing whether the real problem was me (not as uncommon as I would wish) or the puzzle. The program should not just "solve" the puzzle, but could show the next step if I was just stuck.

I had been wondering whether JavaScript could be used for more than just hover effects, resizing or pop-ups so JavaScript looked a good candidate for a Sudoku helper. I also wanted the option to use it on both Windows and Linux so a browser based solution seemed a smart choice. This was before I braved the perils of cross-browser compatibility. My first effort was usable but as soon as I tried more sophisticated deductions (groups/pins), the performance limitations of JavaScript in then-current browsers became apparent. I still used it myself from time to time but I didn't feel it would be of much wider interest.

During my current period of "availability", hearing that JavaScript performance was greatly improved, I revamped the code to use CSS and to use objects better. I then needed something to submit for a job application and this seemed to fit their requirement so I did some more work on it then, more recently, added the "group" processing and tweaked the order of applying the deductions. 

Certainly, the code for applying the deductions could be made more pluggable but it stops me raging when I get stuck and that was the original idea. Hoping it may be of use or of interest to more than just me I've made the code available.

------------------
Nigel Whitley - July 2014
