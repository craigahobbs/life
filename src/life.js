// Licensed under the MIT License
// https://github.com/craigahobbs/life/blob/master/LICENSE

import * as chisel from './chisel.js';


export function main(parent) {
    const lifePage = new LifePage();

    // Render page
    const renderLifePage = () => {
        const pageElements = lifePage.pageElements();
        if (pageElements) {
            chisel.render(parent, pageElements);
        }
    };
    renderLifePage();

    // Listen for hash parameter changes
    window.onhashchange = renderLifePage;
}


class LifePage {
    constructor() {
        this.generations = [new Life(0, 0)];
        this.generationInterval = null;
    }

    updateParams() {
        const linkParams = chisel.decodeParams();

        // Load?
        let width, height;
        const minWH = 5;
        const maxWH = 1000;
        let life = linkParams.load && Life.decode(linkParams.load);
        if (life && life.width >= minWH && life.width < maxWH && life.height >= minWH && life.height < maxWH) {
            [width, height] = [life.width, life.height];
        } else {
            life = life && undefined;
            width = Math.max(minWH, Math.min(maxWH, linkParams.width === undefined ? 50 : parseInt(linkParams.width, 10) || 0));
            height = Math.max(minWH, Math.min(maxWH, linkParams.height === undefined ? 50 : parseInt(linkParams.height, 10) || 0));
        }

        // Update params
        this.linkParams = linkParams;
        this.params = {
            'pause': !!life || linkParams.pause === 'true' || linkParams.pause === '1',
            'step': linkParams.step === 'true' || linkParams.step === '1',
            'reset': linkParams.reset === 'true' || linkParams.reset === '1',
            'cellx': linkParams.cellx && Math.max(0, parseInt(linkParams.cellx, 10) || 0),
            'celly': linkParams.celly && Math.max(0, parseInt(linkParams.celly, 10) || 0),
            'load': life,
            'save': linkParams.save === 'true' || linkParams.save === '1',
            'period': Math.max(0.0001, Math.min(60, linkParams.period === undefined ? 0.5 : parseFloat(linkParams.period) || 0)),
            'width': width,
            'height': height,
            'size': Math.max(2, Math.min(100, linkParams.size === undefined ? 10 : parseInt(linkParams.size, 10) || 0)),
            'gap': Math.max(0, Math.min(10, linkParams.gap === undefined ? 1 : parseInt(linkParams.gap, 10) || 0)),
            'depth': Math.max(1, Math.min(1000, linkParams.depth === undefined ? 2 : parseInt(linkParams.depth, 10) || 0)),
            'lifeRatio': Math.max(0, Math.min(1, linkParams.lifeRatio === undefined ? 0.25 : parseFloat(linkParams.lifeRatio) || 0)),
            'lifeBorder': Math.max(0, Math.min(0.45, linkParams.lifeBorder === undefined ? 0.1 : parseFloat(linkParams.lifeBorder) || 0)),
            'fill': linkParams.fill || '#2a803b',
            'stroke': linkParams.stroke || 'none',
            'strokeWidth': linkParams.strokeWidth || '1',
            'bgFill': linkParams.bgFill || '#ffffff',
            'bgStroke': linkParams.bgStroke || 'none',
            'bgStrokeWidth': linkParams.bgStrokeWidth || '1'
        };
    }

    get current() {
        return this.generations[this.generations.length - 1];
    }

    next() {
        // Cycle?  If yes and of insufficient depth, reset...
        let next = this.current.next();
        const foundIndex = this.generations.findIndex((life) => next.isEqual(life));
        if (foundIndex !== -1) {
            const foundDepth = this.generations.length - foundIndex;
            if (foundDepth <= this.params.depth) {
                this.generations = [];
                next = new Life(0, 0).resize(this.current.width, this.current.height, this.params.lifeRatio, this.params.lifeBorder);
            }
        }

        // Limit generations array size
        this.generations.push(next);
        if (this.generations.length >= this.params.depth * 2) {
            this.generations = this.generations.slice(this.params.depth);
        }
    }

