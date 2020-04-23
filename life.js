// Licensed under the MIT License
// https://github.com/craigahobbs/life/blob/master/LICENSE

import * as chisel from './chisel.js';


export function main(parent) {
    let lifePage = new LifePage();

    // Listen for hash parameter changes
    window.onhashchange = function () {
        lifePage.render(parent);
    };

    // Render page
    lifePage.render(parent);
}


class LifePage {
    constructor() {
        this.generations = [new Life(0, 0)];
        this.generationInterval = null;
    }

    get current() {
        return this.generations[this.generations.length - 1];
    }

    static get params() {
        let params = chisel.decodeParams();
        const minWH = 5, maxWH = 1000;

        // Load?
        let width, height;
        let life = params.load && Life.decode(params.load);
        if (life && life.width >= minWH && life.width < maxWH && life.height >= minWH && life.height < maxWH) {
            [width, height] = [life.width, life.height];
        } else {
            life = life && undefined;
            width = Math.max(minWH, Math.min(maxWH, params.width === undefined ? 50 : parseInt(params.width) || 0));
            height = Math.max(minWH, Math.min(maxWH, params.height === undefined ? 50 : parseInt(params.height) || 0));
        }

        return [
            params,
            {
                'pause': !!life || params.pause === 'true' || params.pause === '1',
                'step': params.step === 'true' || params.step === '1',
                'reset': params.reset === 'true' || params.reset === '1',
                'cellx': params.cellx && Math.max(0, parseInt(params.cellx) || 0),
                'celly': params.celly && Math.max(0, parseInt(params.celly) || 0),
                'load': life,
                'save': params.save === 'true' || params.save === '1',
                'period': Math.max(0.0001, Math.min(60, params.period === undefined ? 0.5 : parseFloat(params.period) || 0)),
                'width': width,
                'height': height,
                'size': Math.max(2, Math.min(100, params.size === undefined ? 10 : parseInt(params.size) || 0)),
                'gap': Math.max(0, Math.min(10, params.gap === undefined ? 1 : parseInt(params.gap) || 0)),
                'depth': Math.max(1, Math.min(1000, params.depth === undefined ? 2 : parseInt(params.depth) || 0)),
                'lifeRatio': Math.max(0, Math.min(1, params.lifeRatio === undefined ? 0.25 : parseFloat(params.lifeRatio) || 0)),
                'lifeBorder': Math.max(0, Math.min(0.45, params.lifeBorder === undefined ? 0.1 : parseFloat(params.lifeBorder) || 0)),
                'fill': params.fill || '#2a803b',
                'stroke': params.stroke || 'none',
                'strokeWidth': params.strokeWidth || '1',
                'bgFill': params.bgFill || '#ffffff',
                'bgStroke': params.bgStroke || 'none',
                'bgStrokeWidth': params.bgStrokeWidth || '1'
            }
        ];
    }

    next(params) {
        // Cycle?  If yes and of insufficient depth, reset...
        let current = this.current;
        let next = current.next;
        let foundIndex = this.generations.findIndex((life) => next.isEqual(life));
        if (foundIndex !== -1) {
            let foundDepth = this.generations.length - foundIndex;
            if (foundDepth <= params.depth) {
                this.generations = [];
                next = new Life(0, 0).resize(current.width, current.height, params.lifeRatio, params.lifeBorder);
            }
        }

        // Limit generations array size
        this.generations.push(next);
        if (this.generations.length >= params.depth * 2) {
            this.generations = this.generations.slice(params.depth);
        }
    }

