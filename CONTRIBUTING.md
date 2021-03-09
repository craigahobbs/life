# Development

The life application is written in JavaScript (specifically
[ECMAScript 2018](https://en.wikipedia.org/wiki/ECMAScript#9th_Edition_-_ECMAScript_2018)).
Its [hosted on GitHub Pages](https://craigahobbs.github.io/life/).

The application source code is located in the "src" directory. Unit tests are located in the "tests"
directory.

Before committing changes first run the following:

```
make commit
```

The "make commit" command first runs unit tests ("make test") and ensures 100% line and branch
coverage. Next, it runs eslint ("make lint") for static code analysis. Finally, it runs jsdoc ("make
doc") to ensure the code documentation is sane.

The "make commit" command has the following system requirements:

- [Docker](https://www.docker.com/get-started) (for the [Node.js](https://nodejs.org/en/)
  runtime via the "standard" [Node.js images](https://hub.docker.com/_/node/).

The following development dependencies are installed:

- [Ava](https://github.com/avajs/ava#readme) (for unit testing)
- [NYC](https://github.com/istanbuljs/nyc#readme) (for unit test coverage)
- [ESLint](https://github.com/eslint/eslint#readme) (for static code analysis)
- [JSDoc](https://github.com/jsdoc/jsdoc#readme) (for documentation generation)

To cleanup the source directory run:

```
make clean
```

To also cleanup the downloaded Node.js Docker image run:

```
make superclean
```

To deploy your changes to GitHub Pages run:

```
make gh-pages
```

This command creates a "../life.gh-pages" directory with the "gh-pages" branch checked out. To
deploy, commit the changes and push.
