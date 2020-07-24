// Licensed under the MIT License
// https://github.com/craigahobbs/life/blob/master/LICENSE

import * as chisel from './chisel.js';
import {lifeTypes} from './lifeTypes.js';


/**
 * The life simulation application class.
 *
 * @property {Life[]} generations - The array of life board generations. The current state is the last array element.
 * @property {?Interval} generationInterval - The interval (timer) for the running simulation or null if not running
 * @property {Object} params - The validated hash parameters object
 * @property {Object} config - The validated, fully-populated (with defaults) hash parameters object
 */
export class LifePage {
    /**
     * Create the life simulation application instance.
     */
    constructor() {
        this.generations = [new Life(0, 0)];
        this.generationInterval = null;
    }

    /**
     * Run the application
     *
     * @returns {Object} Object meant to be passed to "runCleanup" for application shutdown
     */
    static run() {
        // Create the applicaton object and render
        const lifePage = new LifePage();
        lifePage.render();

        // Add the hash parameters listener
        const addEventListenerArgs = ['hashchange', () => lifePage.render(), false];
        window.addEventListener(...addEventListenerArgs);

        // Return the cleanup object
        return {
            'windowRemoveEventListener': addEventListenerArgs
        };
    }

    /*
     * Cleanup global state created by "run"
     *
     * @param {Object} runResult - The return value of "run"
     */
    static runCleanup(runResult) {
        window.removeEventListener(...runResult.windowRemoveEventListener);
    }

    /**
     * Navigate to a new location. This method is non-static so that it can easily be overwritten in unit tests.
     *
     * @param {string} location - The location to navigate to.
     */
    /* istanbul ignore next */
    /* eslint-disable-next-line class-methods-use-this */
    assignLocation(location) {
        window.location.href = location;
    }

    /**
     * Parse the window location's hash parameters. This method sets two class members:
     * this.params and this.config.  this.params is the decoded hash parameters object for
     * use with creating links to the application.  this.config is object containing all known hash
     * parameters parsed and validated.
     */
    updateParams() {
        this.params = null;
        this.config = null;
        this.params = chisel.validateType(lifeTypes, 'Life', chisel.decodeParams());
        this.config = {
            'pause': false,
            'width': 50,
            'height': 50,
            'period': 0.5,
            'size': 10,
            'gap': 1,
            'depth': 6,
            'lifeRatio': 0.25,
            'lifeBorder': 0.1,
            'fill': 'forestgreen',
            'stroke': 'none',
            'strokeWidth': 1,
            'bgFill': 'white',
            'bgStroke': 'none',
            'bgStrokeWidth': 1,
            ...this.params
        };
    }

    /**
     * Get the current life board object
     *
     * @returns {Life}
     */
    get current() {
        return this.generations[this.generations.length - 1];
    }

    /**
     * Returns true if the life simulation is paused
     */
    get paused() {
        return 'pause' in this.config && this.config.pause || 'load' in this.config || 'save' in this.config && this.config.save;
    }

    /**
     * Advance to the next state in the life simulation and render
     */
    next() {
        // Cycle?  If yes and of insufficient depth, randomize...
        const next = this.current.next();
        const foundIndex = this.generations.findIndex((life) => next.isEqual(life));
        if (foundIndex !== -1) {
            const foundDepth = this.generations.length - foundIndex;
            if (foundDepth <= this.config.depth) {
                this.randomize();
                return;
            }
        }

        // Add the generation and limit generations array size
        this.generations.push(next);
        if (this.generations.length > this.config.depth * 2) {
            this.generations = this.generations.slice(this.generations.length - Math.max(1, this.config.depth));
        }

        // Render the life board
        this.renderSVG();
    }

    /**
     * Randomize the life board and render
     */
    randomize() {
        // Randomize the life board
        this.generations =
            [new Life(0, 0).resize(this.config.width, this.config.height, this.config.lifeRatio, this.config.lifeBorder)];

        // Render the life board
        this.renderSVG();
    }

    /**
     * Clear the life board and render
     */
    clear() {
        // Clear the life simulation state
        this.generations = [new Life(0, 0).resize(this.config.width, this.config.height, 0, 0)];

        // Render the life board
        this.renderSVG();
    }

    /**
     * Toggle a cell and render
     *
     * @param {number} ix - The life board X coordinate
     * @param {number} iy - The life board Y coordinate
     */
    toggleCell(ix, iy) {
        // Valid coordinates?
        if (ix >= 0 && ix < this.current.width && iy >= 0 && iy < this.current.height) {
            // Toggle the cell
            this.current.setCell(ix, iy, !this.current.cell(ix, iy));

            // Render the life board
            this.renderSVG();
        }
    }