    render(parent) {
        let [linkParams, params] = LifePage.params;

        // Update life board, if necessary
        if (params.load) {
            this.generations = [params.load];
        } else if (params.reset) {
            this.generations = [new Life(0, 0).resize(params.width, params.height, params.lifeRatio, params.lifeBorder)];
        } else if (params.width !== this.current.width || params.height !== this.current.height) {
            this.generations = [this.current.resize(params.width, params.height, params.lifeRatio, params.lifeBorder)];
        }

        // Clear/set the generation interval
        if (this.generationInterval !== null) {
            clearInterval(this.generationInterval);
            this.generationInterval = null;
        }
        if (!params.pause && !params.step) {
            this.generationInterval = setInterval(() => {
                this.next(params);
                chisel.render(document.getElementById('lifeSvg'), LifePage.lifeSvg(linkParams, params, this.current));
            }, params.period * 1000);
        }

        // Step?
        if (params.step) {
            this.next(params);
        }

        // Navigate?
        if (params.load !== undefined) {
            if (!params.save) {
                window.location.href =
                    chisel.href({...linkParams, 'load': undefined, 'width': params.width, 'height': params.height, 'pause': '1'});
            }
        } else if (params.reset) {
            window.location.href = chisel.href({...linkParams, 'reset': undefined});
        } else if (params.step) {
            window.location.href = chisel.href({...linkParams, 'step': undefined, 'pause': '1'});
        } else if (params.cellx !== undefined || params.celly !== undefined) {
            if (params.cellx !== undefined && params.cellx >= 0 && params.cellx < params.width &&
                params.celly !== undefined && params.celly >= 0 && params.celly < params.height) {
                this.current.setCell(params.cellx, params.celly, !this.current.cell(params.cellx, params.celly));
            }
            window.location.href = chisel.href({...linkParams, 'cellx': undefined, 'celly': undefined});
        }

        // Render
        function button(text, params, section, first) {
            return [
                first ? null : chisel.text(section ? ' | ' : chisel.nbsp + chisel.nbsp),
                chisel.elem('a', {'href': chisel.href({...linkParams, ...params})}, chisel.text(text)),
            ];
        }
        chisel.render(parent, [
            // Title
            chisel.elem('p', {'style': 'white-space: nowrap;'}, [
                chisel.elem('span', {'style': 'font-weight: bold;'}, chisel.text("Conway's Game of Life")),
                chisel.text(chisel.nbsp + chisel.nbsp),
                chisel.elem('a', {'href': 'https://github.com/craigahobbs/life', 'target': '_blank'}, chisel.text('GitHub')),
                chisel.text(chisel.nbsp + chisel.nbsp),
                chisel.elem('a', {'href': 'https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life', 'target': '_blank'}, chisel.text('Wikipedia'))
            ]),
            chisel.elem('p', {'style': 'white-space: nowrap;'}, [
                params.save ? [
                    button('Load', {'save': undefined}, false, true),
                    chisel.text(chisel.nbsp + chisel.nbsp + chisel.nbsp + '<--' + chisel.nbsp + chisel.nbsp +
                                'Bookmark this link or the page link to save.')
                ] : [
                    button(params.pause ? 'Play' : 'Pause', {'pause': params.pause ? undefined : '1'}, false, true),
                    !params.pause ? null : [
                        button('Step', {'step': '1'}, true),
                        button('Save', {'load': this.current.encode(), 'save': '1'})
                    ],
                    button('Random', {'reset': '1'}, true),
                    button('Border', {'bgStroke': params.bgStroke === 'none' ? 'black' : undefined}),
                    button('<<Speed', {'period': params.period * 2}, true),
                    button('Speed>>', {'period': params.period / 2}),
                    button('<<Width', {'width': params.width - 5}, true),
                    button('Width>>', {'width': params.width + 5}),
                    button('<<Height', {'height': params.height - 5}, true),
                    button('Height>>', {'height': params.height + 5}),
                    button('<<Size', {'size': params.size - 2}, true),
                    button('Size>>', {'size': params.size + 2})
                ]
            ]),

            // Life SVG
            chisel.elem('p', {'id': 'lifeSvg'}, LifePage.lifeSvg(linkParams, params, this.current))
        ]);
    }

