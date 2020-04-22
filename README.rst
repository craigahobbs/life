Conway's Game of Life
*********************

This is a Javascript implementation of
`Conway's Game of Life <https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life>`_.

Click `here <https://craigahobbs.github.io/life/>`_ to run the simulation.


Examples
========

* `Pulsar <https://craigahobbs.github.io/life/#period=0.5&size=18&load=31-31-02r4r2z0z0z0z0z0n151o151o232z0g3221223i11111111111m232z0k232m11111111111i3221223z0g232o151o151z0z0z0z0z0n2r4r2>`_

* `Gosper glider gun <https://craigahobbs.github.io/life/#period=0.05&size=18&load=36-31-02w4w2z0z0z0z0z0z0z0z0w1x111n262c2b13142c4815132e28131124111l15171m131w2z0z0z0z0z0z0z0z0z0z0w2w4w2>`_

* `Clover <https://craigahobbs.github.io/life/#period=0.1&size=8&load=65-65-02z0q4z0q2z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0q3z0q131z0p131z0n2111112z0k1115111z0j191z0j2113112z0l232z0z0z0i232z0l2113112z0j191z0j1115111z0k2111112z0n131z0p131z0q3z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0q2z0q4z0q2>`_

* `Leaves <https://craigahobbs.github.io/life/#period=0.1&size=24&load=21-21-8311111332414111411112329211719121z0626141d121314212412131321171c2j2b181127262123322j172z0612191711292321111411141423311111380>`_


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
period         The simulation iteration period (default is 0.5 seconds).
width          The horizontal width of the cell grid (default is 50).
height         The vertical height of the cell grid (default is 50).
size           The size, in pixels, of a cell (default is 10).
gap            The gap, in pixels, between cells (default is 1).
lifeRatio      The probability, from zero to one, that a cell will be living at startup (default is 0.25).
lifeBorder     The size ratio of the lifeless border around the life board at startup (default is 0.1).
fill           The cell fill color (default is "#2a803b").
stroke         The cell stroke color (default is "none").
strokeWidth    The cell stroke width (default is 1).
bgFill         The board fill color (default is "#ffffff").
bgStroke       The board stroke color (default is "none").
bgStrokeWidth  The board stroke width (default is 1).
=============  ===========