    /**
     * The main entry point for the life simulation application. This method renders the life
     * simulation page within the document.body element.
     */
    render() {
        // Decode and validate hash parameters
        try {
            this.updateParams();
        } catch ({message}) {
            chisel.render(document.body, LifePage.errorElements(message));
            return;
        }

        // Clear the generation interval
        if (this.generationInterval !== null) {
            window.clearInterval(this.generationInterval);
            this.generationInterval = null;
        }

        // Resize?
        if (this.config.width !== this.current.width || this.config.height !== this.current.height) {
            this.generations =
                [this.current.resize(this.config.width, this.config.height, this.config.lifeRatio, this.config.lifeBorder)];
        }

        // Load?
        /* istanbul ignore else */
        if ('load' in this.config) {
            // Set the new life simulation state
            const life = Life.decode(this.config.load);
            if (life === null) {
                chisel.render(document.body, LifePage.errorElements('Invalid load data'));
                return;
            }
            this.generations = [life];

            // Navigate to clear the "load" hash param
            this.assignLocation(chisel.href({...this.params, 'load': null, 'save': null, 'width': life.width, 'height': life.height}));
            return;

        // Play, unless paused
        } else if (!this.paused) {
            // Set the generation interval
            this.generationInterval = window.setInterval(/* istanbul ignore next */ () => this.next(), this.config.period * 1000);
        }

        // Render
        chisel.render(document.body, this.pageElements());
    }

    /**
     * Render the life board SVG
     */
    renderSVG(elementId = 'lifeSVG') {
        const parentElement = document.getElementById(elementId);
        if (parentElement !== null) {
            chisel.render(parentElement, this.svgElements());
        }
    }

    /**
     * Generate the error page element model
     *
     * @param {string} message - The error message
     */
    static errorElements(message) {
        return {'html': 'p', 'elem': {'text': `Error: ${message}`}};
    }

    /**
     * Generate the life simulation page element model
     *
     * @returns {Array}
     */
    pageElements() {
        // Get the period, width, height, and size attributes
        const periodAttr = lifeTypes.Life.struct.members.find((member) => member.name === 'period').attr;
        const widthAttr = lifeTypes.Life.struct.members.find((member) => member.name === 'width').attr;
        const heightAttr = lifeTypes.Life.struct.members.find((member) => member.name === 'height').attr;
        const sizeAttr = lifeTypes.Life.struct.members.find((member) => member.name === 'size').attr;

        // Helper function for creating a simple menu
        const button = (text, params, callback = null, isSection = false, isFirst = false) => {
            const anchorAttr = {
                'href': chisel.href({...this.params, ...params})
            };
            if (callback !== null) {
                anchorAttr._callback = (element) => {
                    element.addEventListener('click', callback);
                };
            }
            return [
                isFirst ? null : {'text': isSection ? `${chisel.nbsp}| ` : chisel.nbsp},
                {'html': 'a', 'elem': {'text': text}, 'attr': anchorAttr}
            ];
        };

        return [
            // Title
            {'html': 'p', 'elem': [
                {'html': 'span', 'attr': {'style': 'font-weight: bold; white-space: nowrap;'}, 'elem': {'text': "Conway's Game of Life"}},
                {'text': `${chisel.nbsp}${chisel.nbsp} `},
                {'html': 'a', 'attr': {'href': 'https://github.com/craigahobbs/life#readme'}, 'elem': {'text': 'GitHub'}},
                {'text': `${chisel.nbsp}${chisel.nbsp}`},
                {'html': 'a', 'attr': {'href': 'https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life'}, 'elem': {'text': 'Wikipedia'}}
            ]},
            {'html': 'p', 'elem': [
                'save' in this.config && this.config.save ? [
                    button('Load', {'load': this.current.encode(), 'save': null}, null, false, true),
                    {'text': `${chisel.nbsp}${chisel.nbsp}${chisel.nbsp}<--${chisel.nbsp}${chisel.nbsp}` +
                     'Bookmark this link or the page link to save.'}
                ] : [
                    button(this.paused ? 'Play' : 'Pause', {'pause': this.paused ? null : true}, null, false, true),
                    !this.paused ? null : [
                        button('Step', {}, /* istanbul ignore next */ () => this.next(), true),
                        button('Clear', {}, /* istanbul ignore next */ () => this.clear()),
                        button('Random', {}, /* istanbul ignore next */ () => this.randomize()),
                        button('Save', {'save': true})
                    ],
                    button('Border', {'bgStroke': this.config.bgStroke === 'none' ? 'black' : null}, null, true),
                    button('<<Speed', {'period': Math.min(periodAttr.lte, this.config.period * 2)}, null, true),
                    button('Speed>>', {'period': Math.max(periodAttr.gte, this.config.period / 2)}),
                    button('<<Width', {'width': Math.max(widthAttr.gte, this.config.width - 5)}, null, true),
                    button('Width>>', {'width': Math.min(widthAttr.lte, this.config.width + 5)}),
                    button('<<Height', {'height': Math.max(heightAttr.gte, this.config.height - 5)}, null, true),
                    button('Height>>', {'height': Math.min(heightAttr.lte, this.config.height + 5)}),
                    button('<<Size', {'size': Math.max(sizeAttr.gte, this.config.size - 2)}, null, true),
                    button('Size>>', {'size': Math.min(sizeAttr.lte, this.config.size + 2)})
                ]
            ]},

            // Life SVG
            {'html': 'p', 'attr': {'id': 'lifeSVG'}, 'elem': this.svgElements()}
        ];
    }

