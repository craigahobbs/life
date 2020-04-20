// Licensed under the MIT License
// https://github.com/craigahobbs/life/blob/master/LICENSE

import * as chisel from './chisel.js';

let gCells = null;
let gCellsPrev = null;
let gInterval = null;

export function main(parent) {
    // Listen for hash parameter changes
    window.onhashchange = function () {
        main(parent);
    };

    // Render page
    lifePage(parent);
}

function lifeParams() {
    let params = chisel.decodeParams();
    return [
        params,
        {
            'pause': params.pause === 'true' || params.pause === '1',
            'step': params.step === 'true' || params.step === '1',
            'reset': params.reset === 'true' || params.reset === '1',
            'cellx': params.cellx && Math.max(0, parseInt(params.cellx) || 0),
            'celly': params.celly && Math.max(0, parseInt(params.celly) || 0),
            'period': Math.max(0.0001, Math.min(60, params.period === undefined ? 1 : parseFloat(params.period) || 0)),
            'width': Math.max(5, Math.min(1000, params.width === undefined ? 50 : parseInt(params.width) || 0)),
            'height': Math.max(5, Math.min(1000, params.height === undefined ? 50 : parseInt(params.height) || 0)),
            'size': Math.max(2, Math.min(100, params.size === undefined ? 10 : parseInt(params.size) || 0)),
            'gap': Math.max(0, Math.min(10, params.gap === undefined ? 1 : parseInt(params.gap) || 0)),
            'threshold': Math.max(0, Math.min(1, params.threshold === undefined ? 0.25 : parseFloat(params.threshold) || 0)),
            'fill': params.fill || '#2a803b',
            'stroke': params.stroke || 'none',
            'strokeWidth': params.strokeWidth || '1',
            'bgFill': params.bgFill || '#ffffff',
            'bgStroke': params.bgStroke || 'none',
            'bgStrokeWidth': params.bgStrokeWidth || '1'
        }
    ];
}

function lifePage(parent) {
    let [linkParams, params] = lifeParams();

    // Generate random cells, if necessary
    if (params.reset || gCells === null) {
        gCells = randomCells(params.width, params.height, params.threshold);
    } else {
        // Cell width or height changed?
        let [cellsWidth, cellsHeight] = getCellsWidthHeight(gCells);
        if (params.width !== cellsWidth || params.height !== cellsHeight) {
            gCells = randomCells(params.width, params.height, params.threshold);
        }
    }

    // Function to advance to next generation
    function nextGeneration() {
        // Advance to next generation
        let cellsPrev2 = gCellsPrev;
        gCellsPrev = gCells;
        gCells = getNextCells(gCells);

        // Reset if cells unchanged after one or two generations
        if (cellsEqual(gCells, gCellsPrev) || (cellsPrev2 !== null && cellsEqual(gCells, cellsPrev2))) {
            gCells = randomCells(params.width, params.height, params.threshold);
        }
    }

    // Clear/set the generation interval
    if (gInterval !== null) {
        clearInterval(gInterval);
        gInterval = null;
    }
    if (!params.pause && !params.step) {
        gInterval = setInterval(function() {
            nextGeneration();
            chisel.render(document.getElementById('lifeSvg'), lifeSvg(linkParams, params, gCells));
        }, params.period * 1000);
    }

    // Step?
    if (params.step) {
        nextGeneration();
    }

    // Navigate?
    if (params.reset) {
        window.location.href = chisel.href({...linkParams, 'reset': undefined});
    } else if (params.step) {
        window.location.href = chisel.href({...linkParams, 'step': undefined, 'pause': '1'});
    } else if (params.cellx !== undefined || params.celly !== undefined) {
        if (params.cellx !== undefined && params.celly !== undefined && 0 <= params.cellx < params.width && 0 <= params.celly < params.height) {
            gCells[params.celly][params.cellx] = !gCells[params.celly][params.cellx];
        }
        window.location.href = chisel.href({...linkParams, 'cellx': undefined, 'celly': undefined});
    }

    // Render
    chisel.render(parent, [
        // Title
        chisel.elem('p', {'style': 'white-space: nowrap;'}, [
            chisel.elem('span', {'style': 'font-weight: bold;'}, chisel.text("Conway's Game of Life")),
            chisel.text(chisel.nbsp + chisel.nbsp),
            chisel.elem('a', {'href': 'https://github.com/craigahobbs/life', 'target': '_blank'}, chisel.text('GitHub')),
            chisel.text(chisel.nbsp + chisel.nbsp),
            chisel.elem('a', {'href': 'https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life', 'target': '_blank'}, chisel.text('Wikipedia')),
        ]),
        chisel.elem('p', {'style': 'white-space: nowrap;'}, [
            chisel.elem('a', {'href': chisel.href({...linkParams, 'pause': params.pause ? undefined : '1'})}, chisel.text(params.pause ? 'Play' : 'Pause')),
            chisel.text(chisel.nbsp + chisel.nbsp),
            chisel.elem('a', {'href': chisel.href({...linkParams, 'step': '1'})}, chisel.text('Step')),
            chisel.text(chisel.nbsp + chisel.nbsp),
            chisel.elem('a', {'href': chisel.href({...linkParams, 'reset': '1'})}, chisel.text('Random')),
            chisel.text(chisel.nbsp + chisel.nbsp + '['),
            chisel.elem('a', {'href': chisel.href({...linkParams, 'period': params.period * 2})}, chisel.text('Slower')),
            chisel.text(' ' + chisel.endash + ' '),
            chisel.elem('a', {'href': chisel.href({...linkParams, 'period': params.period / 2})}, chisel.text('Faster')),
            chisel.text(']' + chisel.nbsp + chisel.nbsp + '['),
            chisel.elem('a', {'href': chisel.href({...linkParams, 'width': params.width - 5})}, chisel.text('Width-')),
            chisel.text(' ' + chisel.endash + ' '),
            chisel.elem('a', {'href': chisel.href({...linkParams, 'width': params.width + 5})}, chisel.text('Width+')),
            chisel.text(']' + chisel.nbsp + chisel.nbsp + '['),
            chisel.elem('a', {'href': chisel.href({...linkParams, 'height': params.height - 5})}, chisel.text('Height-')),
            chisel.text(' ' + chisel.endash + ' '),
            chisel.elem('a', {'href': chisel.href({...linkParams, 'height': params.height + 5})}, chisel.text('Height+')),
            chisel.text(']' + chisel.nbsp + chisel.nbsp + '['),
            chisel.elem('a', {'href': chisel.href({...linkParams, 'size': params.size - 4})}, chisel.text('Size-')),
            chisel.text(' ' + chisel.endash + ' '),
            chisel.elem('a', {'href': chisel.href({...linkParams, 'size': params.size + 4})}, chisel.text('Size+')),
            chisel.text(']'),
        ]),

        // Life SVG
        chisel.elem('p', {'id': 'lifeSvg'}, lifeSvg(linkParams, params, gCells))
    ]);
}