    static lifeSvg(linkParams, params, life) {
        let svgWidth = params.gap + params.width * (params.size + params.gap);
        let svgHeight = params.gap + params.height * (params.size + params.gap);
        let cellElems = [];
        let svgElems = chisel.svgElem('svg', {'width': svgWidth, 'height': svgHeight}, cellElems);

        // Background
        cellElems.push(chisel.svgElem('rect', {
            'x': '0',
            'y': '0',
            'width': svgWidth,
            'height': svgHeight,
            'style': 'fill: ' + params.bgFill + '; stroke: ' + params.bgStroke + '; stroke-width: ' + params.bgStrokeWidth + ';'
        }));

        // Life cells
        for (let iy = 0; iy < life.height; iy++) {
            for (let ix = 0; ix < life.width; ix++) {
                if (life.cell(ix, iy) || params.pause) {
                    cellElems.push(chisel.svgElem('rect', {
                        'x': params.gap + ix * (params.size + params.gap),
                        'y': params.gap + iy * (params.size + params.gap),
                        'width': params.size,
                        'height': params.size,
                        'style': life.cell(ix, iy) ?
                            'fill: ' + params.fill + '; stroke: ' + params.stroke + '; stroke-width: ' + params.strokeWidth + ';' :
                            'fill: rgba(255, 255, 255, 0); stroke: none;',
                        '_callback': !params.pause ? undefined : function(element) {
                            element.addEventListener('click', function() {
                                window.location.href = chisel.href({...linkParams, 'cellx': ix, 'celly': iy});
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
            this.values = Array.from({length: width * height}, (val, ix) => false);
        }
    }

    cell(ix, iy) {
        if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
            return this.values[iy * this.width + ix];
        }
        console.assert(false);
    }

    setCell(ix, iy, value) {
        if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
            this.values[iy * this.width + ix] = value;
        }
    }

    isEqual(other) {
        if (this.width !== other.width || this .height !== other.height) {
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
        let values = [];
        let x_border_min = borderRatio * width, x_border_max = (1 - borderRatio) * width;
        let y_border_min = borderRatio * height, y_border_max = (1 - borderRatio) * height;
        for (let iy = 0; iy < height; iy++) {
            for (let ix = 0; ix < width; ix++) {
                if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
                    values.push(this.cell(ix, iy));
                } else if (ix < x_border_min || ix >= x_border_max || iy < y_border_min || iy >= y_border_max) {
                    values.push(false);
                } else {
                    values.push(Math.random() < lifeRatio);
                }
            }
        }
        return new Life(width, height, values);
    }

    get next() {
        let values = [];
        let maxX = this.width - 1, maxY = this.height - 1;
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
        let values = [];
        const radix = 36;

        // Count pairs of runs of 0's/1's
        let zero_count = 0;
        let one_count = 1;
        let count_zeros = true;
        for (let iv = 0; iv < this.values.length; iv++) {
            let value = this.values[iv];
            if (count_zeros) {
                if (value) {
                    one_count = 1;
                    count_zeros = false;
                } else {
                    zero_count++;
                    if (zero_count >= radix - 1) {
                        one_count = 0;
                        count_zeros = false;
                    }
                }
            } else {
                if (value) {
                    one_count++;
                    if (one_count >= radix - 1) {
                        values.push(zero_count.toString(radix));
                        values.push(one_count.toString(radix));
                        zero_count = 0;
                        one_count = 0;
                        count_zeros = true;
                    }
                } else {
                    values.push(zero_count.toString(radix));
                    values.push(one_count.toString(radix));
                    zero_count = 1;
                    one_count = 0;
                    count_zeros = true;
                }
            }
        }
        if (zero_count || one_count) {
            values.push(zero_count.toString(radix));
            values.push(one_count.toString(radix));
        }

        return [this.width, this.height, values.join('')].join('-');
    }

    static decode(lifeString) {
        let [sWidth, sHeight, sValues] = lifeString.split('-');
        let width = parseInt(sWidth) || 0;
        let height = parseInt(sHeight) || 0;

        // Decode the values
        let values = [];
        if (sValues !== undefined) {
            for (let ix = 0; ix < sValues.length; ix++) {
                let count = parseInt(sValues[ix], 36);
                for (let ic = 0; ic < count; ic++) {
                    values.push(ix % 2 !== 0);
                }
            }
        }
        return new Life(width, height, values);
    }
}