    /**
     * Generate the life board SVG element model
     *
     * @returns {Object}
     */
    svgElements() {
        const svgWidth = this.config.gap + this.config.width * (this.config.size + this.config.gap);
        const svgHeight = this.config.gap + this.config.height * (this.config.size + this.config.gap);
        const cellElems = [];
        const svgElems = {
            'svg': 'svg',
            'attr': {
                'width': `${svgWidth}`,
                'height': `${svgHeight}`,
                '_callback': !this.paused || 'save' in this.config ? null : (element) => {
                    element.addEventListener('click', (event) => {
                        const boundingRect = event.target.ownerSVGElement.getBoundingClientRect();
                        const clickSize = this.config.size + this.config.gap;
                        this.toggleCell(
                            Math.floor((event.clientX - boundingRect.left - 0.5 * this.config.gap) / clickSize),
                            Math.floor((event.clientY - boundingRect.top - 0.5 * this.config.gap) / clickSize)
                        );
                    });
                }
            },
            'elem': cellElems
        };

        // Background
        cellElems.push({'svg': 'rect', 'attr': {
            'x': '0',
            'y': '0',
            'width': `${svgWidth}`,
            'height': `${svgHeight}`,
            'style': `fill: ${this.config.bgFill}; stroke: ${this.config.bgStroke}; stroke-width: ${this.config.bgStrokeWidth};`
        }});

        // Life cells
        for (let iy = 0; iy < this.current.height; iy++) {
            for (let ix = 0; ix < this.current.width; ix++) {
                if (this.current.cell(ix, iy)) {
                    cellElems.push({'svg': 'rect', 'attr': {
                        'x': `${this.config.gap + ix * (this.config.size + this.config.gap)}`,
                        'y': `${this.config.gap + iy * (this.config.size + this.config.gap)}`,
                        'width': `${this.config.size}`,
                        'height': `${this.config.size}`,
                        'style': `fill: ${this.config.fill}; stroke: ${this.config.stroke}; stroke-width: ${this.config.strokeWidth};`
                    }});
                }
            }
        }

        return svgElems;
    }
}


/**
 * Class representing a life simulation "board".
 *
 * @property {number} width - The integer width of the life board.
 * @property {number} height - The integer height of the life board.
 * @property {number} values - The living state of the life board in row order.
 */
export class Life {
    /**
     *  Create a new life board object.
     *
     * @param {number} width - The integer width of the life board.
     * @param {number} height - The integer height of the life board.
     * @param {boolean[]} [values=null] - Optional default initial living state array. Must be of length widht * height.
     */
    constructor(width, height, values = null) {
        this.width = Math.max(0, width);
        this.height = Math.max(0, height);
        if (values !== null && values.length === this.width * this.height) {
            this.values = values;
        } else {
            this.values = Array.from({'length': this.width * this.height}, () => false);
        }
    }

    /**
     * Get the living state of a cell of the life board.
     *
     * @param {number} ix - The integer X index of the cell in the range 0 and Life.width.
     * @param {number} iy - The integer Y index of the cell in the range 0 and Life.height.
     * @returns {boolean} If true, the cell is living.
     */
    cell(ix, iy) {
        return this.values[iy * this.width + ix];
    }

    /**
     * Set the living state of a cell of the life board.
     *
     * @param {number} ix - The integer X index of the cell in the range 0 and Life.width.
     * @param {number} iy - The integer Y index of the cell in the range 0 and Life.height.
     * @param {boolean} value - If true, the cell is living.
     */
    setCell(ix, iy, value) {
        this.values[iy * this.width + ix] = value;
    }

