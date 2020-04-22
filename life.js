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
    const minWH = 5, maxWH = 1000;

    // Load?
    let cells = params.load && decodeCells(params.load, minWH, maxWH);
    let width, height;
    if (cells) {
        [width, height] = getCellsWidthHeight(cells);
    } else {
        width = Math.max(minWH, Math.min(maxWH, params.width === undefined ? 50 : parseInt(params.width) || 0));
        height = Math.max(minWH, Math.min(maxWH, params.height === undefined ? 50 : parseInt(params.height) || 0));
    }

    return [
        params,
        {
            'pause': !!cells || params.pause === 'true' || params.pause === '1',
            'step': params.step === 'true' || params.step === '1',
            'reset': params.reset === 'true' || params.reset === '1',
            'cellx': params.cellx && Math.max(0, parseInt(params.cellx) || 0),
            'celly': params.celly && Math.max(0, parseInt(params.celly) || 0),
            'load': cells,
            'save': params.save === 'true' || params.save === '1',
            'period': Math.max(0.0001, Math.min(60, params.period === undefined ? 0.5 : parseFloat(params.period) || 0)),
            'width': width,
            'height': height,
            'size': Math.max(2, Math.min(100, params.size === undefined ? 10 : parseInt(params.size) || 0)),
            'gap': Math.max(0, Math.min(10, params.gap === undefined ? 1 : parseInt(params.gap) || 0)),
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

function lifePage(parent) {
    let [linkParams, params] = lifeParams();

    // Update cells
    if (params.load) {
        gCellsPrev = null;
        gCells = params.load;
    } else {
        let gCellsUpdated = updateCells(params.reset ? null : gCells, params.width, params.height, params.lifeRatio, params.lifeBorder);
        if (gCellsUpdated) {
            gCellsPrev = null;
            gCells = gCellsUpdated;
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
            gCellsPrev = null;
            gCells = updateCells(null, params.width, params.height, params.lifeRatio, params.lifeBorder);
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
    if (params.load !== undefined) {
        if (!params.save) {
            window.location.href = chisel.href({...linkParams, 'load': undefined, 'width': params.width, 'height': params.height, 'pause': '1'});
        }
    } else if (params.reset) {
        window.location.href = chisel.href({...linkParams, 'reset': undefined});
    } else if (params.step) {
        window.location.href = chisel.href({...linkParams, 'step': undefined, 'pause': '1'});
    } else if (params.cellx !== undefined || params.celly !== undefined) {
        if (params.cellx !== undefined && params.cellx >= 0 && params.cellx < params.width &&
            params.celly !== undefined && params.celly >= 0 && params.celly < params.height) {
            gCells[params.celly][params.cellx] = !gCells[params.celly][params.cellx];
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
                chisel.text(chisel.nbsp + chisel.nbsp + chisel.nbsp + '<--' + chisel.nbsp + chisel.nbsp + 'Bookmark this link or the page link to save.')
            ] : [
                button(params.pause ? 'Play' : 'Pause', {'pause': params.pause ? undefined : '1'}, false, true),
                !params.pause ? null : [
                    button('Step', {'step': '1'}, true),
                    button('Save', {'load': encodeCells(gCells), 'save': '1'})
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

function updateCells(cells, width, height, threshold, border) {
    let changed = false;

    // Reset?
    if (!cells) {
        changed = true;
        cells = [[]];
    }

    // Cell width or height changed?
    let [cellsWidth, cellsHeight] = getCellsWidthHeight(cells);
    if (width !== cellsWidth || height !== cellsHeight) {
        changed = true;

        // Add/remove rows as needed
        if (cellsHeight > height) {
            for (let iy = cellsHeight - 1; iy >= height; iy--) {
                cells.pop();
            }
        } else if (cellsHeight < height) {
            for (let iy = cellsHeight; iy < height; iy++) {
                cells.push([]);
            }
        }

        // Add/remove columns as needed
        let min_x_border = border * width;
        let max_x_border = (1 - border) * width;
        let min_y_border = border * height;
        let max_y_border = (1 - border) * height;
        for (let iy = 0; iy < height; iy++) {
            let row = cells[iy];
            let rowLength = row.length;
            if (rowLength > width) {
                for (let ix = rowLength - 1; ix >= width; ix--) {
                    row.pop();
                }
            } else if (rowLength < width) {
                for (let ix = rowLength; ix < width; ix++) {
                    row.push(ix < min_x_border || ix > max_x_border || iy < min_y_border || iy > max_y_border ?
                             false : Math.random() < threshold);
                }
            }
        }
    }

    return changed && cells;
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

function encodeCells(cells) {
    let [width, height] = getCellsWidthHeight(cells);
    let values = [];

    // Count pairs of runs of 0's/1's
    let zero_count = 0;
    let one_count = 1;
    let count_zeros = true;
    for (let iy = 0; iy < height; iy++) {
        for (let ix = 0; ix < width; ix++) {
            let value = getCell(cells, ix, iy);
            if (count_zeros) {
                if (value) {
                    one_count = 1;
                    count_zeros = false;
                } else {
                    zero_count++;
                    if (zero_count >= 35) {
                        one_count = 0;
                        count_zeros = false;
                    }
                }
            } else {
                if (value) {
                    one_count++;
                    if (one_count >= 35) {
                        values.push(zero_count.toString(36));
                        values.push(one_count.toString(36));
                        zero_count = 0;
                        one_count = 0;
                        count_zeros = true;
                    }
                } else {
                    values.push(zero_count.toString(36));
                    values.push(one_count.toString(36));
                    zero_count = 1;
                    one_count = 0;
                    count_zeros = true;
                }
            }
        }
    }
    values.push(zero_count.toString(36));
    values.push(one_count.toString(36));

    return [width, height, values.join('')].join('-');
}

function decodeCells(sCells, minWH, maxWH) {
    let [sWidth, sHeight, sValues] = sCells.split('-');
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

    // Create the cells
    let cells = null;
    if (width >= minWH && width < maxWH && height >= minWH && height < maxWH && values.length === width * height) {
        cells = [];
        for (let iy = 0; iy < height; iy++) {
            let row = [];
            for (let ix = 0; ix < width; ix++) {
                row.push(values[iy * width + ix]);
            }
            cells.push(row);
        }
    }
    return cells;
}
