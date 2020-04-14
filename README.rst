Conway's Game of Life
*********************

This is a minimalist implementation of
`Conway's Game of Life <https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life>`_.

Click `here <https://craigahobbs.github.io/life/>`_ to run the simulation.


Page Arguments
==============

=============  ===========
Argument       Description
=============  ===========
width          The horizontal width of the cell grid (default is 50).
height         The vertical height of the cell grid (default is 50).
size           The size, in pixels, of a cell (default is 7).
gap            The gap, in pixels, between cells (default is 3).
fill           The cell fill color (default is "#2a803b").
stroke         The cell stroke color (default is "none").
strokeWidth    The cell stroke width (default is 1).
bgFill         The board fill color (default is "#ffffff").
bgStroke       The board stroke color (default is "none").
bgStrokeWidth  The board stroke width (default is 1).
threshold      The probability, from zero to one, that a cell will be living at startup (default is 0.25).
period         The simulation iteration period (default is 1 second).
play           If not "true" the simulation will not run (default is "false").
=============  ===========

Examples
--------

- `Large cells with green background and dark green living cells <https://craigahobbs.github.io/life/#width=20&height=10&size=50&fill=#1f5e18&bgFill=#75bd6d>`_
