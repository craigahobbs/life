// Licensed under the MIT License
// https://github.com/craigahobbs/life/blob/master/LICENSE

import * as chisel from './chisel.js';

let gCells = null;
let gInterval = null;

export function main(parent) {
    // Listen for hash parameter changes
    window.onhashchange = function () {
        main(parent);
    };

    // Render page
    lifePage(parent);
}

function lifePage(parent) {
    let params = chisel.decodeParams(),
        size = params.size ? parseInt(params.size) : 9,
        width = params.width ? parseInt(params.width) : 50,
        height = params.height ? parseInt(params.height) : 50,
        threshold = params.threshold ? parseFloat(params.threshold) : 0.25,
        period = params.period ? parseFloat(params.period) : 1,
        reset = params.reset ? params.reset === 'true' || params.reset === '1' : false,
        play = params.play ? params.play === 'true' || params.play === '1' : true;

    // Generate random cells, if necessary
    if (reset || gCells === null) {
        gCells = randomCells(width, height, threshold);
        if (reset) {
            window.location.href = chisel.href({...params, 'reset': undefined});
        }
    } else {
        // Cell width or height changed?
        let [cellsWidth, cellsHeight] = getCellsWidthHeight(gCells);
        if (width !== cellsWidth || height !== cellsHeight) {
            gCells = randomCells(width, height, threshold);
        }
    }

    // Set the generation interval
    if (gInterval !== null) {
        clearInterval(gInterval);
        gInterval = null;
    }
    if (play) {
        gInterval = setInterval(function() {
            let cellsPrev = gCells;

            // Update cells
            gCells = getNextCells(gCells);
            if (cellsEqual(gCells, cellsPrev)) {
                gCells = randomCells(width, height, threshold);
            }

            // Render SVG
            chisel.render(document.getElementById('lifeSvg'), lifeSvg(params, size, gCells));
        }, period * 1000);
    }

    // Render
    chisel.render(parent, [
        // Title
        chisel.elem('p', {'style': 'white-space: nowrap;'}, [
            chisel.elem(
                'span',
                {'style': 'font-weight: bold;'},
                chisel.text("Conway's Game of Life")
            ),
            chisel.text(chisel.nbsp + chisel.nbsp),
            chisel.elem('a', {'href': 'https://github.com/craigahobbs/life', 'target': '_blank'}, chisel.text('GitHub')),
            chisel.text(chisel.nbsp + chisel.nbsp),
            chisel.elem('a', {'href': 'https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life', 'target': '_blank'}, chisel.text('Wikipedia')),
        ]),
        chisel.elem('p', {'style': 'white-space: nowrap;'}, [
            chisel.elem('a', {'href': chisel.href({...params, 'reset': '1'})}, chisel.text('Reset')),
            chisel.text(chisel.nbsp + chisel.nbsp),
            chisel.elem('a', {'href': chisel.href({...params, 'play': play ? '0' : undefined})}, chisel.text(play ? 'Pause' : 'Play')),
            chisel.text(chisel.nbsp + chisel.nbsp + '('),
            chisel.elem('a', {'href': chisel.href({...params, 'period': period * 2})}, chisel.text('Slower')),
            chisel.text(' ' + chisel.endash + ' '),
            chisel.elem('a', {'href': chisel.href({...params, 'period': period / 2})}, chisel.text('Faster')),
            chisel.text(')' + chisel.nbsp + chisel.nbsp + '('),
            chisel.elem('a', {'href': chisel.href({...params, 'width': Math.max(10, width - 10)})}, chisel.text('Width-')),
            chisel.text(' ' + chisel.endash + ' '),
            chisel.elem('a', {'href': chisel.href({...params, 'width': width + 10})}, chisel.text('Width+')),
            chisel.text(')' + chisel.nbsp + chisel.nbsp + '('),
            chisel.elem('a', {'href': chisel.href({...params, 'height': Math.max(10, height - 10)})}, chisel.text('Height-')),
            chisel.text(' ' + chisel.endash + ' '),
            chisel.elem('a', {'href': chisel.href({...params, 'height': height + 10})}, chisel.text('Height+')),
            chisel.text(')' + chisel.nbsp + chisel.nbsp + '('),
            chisel.elem('a', {'href': chisel.href({...params, 'size': Math.max(2, size - 1)})}, chisel.text('Size-')),
            chisel.text(' ' + chisel.endash + ' '),
            chisel.elem('a', {'href': chisel.href({...params, 'size': size + 1})}, chisel.text('Size+')),
            chisel.text(')'),
        ]),

        // Life SVG
        chisel.elem('p', {'id': 'lifeSvg'}, lifeSvg(params, size, gCells))
    ]);
}

function lifeSvg(params, size, cells) {
    let [width, height] = getCellsWidthHeight(cells),
        gap = params.gap ? parseInt(params.gap) : 1,
        svgWidth = gap + width * (size + gap),
        svgHeight = gap + height * (size + gap),
        fill = params.fill || '#2a803b',
        stroke = params.stroke || 'none',
        strokeWidth = params.strokeWidth || '1',
        bgFill = params.bgFill || '#ffffff',
        bgStroke = params.bgStroke || 'none',
        bgStrokeWidth = params.bgStrokeWidth || '1',
        cellElems = [],
        svgElems = chisel.svgElem('svg', {'width': svgWidth, 'height': svgHeight}, cellElems);

    // Background
    cellElems.push(chisel.svgElem('rect', {
            'x': '0',
            'y': '0',
            'width': svgWidth,
            'height': svgHeight,
            'style': 'fill: ' + bgFill + '; stroke: ' + bgStroke + '; stroke-width: ' + bgStrokeWidth + ';'
    }));

    // Cells
    for (let iy = 0; iy < height; iy++) {
        for (let ix = 0; ix < width; ix++) {
            if (getCell(cells, ix, iy)) {
                cellElems.push(chisel.svgElem('rect', {
                    'x': gap + ix * (size + gap),
                    'y': gap + iy * (size + gap),
                    'width': size,
                    'height': size,
                    'style': 'fill: ' + fill + '; stroke: ' + stroke + '; stroke-width: ' + strokeWidth + ';'
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
