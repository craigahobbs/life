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
     * Navigate to a new location. This method is non-static so that it can easily be overwritten in unit tests.
     *
     * @param {string} location - The location to navigate to.
     */
    // istanbul ignore next
    // eslint-disable-next-line class-methods-use-this
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
     * Advance to the next state in the life simulation.
     */
    next() {
        // Cycle?  If yes and of insufficient depth, reset...
        let next = this.current.next();
        const foundIndex = this.generations.findIndex((life) => next.isEqual(life));
        if (foundIndex !== -1) {
            const foundDepth = this.generations.length - foundIndex;
            if (foundDepth <= this.config.depth) {
                next = new Life(0, 0).resize(this.current.width, this.current.height, this.config.lifeRatio, this.config.lifeBorder);
                this.generations = [];
            }
        }

        // Limit generations array size
        this.generations.push(next);
        if (this.generations.length > this.config.depth * 2) {
            this.generations = this.generations.slice(this.generations.length - Math.max(1, this.config.depth));
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
            LifePage.renderError(message);
            return;
        }

        // Clear the generation interval
        if (this.generationInterval !== null) {
            clearInterval(this.generationInterval);
            this.generationInterval = null;
        }

        // Resize?
        if (this.config.width !== this.current.width || this.config.height !== this.current.height) {
            this.generations =
                [this.current.resize(this.config.width, this.config.height, this.config.lifeRatio, this.config.lifeBorder)];
        }

        // Play?
        // istanbul ignore else
        if (!('cmd' in this.config) || 'play' in this.config.cmd) {
            // Set the generation interval, unless paused
            if (!('cmd' in this.config) || !this.config.cmd.play.pause) {
                this.generationInterval = window.setInterval(
                    // istanbul ignore next
                    () => this.onIntervalTimeout(),
                    this.config.period * 1000
                );
            }

        // Load?
        } else if ('load' in this.config.cmd) {
            // Set the new life simulation state
            const life = Life.decode(this.config.cmd.load.data);
            if (life === null) {
                LifePage.renderError('Invalid load data');
                return;
            }
            this.generations = [life];

            // Navigate to the play/paused command (unless saving)
            if (!this.config.cmd.load.save) {
                this.assignLocation(chisel.href(
                    {...this.params, 'cmd': {'play': {'pause': true}}, 'width': life.width, 'height': life.height}
                ));
                return;
            }

        // Step?
        } else if ('step' in this.config.cmd) {
            // Update the life simulation state
            this.next();

            // Navigate to the play/paused command (unless saving)
            this.assignLocation(chisel.href({...this.params, 'cmd': {'play': {'pause': true}}}));
            return;

        // Reset?
        } else if ('reset' in this.config.cmd) {
            // Randomize the life simulation state
            this.generations =
                [new Life(0, 0).resize(this.config.width, this.config.height, this.config.lifeRatio, this.config.lifeBorder)];

            // Navigate to the play/paused command
            this.assignLocation(chisel.href({...this.params, 'cmd': {'play': {'pause': true}}}));
            return;

        // Clear?
        } else if ('clear' in this.config.cmd) {
            // Clear the life simulation state
            this.generations = [new Life(0, 0).resize(this.config.width, this.config.height, 0, 0)];

            // Navigate to the play/paused command
            this.assignLocation(chisel.href({...this.params, 'cmd': {'play': {'pause': true}}}));
            return;

        // Toggle?
        } else if ('toggle' in this.config.cmd) {
            // Toggle the cell
            const setX = this.config.cmd.toggle.x;
            const setY = this.config.cmd.toggle.y;
            if (setX < this.config.width && setY < this.config.height) {
                this.current.setCell(setX, setY, !this.current.cell(setX, setY));
            }

            // Navigate to the play/paused command
            this.assignLocation(chisel.href({...this.params, 'cmd': {'play': {'pause': true}}}));
            return;
        }

        // Render
        chisel.render(document.body, this.pageElements());
    }

    static renderError(message) {
        chisel.render(document.body, chisel.text(`Error: ${message}`));
    }

    /**
     * The life simulation interval callback. This advances to the next simlation state and re-renders the life board SVG.
     */
    onIntervalTimeout() {
        this.next();
        chisel.render(document.getElementById('lifeSvg'), this.svgElements());
    }

    /**
     * Generate the life simulation page elments for use with the chisel.render function.
     *
     * @returns {Array}
     */
    pageElements() {
        // Command state
        const paused = 'cmd' in this.config && 'play' in this.config.cmd && this.config.cmd.play.pause;
        const saving = 'cmd' in this.config && 'load' in this.config.cmd && this.config.cmd.load.save;

        // Get the period, width, height, and size attributes
        const periodAttr = lifeTypes.Life.struct.members.find((member) => member.name === 'period').attr;
        const widthAttr = lifeTypes.Life.struct.members.find((member) => member.name === 'width').attr;
        const heightAttr = lifeTypes.Life.struct.members.find((member) => member.name === 'height').attr;
        const sizeAttr = lifeTypes.Life.struct.members.find((member) => member.name === 'size').attr;

        // Helper function for creating a simple menu
        const button = (text, params, isSection, isFirst) => [
            isFirst ? null : chisel.text(isSection ? `${chisel.nbsp}| ` : chisel.nbsp),
            chisel.elem('a', {'href': chisel.href({...this.params, ...params})}, chisel.text(text))
        ];

        return [
            // Title
            chisel.elem('p', null, [
                chisel.elem('span', {'style': 'font-weight: bold; white-space: nowrap;'}, chisel.text("Conway's Game of Life")),
                chisel.text(`${chisel.nbsp}${chisel.nbsp} `),
                chisel.elem('a', {'href': 'https://github.com/craigahobbs/life#readme'}, chisel.text('GitHub')),
                chisel.text(`${chisel.nbsp}${chisel.nbsp}`),
                chisel.elem('a', {'href': 'https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life'}, chisel.text('Wikipedia'))
            ]),
            chisel.elem('p', null, [
                saving ? [
                    button('Load', {'cmd': {'load': {'data': this.config.cmd.load.data}}}, false, true),
                    chisel.text(`${chisel.nbsp}${chisel.nbsp}${chisel.nbsp}<--${chisel.nbsp}${chisel.nbsp}
                                Bookmark this link or the page link to save.`)
                ] : [
                    button(paused ? 'Play' : 'Pause', {'cmd': paused ? null : {'play': {'pause': true}}}, false, true),
                    !paused ? null : [
                        button('Step', {'cmd': {'step': ''}}, true),
                        button('Clear', {'cmd': {'clear': ''}}),
                        button('Random', {'cmd': {'reset': ''}}),
                        button('Save', {'cmd': {'load': {'data': this.current.encode(), 'save': true}}})
                    ],
                    button('Border', {'bgStroke': this.config.bgStroke === 'none' ? 'black' : null}, true),
                    button('<<Speed', {'period': Math.min(periodAttr.lte, this.config.period * 2)}, true),
                    button('Speed>>', {'period': Math.max(periodAttr.gte, this.config.period / 2)}),
                    button('<<Width', {'width': Math.max(widthAttr.gte, this.config.width - 5)}, true),
                    button('Width>>', {'width': Math.min(widthAttr.lte, this.config.width + 5)}),
                    button('<<Height', {'height': Math.max(heightAttr.gte, this.config.height - 5)}, true),
                    button('Height>>', {'height': Math.min(heightAttr.lte, this.config.height + 5)}),
                    button('<<Size', {'size': Math.max(sizeAttr.gte, this.config.size - 2)}, true),
                    button('Size>>', {'size': Math.min(sizeAttr.lte, this.config.size + 2)})
                ]
            ]),

            // Life SVG
            chisel.elem('p', {'id': 'lifeSvg'}, this.svgElements())
        ];
    }

    /**
     * Generate the life board SVG elments for use with the chisel.render function.
     *
     * @returns {Object}
     */
    svgElements() {
        const paused = 'cmd' in this.config && 'play' in this.config.cmd && this.config.cmd.play.pause;
        const svgWidth = this.config.gap + this.config.width * (this.config.size + this.config.gap);
        const svgHeight = this.config.gap + this.config.height * (this.config.size + this.config.gap);
        const cellElems = [];
        const svgElems = chisel.svg('svg', {
            'width': svgWidth,
            'height': svgHeight,
            '_callback': !('cmd' in this.config) || !paused ? null : (element) => {
                element.addEventListener('click', (event) => {
                    const boundingRect = event.target.ownerSVGElement.getBoundingClientRect();
                    const clickSize = this.config.size + this.config.gap;
                    const ix = Math.floor((event.clientX - boundingRect.left - 0.5 * this.config.gap) / clickSize);
                    const iy = Math.floor((event.clientY - boundingRect.top - 0.5 * this.config.gap) / clickSize);
                    this.assignLocation(chisel.href({...this.params, 'cmd': {'toggle': {'x': ix, 'y': iy}}}));
                });
            }
        }, cellElems);

        // Background
        cellElems.push(chisel.svg('rect', {
            'x': '0',
            'y': '0',
            'width': svgWidth,
            'height': svgHeight,
            'style': `fill: ${this.config.bgFill}; stroke: ${this.config.bgStroke}; stroke-width: ${this.config.bgStrokeWidth};`
        }));

        // Life cells
        for (let iy = 0; iy < this.current.height; iy++) {
            for (let ix = 0; ix < this.current.width; ix++) {
                if (this.current.cell(ix, iy)) {
                    cellElems.push(chisel.svg('rect', {
                        'x': this.config.gap + ix * (this.config.size + this.config.gap),
                        'y': this.config.gap + iy * (this.config.size + this.config.gap),
                        'width': this.config.size,
                        'height': this.config.size,
                        'style': `fill: ${this.config.fill}; stroke: ${this.config.stroke}; stroke-width: ${this.config.strokeWidth};`
                    }));
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
