// Licensed under the MIT License
// https://github.com/craigahobbs/life/blob/master/LICENSE

import * as chisel from './chisel.js';


/**
 * The life simulation application class.
 *
 * @property {Life[]} generations - The array of life board generations. The current state is the last array element.
 * @property {?Interval} generationInterval - The interval (timer) for the running simulation or null if not running.
 * @property {Object} linkParams - The decoded, unparsed hash parameters object for use in link creation.
 * @property {Object} params - The parsed and validated hash parameters object.
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
     * this.linkParams and this.params.  this.linkParams is the decoded hash parameters object for
     * use with creating links to the application.  this.params is object containing all known hash
     * parameters parsed and validated.
     */
    updateParams() {
        const params = chisel.decodeParams();

        // Load?
        let width, height;
        const minWH = 5;
        const maxWH = 1000;
        let life = 'load' in params && Life.decode(params.load);
        if (life !== null && life.width >= minWH && life.width < maxWH && life.height >= minWH && life.height < maxWH) {
            [width, height] = [life.width, life.height];
        } else {
            life = null;
            width = 'width' in params ? Math.max(minWH, Math.min(maxWH, parseInt(params.width, 10) || 0)) : 50;
            height = 'height' in params ? Math.max(minWH, Math.min(maxWH, parseInt(params.height, 10) || 0)) : 50;
        }

        // Update params
        this.linkParams = params;
        this.params = {
            'pause': !!life || params.pause === 'true' || params.pause === '1',
            'step': params.step === 'true' || params.step === '1',
            'reset': params.reset === 'true' || params.reset === '1',
            'clear': params.clear === 'true' || params.clear === '1',
            'cellx': 'cellx' in params ? Math.max(0, Math.min(maxWH - 1, parseInt(params.cellx, 10) || 0)) : null,
            'celly': 'celly' in params ? Math.max(0, Math.min(maxWH - 1, parseInt(params.celly, 10) || 0)) : null,
            'load': life,
            'save': params.save === 'true' || params.save === '1',
            'period': 'period' in params ? Math.max(0.0001, Math.min(60, parseFloat(params.period) || 0)) : 0.5,
            'width': width,
            'height': height,
            'size': 'size' in params ? Math.max(2, Math.min(100, parseInt(params.size, 10) || 0)) : 10,
            'gap': 'gap' in params ? Math.max(0, Math.min(10, parseInt(params.gap, 10) || 0)) : 1,
            'depth': 'depth' in params ? Math.max(0, Math.min(1000, parseInt(params.depth, 10) || 0)) : 6,
            'lifeRatio': 'lifeRatio' in params ? Math.max(0, Math.min(1, parseFloat(params.lifeRatio) || 0)) : 0.25,
            'lifeBorder': 'lifeBorder' in params ? Math.max(0, Math.min(0.45, parseFloat(params.lifeBorder) || 0)) : 0.1,
            'fill': params.fill || '#2a803b',
            'stroke': params.stroke || 'none',
            'strokeWidth': params.strokeWidth || '1',
            'bgFill': params.bgFill || '#ffffff',
            'bgStroke': params.bgStroke || 'none',
            'bgStrokeWidth': params.bgStrokeWidth || '1'
        };
    }

    /**
     * Get the current life board object.
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
            if (foundDepth <= this.params.depth) {
                next = new Life(0, 0).resize(this.current.width, this.current.height, this.params.lifeRatio, this.params.lifeBorder);
                this.generations = [];
            }
        }

        // Limit generations array size
        this.generations.push(next);
        if (this.generations.length > this.params.depth * 2) {
            this.generations = this.generations.slice(this.generations.length - Math.max(1, this.params.depth));
        }
    }

    /**
     * The main entry point for the life simulation application. This method renders the life
     * simulation page within the document.body element.
     */
    render() {
        this.updateParams();

        // Clear/set the generation interval
        if (this.generationInterval !== null) {
            clearInterval(this.generationInterval);
            this.generationInterval = null;
        }
        if (!this.params.pause && !this.params.step) {
            this.generationInterval = window.setInterval(
                // istanbul ignore next
                () => this.onIntervalTimeout(),
                this.params.period * 1000
            );
        }

        // Load?
        if (this.params.load !== null) {
            this.generations = [this.params.load];
            if (!this.params.save) {
                this.assignLocation(chisel.href({
                    ...this.linkParams,
                    'load': null,
                    'width': this.params.width,
                    'height': this.params.height,
                    'pause': '1'
                }));
                return;
            }
        } else {
            // Resize?
            if (this.params.width !== this.current.width || this.params.height !== this.current.height) {
                this.generations =
                    [this.current.resize(this.params.width, this.params.height, this.params.lifeRatio, this.params.lifeBorder)];
            }

            // Execute command, if any
            if (this.params.reset) {
                this.generations =
                    [new Life(0, 0).resize(this.params.width, this.params.height, this.params.lifeRatio, this.params.lifeBorder)];
                this.assignLocation(chisel.href({...this.linkParams, 'reset': null}));
                return;
            } else if (this.params.clear) {
                this.generations = [new Life(0, 0).resize(this.params.width, this.params.height, 0, 0)];
                this.assignLocation(chisel.href({...this.linkParams, 'clear': null}));
                return;
            } else if (this.params.step) {
                this.next();
                this.assignLocation(chisel.href({...this.linkParams, 'step': null, 'pause': '1'}));
                return;
            } else if (this.params.cellx !== null || this.params.celly !== null) {
                if (this.params.cellx !== null && this.params.cellx >= 0 && this.params.cellx < this.params.width &&
                    this.params.cellx !== null && this.params.celly >= 0 && this.params.celly < this.params.height) {
                    this.current.setCell(this.params.cellx, this.params.celly, !this.current.cell(this.params.cellx, this.params.celly));
                }
                this.assignLocation(chisel.href({...this.linkParams, 'cellx': null, 'celly': null}));
                return;
            }
        }

        // Render
        chisel.render(document.body, this.pageElements());
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
        const button = (text, params, isSection, isFirst) => [
            isFirst ? null : chisel.text(isSection ? `${chisel.nbsp}| ` : chisel.nbsp),
            chisel.elem('a', {'href': chisel.href({...this.linkParams, ...params})}, chisel.text(text))
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
                this.params.save ? [
                    button('Load', {'save': null}, false, true),
                    chisel.text(`${chisel.nbsp}${chisel.nbsp}${chisel.nbsp}<--${chisel.nbsp}${chisel.nbsp}
                                Bookmark this link or the page link to save.`)
                ] : [
                    button(this.params.pause ? 'Play' : 'Pause', {'pause': this.params.pause ? null : '1'}, false, true),
                    !this.params.pause ? null : [
                        button('Step', {'step': '1'}, true),
                        button('Clear', {'clear': '1'}),
                        button('Save', {'load': this.current.encode(), 'save': '1'})
                    ],
                    button('Random', {'reset': '1'}, true),
                    button('Border', {'bgStroke': this.params.bgStroke === 'none' ? 'black' : null}),
                    button('<<Speed', {'period': this.params.period * 2}, true),
                    button('Speed>>', {'period': this.params.period / 2}),
                    button('<<Width', {'width': this.params.width - 5}, true),
                    button('Width>>', {'width': this.params.width + 5}),
                    button('<<Height', {'height': this.params.height - 5}, true),
                    button('Height>>', {'height': this.params.height + 5}),
                    button('<<Size', {'size': this.params.size - 2}, true),
                    button('Size>>', {'size': this.params.size + 2})
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
        const svgWidth = this.params.gap + this.params.width * (this.params.size + this.params.gap);
        const svgHeight = this.params.gap + this.params.height * (this.params.size + this.params.gap);
        const cellElems = [];
        const svgElems = chisel.svg('svg', {
            'width': svgWidth,
            'height': svgHeight,
            '_callback': this.params.load !== null || !this.params.pause ? null : (element) => {
                element.addEventListener('click', (event) => {
                    const boundingRect = event.target.ownerSVGElement.getBoundingClientRect();
                    const clickSize = this.params.size + this.params.gap;
                    const ix = Math.floor((event.clientX - boundingRect.left - 0.5 * this.params.gap) / clickSize);
                    const iy = Math.floor((event.clientY - boundingRect.top - 0.5 * this.params.gap) / clickSize);
                    this.assignLocation(chisel.href({...this.linkParams, 'cellx': ix, 'celly': iy}));
                });
            }
        }, cellElems);

        // Background
        cellElems.push(chisel.svg('rect', {
            'x': '0',
            'y': '0',
            'width': svgWidth,
            'height': svgHeight,
            'style': `fill: ${this.params.bgFill}; stroke: ${this.params.bgStroke}; stroke-width: ${this.params.bgStrokeWidth};`
        }));

        // Life cells
        for (let iy = 0; iy < this.current.height; iy++) {
            for (let ix = 0; ix < this.current.width; ix++) {
                if (this.current.cell(ix, iy)) {
                    cellElems.push(chisel.svg('rect', {
                        'x': this.params.gap + ix * (this.params.size + this.params.gap),
                        'y': this.params.gap + iy * (this.params.size + this.params.gap),
                        'width': this.params.size,
                        'height': this.params.size,
                        'style': `fill: ${this.params.fill}; stroke: ${this.params.stroke}; stroke-width: ${this.params.strokeWidth};`
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
