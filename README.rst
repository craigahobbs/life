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

* `Flower 2 <https://craigahobbs.github.io/life/#depth=0&size=32&load=12-12-t29471415242424251417492t0>`_

* `Gosper glider gun <https://craigahobbs.github.io/life/#depth=0&period=0.05&size=18&load=36-31-02w4w2z0z0z0z0z0z0z0z0w1x111n262c2b13142c4815132e28131124111l15171m131w2z0z0z0z0z0z0z0z0z0z0w2w4w2>`_

* `Leaves <https://craigahobbs.github.io/life/#depth=0&period=0.1&size=24&load=21-21-82113112333131313111123292116292m2z0c32323738213i1l1a263123151833121h132r2m292611292321111313131333211311280>`_

* `Crocodiles <https://craigahobbs.github.io/life/#depth=0&period=0.1&size=8&load=65-65-02z0q4z0q2z0z0z0z0z0z0z0z08333z0k1213121z0j2211122z0h2321232z0e1219121z0d1f1z0d1219121z0e2321232z0h2211122z0j1213121z0k333z0z0z0z0z0z0z0z0z0z0z0z0z0z0o3z0q131z0p131z0n2111112z0k1115111z0j191z0j2113112z0l232z0z0z0i232z0l2113112z0j191z0j1115111z0k2111112z0n131z0p131z0q3z0z0z0z0z0z0z0z0z0z0z0z0z0z0o333z0k1213121z0j2211122z0h2321232z0e1219121z0d1f1z0d1219121z0e2321232z0h2211122z0j1213121z0k333z0z0z0z0z0z0z0z082z0q4z0q2>`_

* `Crocodiles 2 <https://craigahobbs.github.io/life/#depth=0&period=0.1&size=8&load=65-65-02z0q4z0q2z0z0z0z0z0z0z0z08333z0k1213121z0j2211122z0h2321232z0e1219121z0d1f1z0d1219121z0e2321232z0h2211122z0j1213121z0k333z0z0z0z0z0z0z0z0z0z0z0z0z0z0o3z0q131z0p131z0n2111112z0k1115111z0j191z0j2113112z0l232z0z0z0i232z0l2113112z0j191z0j1115111z0k2111112z0n131z0p131z0q3z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0q2z0q4z0q2>`_


Development
===========

The life application is written in JavaScript (specifically `ECMAScript 2018
<https://en.wikipedia.org/wiki/ECMAScript#9th_Edition_-_ECMAScript_2018>`_). Its `hosted on GitHub
Pages <https://craigahobbs.github.io/life/>`_ as pure source with no packing or transpiling (to
ES5).

The application source code is located in the "src" directory. Unit tests are located in the "tests"
directory.

Before committing changes first run the following:

.. code:: sh

   make commit

The "make commit" command first runs unit tests ("make test") and ensures 100% line and branch
coverage. Next, it runs eslint ("make lint") for static code analysis. Finally, it runs jsdoc ("make
doc") to ensure the code documentation is sane.

The "make commit" command has the following system requirements:

- `Docker <https://www.docker.com/get-started>`_ (for the `Node.js <https://nodejs.org/en/>`_
  runtime via the "standard" `Node.js images <https://hub.docker.com/_/node/>`_.

The following development dependencies are installed:

- `Ava <https://github.com/avajs/ava#readme>`_ (for unit testing)
- `NYC <https://github.com/istanbuljs/nyc#readme>`_ (for unit test coverage)
- `ESLint <https://github.com/eslint/eslint#readme>`_ (for static code analysis)
- `JSDoc <https://github.com/jsdoc/jsdoc#readme>`_ (for documentation generation)

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