    /**
     * Compare this life board with another.
     *
     * @param {Life} other - The other life board.
     * @returns {boolean} If true, the life boards are equal.
     */
    isEqual(other) {
        if (this.width !== other.width || this.height !== other.height) {
            return false;
        }
        for (let ix = 0; ix < this.values.length; ix++) {
            if (this.values[ix] !== other.values[ix]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Resize the life board.
     *
     * @param {number} width - The integer width of the life board.
     * @param {number} height - The integer height of the life board.
     * @param {number} lifeRatio - The probability in the range 0 to 1 that a new cell will be living.
     * @param {number} lifeBorder - The size of the non-living border around the life board as a ratio of the width
     *     height in the range 0 to 1.
     * @returns {Life} The resized life board.
     */
    resize(width, height, lifeRatio, borderRatio) {
        const values = [];
        const xBorderMin = Math.floor(borderRatio * width);
        const xBorderMax = Math.ceil((1 - borderRatio) * width);
        const yBorderMin = Math.floor(borderRatio * height);
        const yBorderMax = Math.ceil((1 - borderRatio) * height);
        for (let iy = 0; iy < height; iy++) {
            for (let ix = 0; ix < width; ix++) {
                if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
                    values.push(this.cell(ix, iy));
                } else if (ix < xBorderMin || ix >= xBorderMax || iy < yBorderMin || iy >= yBorderMax) {
                    values.push(false);
                } else {
                    values.push(Math.random() < lifeRatio);
                }
            }
        }
        return new Life(width, height, values);
    }

    /**
     * Compute the next life board state in the simulation.
     *
     * @returns {Life}
     */
    next() {
        const values = [];
        const maxX = this.width - 1;
        const maxY = this.height - 1;
        for (let iy = 0; iy < this.height; iy++) {
            for (let ix = 0; ix < this.width; ix++) {
                const count =
                      (ix > 0 && iy > 0 ? this.cell(ix - 1, iy - 1) : false) +
                      (iy > 0 ? this.cell(ix, iy - 1) : false) +
                      (iy > 0 && ix < maxX ? this.cell(ix + 1, iy - 1) : false) +
                      (ix > 0 ? this.cell(ix - 1, iy) : false) +
                      (ix < maxX ? this.cell(ix + 1, iy) : false) +
                      (ix > 0 && iy < maxY ? this.cell(ix - 1, iy + 1) : false) +
                      (iy < maxY ? this.cell(ix, iy + 1) : false) +
                      (ix < maxX && iy < maxY ? this.cell(ix + 1, iy + 1) : false);
                values.push(this.cell(ix, iy) ? (count === 2 || count === 3) : count === 3);
            }
        }
        return new Life(this.width, this.height, values);
    }

    /**
     * Encode the life board as a string.
     *
     * @returns {string}
     */
    encode() {
        const values = [];
        const radix = 36;

        // Count pairs of runs of 0's/1's
        let zeroCount = 0;
        let oneCount = 0;
        let countZeros = true;
        for (let iv = 0; iv < this.values.length; iv++) {
            const value = this.values[iv];
            if (countZeros) {
                if (value) {
                    oneCount = 1;
                    countZeros = false;
                } else {
                    zeroCount++;
                    if (zeroCount >= radix - 1) {
                        oneCount = 0;
                        countZeros = false;
                    }
                }
            } else {
                if (value) {
                    oneCount++;
                    if (oneCount >= radix - 1) {
                        values.push(zeroCount.toString(radix));
                        values.push(oneCount.toString(radix));
                        zeroCount = 0;
                        oneCount = 0;
                        countZeros = true;
                    }
                } else {
                    values.push(zeroCount.toString(radix));
                    values.push(oneCount.toString(radix));
                    zeroCount = 1;
                    oneCount = 0;
                    countZeros = true;
                }
            }
        }
        if (zeroCount || oneCount) {
            values.push(zeroCount.toString(radix));
            values.push(oneCount.toString(radix));
        }

        return [this.width, this.height, values.join('')].join('-');
    }

    /**
     * Decode the life board from a string.
     *
     * @returns {?Life} The life board object or null on failure.
     */
    static decode(lifeString) {
        let life = null;
        const parts = lifeString.split('-');
        if (parts.length === 3) {
            const [sWidth, sHeight, sValues] = parts;
            const width = parseInt(sWidth, 10);
            const height = parseInt(sHeight, 10);
            if (width > 0 && height > 0) {
                // Decode the values
                const values = [];
                for (let ix = 0; ix < sValues.length; ix++) {
                    const count = parseInt(sValues[ix], 36);
                    for (let ic = 0; ic < count; ic++) {
                        values.push(ix % 2 !== 0);
                    }
                }
                if (values.length === width * height) {
                    life = new Life(width, height, values);
                }
            }
        }
        return life;
    }
}
