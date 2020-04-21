Conway's Game of Life
*********************

This is a Javascript implementation of
`Conway's Game of Life <https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life>`_.

Click `here <https://craigahobbs.github.io/life/>`_ to run the simulation.


Examples
========

* `Open heart <https://craigahobbs.github.io/life/#period=0.25&size=22&&load=31-31-1100000000000000000000000000011110000000000000000000000000001100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001100011000000000000000000000001010001010000000000000000000000100000001000000000000000000000010000000100000000000000000000000100000100000000000000000000000001000100000000000000000000000000011100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011000000000000000000000000000111100000000000000000000000000011>`_

* `Large cells with green background and dark green living cells <https://craigahobbs.github.io/life/#width=20&height=10&size=50&fill=#1f5e18&bgFill=#75bd6d>`_

* `Fast simulation <https://craigahobbs.github.io/life/#period=0.05>`_


Page Arguments
==============

=============  ===========
Argument       Description
=============  ===========
pause          If "true" or "1" the simulation is paused (default is "false").
step           If "true" or "1" the simulation is stepped and paused (default is "false").
reset          If "true" or "1" the simulation state is randomized (default is "false").
cellx          If "true" or "1" in conjunction with "celly" toggles the cell at the x, y coordinate.
celly          If "true" or "1" in conjunction with "cellx" toggles the cell at the x, y coordinate.
load           Load a life board from the string format "<width>-<height>-<[01]{width * height}>".
save           If "true" or "1" the load agument is not cleared.
period         The simulation iteration period (default is 1 second).
width          The horizontal width of the cell grid (default is 50).
height         The vertical height of the cell grid (default is 50).
size           The size, in pixels, of a cell (default is 9).
gap            The gap, in pixels, between cells (default is 1).
threshold      The probability, from zero to one, that a cell will be living at startup (default is 0.25).
fill           The cell fill color (default is "#2a803b").
stroke         The cell stroke color (default is "none").
strokeWidth    The cell stroke width (default is 1).
bgFill         The board fill color (default is "#ffffff").
bgStroke       The board stroke color (default is "none").
bgStrokeWidth  The board stroke width (default is 1).
=============  ===========