function lifeSvg(linkParams, params, cells) {
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

    // Cells
    for (let iy = 0; iy < params.height; iy++) {
        for (let ix = 0; ix < params.width; ix++) {
            if (getCell(cells, ix, iy) || params.pause) {
                cellElems.push(chisel.svgElem('rect', {
                    'x': params.gap + ix * (params.size + params.gap),
                    'y': params.gap + iy * (params.size + params.gap),
                    'width': params.size,
                    'height': params.size,
                    'style': getCell(cells, ix, iy) ?
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

function randomCells(width, height, threshold) {
    let cells = [];
    for (let iy = 0; iy < height; iy++) {
        let row = [];
        cells.push(row);
        for (let ix = 0; ix < width; ix++) {
            row.push(Math.random() < threshold);
        }
    }
    return cells;
}

function getNextCells(cells) {
    return cells.map(function(row, iy) {
        return row.map(function(value, ix) {
            return getNextCell(cells, ix, iy);
        });
    });
}

function getNextCell(cells, ix, iy) {
    let count =
        getCell(cells, ix - 1, iy - 1) +
        getCell(cells, ix, iy - 1) +
        getCell(cells, ix + 1, iy - 1) +
        getCell(cells, ix - 1, iy) +
        getCell(cells, ix + 1, iy) +
        getCell(cells, ix - 1, iy + 1) +
        getCell(cells, ix, iy + 1) +
        getCell(cells, ix + 1, iy + 1);

    if (getCell(cells, ix, iy)) {
        return count === 2 || count === 3;
    } else {
        return count === 3;
    }
}

function getCell(cells, ix, iy) {
    if (ix < 0 || iy < 0 || iy >= cells.length || ix >= cells[iy].length) {
        return false;
    }
    return cells[iy][ix];
}

function getCellsWidthHeight(cells) {
    return [cells[0].length, cells.length];
}

function cellsEqual(cells1, cells2) {
    if (cells1.length !== cells2.length) {
        return false;
    }
    for (let iy = 0; iy < cells1.length; iy++) {
        if (cells1[iy].length !== cells2[iy].length) {
            return false;
        }
        for (let ix = 0; ix < cells1[iy].length; ix++) {
            if (cells1[iy][ix] !== cells2[iy][ix]) {
                return false;
            }
        }
    }
    return true;
}
