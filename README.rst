.. -*- fill-column: 100; -*-

Conway's Game of Life
*********************

This is a Javascript implementation of
`Conway's Game of Life <https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life>`_.

Click `here <https://craigahobbs.github.io/life/>`_ to run the simulation.


Instructions
============

Click "Pause" to stop the simulation. Once paused, you can save the life board by clicking "Save"
and copying the "Load" link. Also, in the paused state, you can toggle any cell of the life board by
clicking on it.  Click "Play" to restart the simulation.

Click "Random" to randomize the life board. Click "Border" to display a border around the life
board - this can be helpful for editing.

You can increase or decrease the speed of the simulation by clicking the "Speed" controls. Update
the size of the life board by clicking the "Width" and "Height" controls. Increase or decrease the
size of the life board cells by clicking the "Size" controls.


Examples
========

* `Pulsar <https://craigahobbs.github.io/life/#depth=0&size=32&load=17-17-z03333n141114141411141414111416333p333614111414141114141411141n333z030>`_

* `Flower <https://craigahobbs.github.io/life/#depth=0&size=32&load=15-15-z0z0c1d111b212b111d1z0z0c0>`_

* `Gosper glider gun <https://craigahobbs.github.io/life/#depth=0&period=0.05&size=18&load=36-31-02w4w2z0z0z0z0z0z0z0z0w1x111n262c2b13142c4815132e28131124111l15171m131w2z0z0z0z0z0z0z0z0z0z0w2w4w2>`_

* `Leaves <https://craigahobbs.github.io/life/#depth=0&period=0.1&size=24&load=21-21-8311111332414111411112329211719121z0626141d121314212412131321171c2j2b181127262123322j172z0612191711292321111411141423311111380>`_

* `Clover <https://craigahobbs.github.io/life/#depth=0&period=0.1&size=8&load=65-65-02z0q4z0q2z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0q3z0q131z0p131z0n2111112z0k1115111z0j191z0j2113112z0l232z0z0z0i232z0l2113112z0j191z0j1115111z0k2111112z0n131z0p131z0q3z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0q2z0q4z0q2>`_


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
depth          The generation depth used to check for cycles (default is 6).
lifeRatio      The probability, from zero to one, that a cell will be living at startup (default is 0.25).
lifeBorder     The size ratio of the lifeless border around the life board at startup (default is 0.1).
fill           The cell fill color (default is "#2a803b").
stroke         The cell stroke color (default is "none").
strokeWidth    The cell stroke width (default is 1).
bgFill         The board fill color (default is "#ffffff").
bgStroke       The board stroke color (default is "none").
bgStrokeWidth  The board stroke width (default is 1).
=============  ===========


Development
===========

The life application is written in JavaScript (specifically `ECMAScript 2018
<https://en.wikipedia.org/wiki/ECMAScript#9th_Edition_-_ECMAScript_2018>`_). Its `hosted on GitHub
Pages <https://craigahobbs.github.io/life/>`_ as pure source with no packing or transpiling (to
ES5).

The application source code is located in the "src" directory. Unit tests are located in the "tests"
directory and provide 100% line and branch coverage. Before committing changes first run the
following:

.. code:: sh

   make commit

The "make commit" command has the following system requirements:

- `Docker <https://www.docker.com/get-started>`_ (for the `Node.js <https://nodejs.org/en/>`_
  runtime via the "standard" `Node.js images <https://hub.docker.com/_/node/>`_.

The following development dependencies are installed:

- `Ava <https://github.com/avajs/ava#>`_ (for unit testing)
- `NYC <https://github.com/istanbuljs/nyc#nyc>`_ (for unit test coverage)
- `ESLint <https://github.com/eslint/eslint#eslint>`_ (for static code analysis)

To cleanup the source directory run:

.. code:: sh

   make clean

To also cleanup the downloaded Node.js Docker image run:

.. code:: sh

   make superclean

To deploy your changes to GitHub Pages run:

.. code:: sh

   make gh-pages

This command creates a "../life.gh-pages" directory with the "gh-pages" branch checked out. To
deploy, commit the changes and push.

Keeping Current
---------------

It's a good idea to update development dependency versions periodically. To do this, compare the
versions in the generated "package-lock.json" file with the versions in the "package.json"
file. Update any dependency version in the "package.json" file for which a new major version is
available.
