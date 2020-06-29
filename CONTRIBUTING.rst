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