    pageElements() {
        this.updateParams();

        // Clear/set the generation interval
        if (this.generationInterval !== null) {
            clearInterval(this.generationInterval);
            this.generationInterval = null;
        }
        if (!this.params.pause && !this.params.step) {
            this.generationInterval = setInterval(() => {
                this.next();
                chisel.render(document.getElementById('lifeSvg'), this.svgElements());
            }, this.params.period * 1000);
        }

        // Load?
        if (this.params.load) {
            this.generations = [this.params.load];
            if (!this.params.save) {
                window.location.href = chisel.href({
                    ...this.linkParams,
                    'load': undefined,
                    'width': this.params.width,
                    'height': this.params.height,
                    'pause': '1'
                });
                return null;
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
                window.location.href = chisel.href({...this.linkParams, 'reset': undefined});
                return null;
            } else if (this.params.step) {
                this.next();
                window.location.href = chisel.href({...this.linkParams, 'step': undefined, 'pause': '1'});
                return null;
            } else if (this.params.cellx !== undefined || this.params.celly !== undefined) {
                if (this.params.cellx !== undefined && this.params.cellx >= 0 && this.params.cellx < this.params.width &&
                    this.params.celly !== undefined && this.params.celly >= 0 && this.params.celly < this.params.height) {
                    this.current.setCell(this.params.cellx, this.params.celly, !this.current.cell(this.params.cellx, this.params.celly));
                }
                window.location.href = chisel.href({...this.linkParams, 'cellx': undefined, 'celly': undefined});
                return null;
            }
        }

        // Render
        const button = (text, params, section, first) => [
            first ? null : chisel.text(section ? ' | ' : chisel.nbsp + chisel.nbsp),
            chisel.elem('a', {'href': chisel.href({...this.linkParams, ...params})}, chisel.text(text))
        ];
        return [
            // Title
            chisel.elem('p', {'style': 'white-space: nowrap;'}, [
                chisel.elem('span', {'style': 'font-weight: bold;'}, chisel.text("Conway's Game of Life")),
                chisel.text(chisel.nbsp + chisel.nbsp),
                chisel.elem('a', {'href': 'https://github.com/craigahobbs/life'}, chisel.text('GitHub')),
                chisel.text(chisel.nbsp + chisel.nbsp),
                chisel.elem(
                    'a',
                    {'href': 'https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life', 'target': '_blank'},
                    chisel.text('Wikipedia')
                )
            ]),
            chisel.elem('p', {'style': 'white-space: nowrap;'}, [
                this.params.save ? [
                    button('Load', {'save': undefined}, false, true),
                    chisel.text(`${chisel.nbsp}${chisel.nbsp}${chisel.nbsp}<--${chisel.nbsp}${chisel.nbsp}
                                Bookmark this link or the page link to save.`)
                ] : [
                    button(this.params.pause ? 'Play' : 'Pause', {'pause': this.params.pause ? undefined : '1'}, false, true),
                    !this.params.pause ? null : [
                        button('Step', {'step': '1'}, true),
                        button('Save', {'load': this.current.encode(), 'save': '1'})
                    ],
                    button('Random', {'reset': '1'}, true),
                    button('Border', {'bgStroke': this.params.bgStroke === 'none' ? 'black' : undefined}),
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

    svgElements() {
        const svgWidth = this.params.gap + this.params.width * (this.params.size + this.params.gap);
        const svgHeight = this.params.gap + this.params.height * (this.params.size + this.params.gap);
        const cellElems = [];
        const svgElems = chisel.svgElem('svg', {'width': svgWidth, 'height': svgHeight}, cellElems);

        // Background
        cellElems.push(chisel.svgElem('rect', {
            'x': '0',
            'y': '0',
            'width': svgWidth,
            'height': svgHeight,
            'style': `fill: ${this.params.bgFill}; stroke: ${this.params.bgStroke}; stroke-width: ${this.params.bgStrokeWidth};`
        }));

        // Life cells
        for (let iy = 0; iy < this.current.height; iy++) {
            for (let ix = 0; ix < this.current.width; ix++) {
                if (this.current.cell(ix, iy) || this.params.pause) {
                    cellElems.push(chisel.svgElem('rect', {
                        'x': this.params.gap + ix * (this.params.size + this.params.gap),
                        'y': this.params.gap + iy * (this.params.size + this.params.gap),
                        'width': this.params.size,
                        'height': this.params.size,
                        'style': this.current.cell(ix, iy)
                            ? `fill: ${this.params.fill}; stroke: ${this.params.stroke}; stroke-width: ${this.params.strokeWidth};`
                            : 'fill: rgba(255, 255, 255, 0); stroke: none;',
                        '_callback': this.params.load || !this.params.pause ? undefined : (element) => {
                            element.addEventListener('click', () => {
                                window.location.href = chisel.href({...this.linkParams, 'cellx': ix, 'celly': iy});
                            });
                        }
                    }));
                }
            }
        }

        return svgElems;
    }
}


class Life {
    constructor(width, height, values) {
        this.width = width;
        this.height = height;
        if (values !== undefined && values.length === width * height) {
            this.values = values;
        } else {
            this.values = Array.from({'length': width * height}, () => false);
        }
    }

    cell(ix, iy) {
        return this.values[iy * this.width + ix];
    }

    setCell(ix, iy, value) {
        if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
            this.values[iy * this.width + ix] = value;
        }
    }

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

    resize(width, height, lifeRatio, borderRatio) {
        const values = [];
        const xBorderMin = borderRatio * width;
        const xBorderMax = (1 - borderRatio) * width;
        const yBorderMin = borderRatio * height;
        const yBorderMax = (1 - borderRatio) * height;
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

    encode() {
        const values = [];
        const radix = 36;

        // Count pairs of runs of 0's/1's
        let zeroCount = 0;
        let oneCount = 1;
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

    static decode(lifeString) {
        const [sWidth, sHeight, sValues] = lifeString.split('-');
        const width = parseInt(sWidth, 10) || 0;
        const height = parseInt(sHeight, 10) || 0;

        // Decode the values
        const values = [];
        if (sValues !== undefined) {
            for (let ix = 0; ix < sValues.length; ix++) {
                const count = parseInt(sValues[ix], 36);
                for (let ic = 0; ic < count; ic++) {
                    values.push(ix % 2 !== 0);
                }
            }
        }
        return new Life(width, height, values);
    }
}
