import * as chisel from '../src/chisel.js';
import {Life, LifePage} from '../src/life.js';
import browserEnv from 'browser-env';
import test from 'ava';

/* eslint-disable id-length */


// Add browser globals
browserEnv(['document', 'window']);


// Test helper function to mock a LifePage instance's assignLocation method
function mockLifePageAssignLocation(lifePage) {
    const locations = [];
    lifePage.assignLocation = (location) => {
        locations.push(location);
    };
    return locations;
}


// Helper function to count and delete "_callback" attributes from an element model
function countAndDeleteCallbackAttributes(elements) {
    let count = 0;
    if (elements !== null) {
        if (Array.isArray(elements)) {
            for (const element of elements) {
                count += countAndDeleteCallbackAttributes(element);
            }
        } else {
            if ('attr' in elements && '_callback' in elements.attr) {
                count += 1;
                delete elements.attr._callback;
            }
            if ('elem' in elements) {
                count += countAndDeleteCallbackAttributes(elements.elem);
            }
        }
    }
    return count;
}


// LifePage tests

test('LifePage constructor', (t) => {
    const lifePage = new LifePage();
    t.deepEqual(lifePage.generations, [new Life(0, 0)]);
    t.is(lifePage.generationInterval, null);
    t.is(typeof lifePage.params, 'undefined');
    t.is(typeof lifePage.config, 'undefined');
});

test('LifePage.updateParams', (t) => {
    const lifePage = new LifePage();
    lifePage.updateParams();
    t.deepEqual(lifePage.params, {});
    t.deepEqual(lifePage.config, {
        'bgFill': 'white',
        'bgStroke': 'none',
        'bgStrokeWidth': 1,
        'depth': 6,
        'fill': 'forestgreen',
        'gap': 1,
        'height': 50,
        'lifeBorder': 0.1,
        'lifeRatio': 0.25,
        'pause': false,
        'period': 0.5,
        'size': 10,
        'stroke': 'none',
        'strokeWidth': 1,
        'width': 50
    });
});

test('LifePage.updateParams, bulk valid', (t) => {
    const lifePage = new LifePage();
    const args = {
        'bgFill': 'silver',
        'bgStroke': 'white',
        'bgStrokeWidth': 4,
        'depth': 5,
        'fill': 'gray',
        'gap': 3,
        'height': 13,
        'lifeBorder': 0.2,
        'lifeRatio': 0.33,
        'pause': false,
        'period': 0.125,
        'size': 7,
        'stroke': 'black',
        'strokeWidth': 2,
        'width': 17
    };
    window.location.hash = `#${chisel.encodeParams(args)}`;
    lifePage.updateParams();
    t.deepEqual(lifePage.params, args);
    t.deepEqual(lifePage.config, args);
});

test('LifePage.updateParams, bulk invalid', (t) => {
    const lifePage = new LifePage();
    const args = {
        'period': 'asdf',
        'width': 'asdf',
        'height': 'asdf',
        'size': 'asdf',
        'gap': 'asdf',
        'depth': 'asdf',
        'lifeRatio': 'asdf',
        'lifeBorder': 'asdf',
        'fill': 'asdf',
        'stroke': 'asdf',
        'strokeWidth': 'asdf',
        'bgFill': 'asdf',
        'bgStroke': 'asdf',
        'bgStrokeWidth': 'asdf'
    };
    window.location.hash = `#${chisel.encodeParams(args)}`;
    let errorMessage = null;
    try {
        lifePage.updateParams();
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, "Invalid value \"asdf\" (type 'string') for member 'width', expected type 'int'");
});

test('LifePage.updateParams, bulk too-small', (t) => {
    const lifePage = new LifePage();
    const args = {
        'period': -1,
        'width': -1,
        'height': -1,
        'size': -1,
        'gap': -1,
        'depth': -1,
        'lifeRatio': -1,
        'lifeBorder': -1
    };
    window.location.hash = `#${chisel.encodeParams(args)}`;
    let errorMessage = null;
    try {
        lifePage.updateParams();
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, "Invalid value -1 (type 'number') for member 'width', expected type 'int' [>= 5]");
});

test('LifePage.updateParams, bulk too-large', (t) => {
    const lifePage = new LifePage();
    const args = {
        'period': 10000,
        'width': 10000,
        'height': 10000,
        'size': 10000,
        'gap': 10000,
        'depth': 10000,
        'lifeRatio': 10000,
        'lifeBorder': 10000
    };
    window.location.hash = `#${chisel.encodeParams(args)}`;
    let errorMessage = null;
    try {
        lifePage.updateParams();
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, "Invalid value 10000 (type 'number') for member 'width', expected type 'int' [<= 1000]");
});

test('LifePage.pageElements', (t) => {
    const lifePage = new LifePage();
    const life = new Life(2, 2, [
        false, true,
        true, false
    ]);
    window.location.hash = '#width=5&height=5';
    lifePage.updateParams();
    lifePage.generations = [life];

    t.deepEqual(lifePage.pageElements(), [
        {
            'html': 'p',
            'elem': [
                {'html': 'span', 'attr': {'style': 'font-weight: bold; white-space: nowrap;'}, 'elem': {'text': "Conway's Game of Life"}},
                {'text': `${chisel.nbsp}${chisel.nbsp} `},
                {'html': 'a', 'attr': {'href': 'https://github.com/craigahobbs/life#readme'}, 'elem': {'text': 'GitHub'}},
                {'text': `${chisel.nbsp}${chisel.nbsp}`},
                {'html': 'a', 'attr': {'href': 'https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life'}, 'elem': {'text': 'Wikipedia'}}
            ]
        },
        {
            'html': 'p',
            'elem': [
                [
                    [
                        null,
                        {'html': 'a', 'attr': {'href': 'blank#height=5&pause=true&width=5'}, 'elem': {'text': 'Pause'}}
                    ],
                    null,
                    [
                        {'text': `${chisel.nbsp}| `},
                        {'html': 'a', 'attr': {'href': 'blank#bgStroke=black&height=5&width=5'}, 'elem': {'text': 'Border'}}
                    ],
                    [
                        {'text': `${chisel.nbsp}| `},
                        {'html': 'a', 'attr': {'href': 'blank#height=5&period=1&width=5'}, 'elem': {'text': '<<Speed'}}
                    ],
                    [
                        {'text': chisel.nbsp},
                        {'html': 'a', 'attr': {'href': 'blank#height=5&period=0.25&width=5'}, 'elem': {'text': 'Speed>>'}}
                    ],
                    [
                        {'text': `${chisel.nbsp}| `},
                        {'html': 'a', 'attr': {'href': 'blank#height=5&width=5'}, 'elem': {'text': '<<Width'}}
                    ],
                    [
                        {'text': chisel.nbsp},
                        {'html': 'a', 'attr': {'href': 'blank#height=5&width=10'}, 'elem': {'text': 'Width>>'}}
                    ],
                    [
                        {'text': `${chisel.nbsp}| `},
                        {'html': 'a', 'attr': {'href': 'blank#height=5&width=5'}, 'elem': {'text': '<<Height'}}
                    ],
                    [
                        {'text': chisel.nbsp},
                        {'html': 'a', 'attr': {'href': 'blank#height=10&width=5'}, 'elem': {'text': 'Height>>'}}
                    ],
                    [
                        {'text': `${chisel.nbsp}| `},
                        {'html': 'a', 'attr': {'href': 'blank#height=5&size=8&width=5'}, 'elem': {'text': '<<Size'}}
                    ],
                    [
                        {'text': chisel.nbsp},
                        {'html': 'a', 'attr': {'href': 'blank#height=5&size=12&width=5'}, 'elem': {'text': 'Size>>'}}
                    ]
                ]
            ]
        },
        {
            'html': 'p',
            'attr': {'id': 'lifeSVG'},
            'elem': {
                'svg': 'svg',
                'attr': {'_callback': null, 'width': '56', 'height': '56'},
                'elem': [
                    {
                        'svg': 'rect',
                        'attr': {'x': '0', 'y': '0', 'width': '56', 'height': '56', 'style': 'fill: white; stroke: none; stroke-width: 1;'}
                    },
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '12', 'y': '1', 'width': '10', 'height': '10',
                            'style': 'fill: forestgreen; stroke: none; stroke-width: 1;'
                        }
                    },
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '1', 'y': '12', 'width': '10', 'height': '10',
                            'style': 'fill: forestgreen; stroke: none; stroke-width: 1;'
                        }
                    }
                ]
            }
        }
    ]);
});

test('LifePage.pageElements, pause', (t) => {
    const lifePage = new LifePage();
    const assignLocations = mockLifePageAssignLocation(lifePage);
    const lifePageWidth = 2;
    const lifePageHeight = 2;
    const life = new Life(lifePageWidth, lifePageHeight, [
        false, true,
        true, false
    ]);
    window.location.hash = '#pause=true&width=5&height=5&bgStroke=black';
    lifePage.updateParams();
    lifePage.generations = [life];

    // Check the SVG element callback functions
    const pageElements = lifePage.pageElements();
    const svgElement = pageElements[2].elem;
    const [rectElement] = svgElement.elem;
    t.is(svgElement.svg, 'svg');
    t.is(rectElement.svg, 'rect');

    // Call the element creation callback
    const callback = svgElement.attr._callback;
    delete svgElement.attr._callback;
    t.true(typeof callback === 'function');
    rectElement.ownerSVGElement = svgElement;
    const svgBoundingRect = {'left': 10, 'top': 20};
    svgElement.getBoundingClientRect = () => svgBoundingRect;
    for (let iy = 0; iy < lifePageHeight; iy++) {
        for (let ix = 0; ix < lifePageWidth; ix++) {
            const clickEvent = {
                'target': rectElement,
                'clientX': svgBoundingRect.left + (ix + 1) * (lifePage.config.size + lifePage.config.gap),
                'clientY': svgBoundingRect.top + (iy + 1) * (lifePage.config.size + lifePage.config.gap)
            };
            callback({
                'addEventListener': (event, onclick) => {
                    t.is(event, 'click');
                    t.is(typeof onclick, 'function');
                    onclick(clickEvent);
                }
            });
        }
    }
    t.deepEqual(assignLocations, []);
    delete rectElement.ownerSVGElement;
    delete svgElement.getBoundingClientRect;

    t.is(countAndDeleteCallbackAttributes(pageElements), 3);
    t.deepEqual(pageElements, [
        {
            'html': 'p',
            'elem': [
                {'html': 'span', 'attr': {'style': 'font-weight: bold; white-space: nowrap;'}, 'elem': {'text': "Conway's Game of Life"}},
                {'text': `${chisel.nbsp}${chisel.nbsp} `},
                {'html': 'a', 'attr': {'href': 'https://github.com/craigahobbs/life#readme'}, 'elem': {'text': 'GitHub'}},
                {'text': `${chisel.nbsp}${chisel.nbsp}`},
                {'html': 'a', 'attr': {'href': 'https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life'}, 'elem': {'text': 'Wikipedia'}}
            ]
        },
        {
            'html': 'p',
            'elem': [
                [
                    [
                        null,
                        {'html': 'a', 'attr': {'href': 'blank#bgStroke=black&height=5&width=5'}, 'elem': {'text': 'Play'}}
                    ],
                    [
                        [
                            {'text': `${chisel.nbsp}| `},
                            {
                                'html': 'a',
                                'attr': {'href': 'blank#bgStroke=black&height=5&pause=true&width=5'},
                                'elem': {'text': 'Step'}
                            }
                        ],
                        [
                            {'text': chisel.nbsp},
                            {
                                'html': 'a',
                                'attr': {'href': 'blank#bgStroke=black&height=5&pause=true&width=5'},
                                'elem': {'text': 'Clear'}
                            }
                        ],
                        [
                            {'text': chisel.nbsp},
                            {
                                'html': 'a',
                                'attr': {'href': 'blank#bgStroke=black&height=5&pause=true&width=5'},
                                'elem': {'text': 'Random'}
                            }
                        ],
                        [
                            {'text': chisel.nbsp},
                            {
                                'html': 'a',
                                'attr': {'href': 'blank#bgStroke=black&height=5&pause=true&save=true&width=5'},
                                'elem': {'text': 'Save'}
                            }
                        ]
                    ],
                    [
                        {'text': `${chisel.nbsp}| `},
                        {'html': 'a', 'attr': {'href': 'blank#height=5&pause=true&width=5'}, 'elem': {'text': 'Border'}}
                    ],
                    [
                        {'text': `${chisel.nbsp}| `},
                        {
                            'html': 'a',
                            'attr': {'href': 'blank#bgStroke=black&height=5&pause=true&period=1&width=5'},
                            'elem': {'text': '<<Speed'}
                        }
                    ],
                    [
                        {'text': chisel.nbsp},
                        {
                            'html': 'a',
                            'attr': {'href': 'blank#bgStroke=black&height=5&pause=true&period=0.25&width=5'},
                            'elem': {'text': 'Speed>>'}
                        }
                    ],
                    [
                        {'text': `${chisel.nbsp}| `},
                        {
                            'html': 'a',
                            'attr': {'href': 'blank#bgStroke=black&height=5&pause=true&width=5'},
                            'elem': {'text': '<<Width'}
                        }
                    ],
                    [
                        {'text': chisel.nbsp},
                        {
                            'html': 'a',
                            'attr': {'href': 'blank#bgStroke=black&height=5&pause=true&width=10'},
                            'elem': {'text': 'Width>>'}
                        }
                    ],
                    [
                        {'text': `${chisel.nbsp}| `},
                        {
                            'html': 'a',
                            'attr': {'href': 'blank#bgStroke=black&height=5&pause=true&width=5'},
                            'elem': {'text': '<<Height'}
                        }
                    ],
                    [
                        {'text': chisel.nbsp},
                        {
                            'html': 'a',
                            'attr': {'href': 'blank#bgStroke=black&height=10&pause=true&width=5'},
                            'elem': {'text': 'Height>>'}
                        }
                    ],
                    [
                        {'text': `${chisel.nbsp}| `},
                        {
                            'html': 'a',
                            'attr': {'href': 'blank#bgStroke=black&height=5&pause=true&size=8&width=5'},
                            'elem': {'text': '<<Size'}
                        }
                    ],
                    [
                        {'text': chisel.nbsp},
                        {
                            'html': 'a',
                            'attr': {'href': 'blank#bgStroke=black&height=5&pause=true&size=12&width=5'},
                            'elem': {'text': 'Size>>'}
                        }
                    ]
                ]
            ]
        },
        {
            'html': 'p',
            'attr': {'id': 'lifeSVG'},
            'elem': {
                'svg': 'svg',
                'attr': {'width': '56', 'height': '56'},
                'elem': [
                    {
                        'svg': 'rect',
                        'attr': {'x': '0', 'y': '0', 'width': '56', 'height': '56', 'style': 'fill: white; stroke: black; stroke-width: 1;'}
                    },
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '12', 'y': '1', 'width': '10', 'height': '10',
                            'style': 'fill: forestgreen; stroke: none; stroke-width: 1;'
                        }
                    },
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '1', 'y': '12', 'width': '10', 'height': '10',
                            'style': 'fill: forestgreen; stroke: none; stroke-width: 1;'
                        }
                    }
                ]
            }
        }
    ]);
});

test('LifePage.run', (t) => {
    window.location.hash = '#pause=true';
    document.body.innerHTML = '';

    // Run the application
    const runCleanup = LifePage.run();
    t.is(document.title, '');
    t.true(document.body.innerHTML.startsWith('<p>'));

    // Step
    window.location.hash = '#pause=true&fill=chartreuse';
    runCleanup.windowRemoveEventListener[1]();
    t.is(document.title, '');
    t.true(document.body.innerHTML.startsWith('<p>'));
    t.not(document.body.innerHTML.search('fill: chartreuse'), -1);

    LifePage.runCleanup(runCleanup);
});

test('LifePage.render', (t) => {
    const lifePage = new LifePage();
    const assignLocations = mockLifePageAssignLocation(lifePage);

    // Validate initial render
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&pause=true';
    lifePage.render();
    t.deepEqual(assignLocations, []);
    t.deepEqual(lifePage.current, new Life(5, 5, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]));
    t.is(lifePage.generationInterval, null);
    t.deepEqual(lifePage.params, {
        'pause': true,
        'height': 5,
        'lifeBorder': 0.2,
        'lifeRatio': 1,
        'width': 5
    });
    t.deepEqual(lifePage.config, {
        'pause': true,
        'bgFill': 'white',
        'bgStroke': 'none',
        'bgStrokeWidth': 1,
        'depth': 6,
        'fill': 'forestgreen',
        'gap': 1,
        'height': 5,
        'lifeBorder': 0.2,
        'lifeRatio': 1,
        'period': 0.5,
        'size': 10,
        'stroke': 'none',
        'strokeWidth': 1,
        'width': 5
    });
    t.is(
        document.body.innerHTML,
        '<p>' +
            '<span style="font-weight: bold; white-space: nowrap;">Conway\'s Game of Life</span>&nbsp;&nbsp; ' +
            '<a href="https://github.com/craigahobbs/life#readme">GitHub</a>&nbsp;&nbsp;' +
            '<a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">Wikipedia</a>' +
            '</p>' +
            '<p>' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;width=5">Play</a>&nbsp;| ' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=true&amp;width=5">Step</a>&nbsp;' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=true&amp;width=5">Clear</a>&nbsp;' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=true&amp;width=5">Random</a>&nbsp;' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=true&amp;save=true&amp;width=5">Save</a>&nbsp;| ' +
            '<a href="blank#bgStroke=black&amp;height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=true&amp;width=5">' +
            'Border</a>&nbsp;| ' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=true&amp;period=1&amp;width=5">' +
            '&lt;&lt;Speed</a>&nbsp;' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=true&amp;period=0.25&amp;width=5">' +
            'Speed&gt;&gt;</a>&nbsp;| ' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=true&amp;width=5">&lt;&lt;Width</a>&nbsp;' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=true&amp;width=10">Width&gt;&gt;</a>&nbsp;| ' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=true&amp;width=5">&lt;&lt;Height</a>&nbsp;' +
            '<a href="blank#height=10&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=true&amp;width=5">Height&gt;&gt;</a>&nbsp;| ' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=true&amp;size=8&amp;width=5">' +
            '&lt;&lt;Size</a>&nbsp;' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=true&amp;size=12&amp;width=5">' +
            'Size&gt;&gt;</a></p>' +
            '<p id="lifeSVG">' +
            '<svg width="56" height="56">' +
            '<rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '</svg>' +
            '</p>'
    );
});

test('LifePage.render, error', (t) => {
    const lifePage = new LifePage();
    const assignLocations = mockLifePageAssignLocation(lifePage);

    // Clear
    window.location.hash = '#unknown=';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocations, []);
    t.deepEqual(lifePage.current.values, []);
    t.is(lifePage.generationInterval, null);
    t.is(document.body.innerHTML, "<p>Error: Unknown member 'unknown'</p>");
});

test('LifePage.next', (t) => {
    const lifePage = new LifePage();
    const assignLocations = mockLifePageAssignLocation(lifePage);

    // Initial render
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&pause=true';
    document.body.innerHTML = '';
    lifePage.render();
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]);

    // Step
    lifePage.next();
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="1" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="1" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="45" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="45" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.deepEqual(lifePage.current.values, [
        false, false, true, false, false,
        false, true, false, true, false,
        true, false, false, false, true,
        false, true, false, true, false,
        false, false, true, false, false
    ]);
});

test('LifePage.next, cycle', (t) => {
    const lifePage = new LifePage();
    lifePage.generations = [
        new Life(5, 5, [
            false, false, false, false, false,
            false, false, true, false, false,
            false, false, true, false, false,
            false, false, true, false, false,
            false, false, false, false, false
        ])
    ];
    const assignLocations = mockLifePageAssignLocation(lifePage);

    // Initial render
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&pause=true';
    document.body.innerHTML = '';
    lifePage.render();
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.is(lifePage.generations.length, 1);

    // Step
    lifePage.next();
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.is(lifePage.generations.length, 2);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, false, false, false, false,
        false, true, true, true, false,
        false, false, false, false, false,
        false, false, false, false, false
    ]);

    // Step again
    lifePage.next();
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.is(lifePage.generations.length, 1);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]);
});

test('LifePage.next, cycle not found', (t) => {
    const lifePage = new LifePage();
    lifePage.generations = [
        new Life(5, 5, [
            false, false, false, false, false,
            false, false, true, false, false,
            false, false, true, false, false,
            false, false, true, false, false,
            false, false, false, false, false
        ])
    ];
    const assignLocations = mockLifePageAssignLocation(lifePage);

    // Initial render
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&pause=true&depth=1';
    document.body.innerHTML = '';
    lifePage.render();
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.is(lifePage.generations.length, 1);

    // Step
    lifePage.next();
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.is(lifePage.generations.length, 2);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, false, false, false, false,
        false, true, true, true, false,
        false, false, false, false, false,
        false, false, false, false, false
    ]);

    // Step again
    lifePage.next();
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.is(lifePage.generations.length, 1);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, false, true, false, false,
        false, false, true, false, false,
        false, false, true, false, false,
        false, false, false, false, false
    ]);
});

test('LifePage.clear', (t) => {
    const lifePage = new LifePage();
    const assignLocations = mockLifePageAssignLocation(lifePage);

    // Initial render
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&pause=true';
    document.body.innerHTML = '';
    lifePage.render();
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]);

    // Clear
    lifePage.clear();
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56">' +
            '<rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, false, false, false, false,
        false, false, false, false, false,
        false, false, false, false, false,
        false, false, false, false, false
    ]);
});

test('LifePage.randomize', (t) => {
    const lifePage = new LifePage();
    const assignLocations = mockLifePageAssignLocation(lifePage);

    // Initial render
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&pause=true';
    document.body.innerHTML = '';
    lifePage.generations = [
        new Life(5, 5, [
            true, false, false, false, true,
            false, true, false, true, false,
            false, false, true, false, false,
            false, true, false, true, false,
            true, false, false, false, true
        ])
    ];
    lifePage.render();
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="1" y="1" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="45" y="1" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="1" y="45" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="45" y="45" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);

    // Randomize
    lifePage.randomize();
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]);
});

test('LifePage.toggleCell', (t) => {
    const lifePage = new LifePage();
    const assignLocations = mockLifePageAssignLocation(lifePage);

    // Initial render
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&pause=true';
    document.body.innerHTML = '';
    lifePage.render();
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]);

    // Toggle a cell
    lifePage.toggleCell(2, 1);
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, true, false, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]);
});

test('LifePage.toggleCell, invalid', (t) => {
    const lifePage = new LifePage();
    const assignLocations = mockLifePageAssignLocation(lifePage);

    // Initial render
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&pause=true';
    document.body.innerHTML = '';
    lifePage.render();
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]);

    // Toggle a cell
    lifePage.toggleCell(5, 5);
    t.is(
        document.body.innerHTML.slice(document.body.innerHTML.indexOf('<svg'), document.body.innerHTML.indexOf('</svg>') + 6),
        '<svg width="56" height="56"><rect x="0" y="0" width="56" height="56" style="fill: white; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="12" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="23" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="12" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="34" width="10" height="10" style="fill: forestgreen; stroke: none; stroke-width: 1;"></rect></svg>'
    );
    t.deepEqual(assignLocations, []);
    t.is(lifePage.generationInterval, null);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]);
});

test('LifePage.render, load', (t) => {
    const lifePage = new LifePage();
    const assignLocations = mockLifePageAssignLocation(lifePage);

    window.location.hash = '#load=5-5-555550&pause=true';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocations, ['blank#height=5&pause=true&width=5']);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        true, true, true, true, true,
        false, false, false, false, false,
        true, true, true, true, true,
        false, false, false, false, false
    ]);
    t.is(lifePage.generationInterval, null);
    t.is(document.body.innerHTML, '');
});

test('LifePage.render, load error', (t) => {
    const lifePage = new LifePage();
    const assignLocations = mockLifePageAssignLocation(lifePage);

    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&load=5-5-XXX&pause=true';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocations, []);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]);
    t.is(lifePage.generationInterval, null);
    t.is(document.body.innerHTML, '<p>Error: Invalid load data</p>');
});

test('LifePage.render, load play', (t) => {
    const lifePage = new LifePage();
    const assignLocations = mockLifePageAssignLocation(lifePage);

    window.location.hash = '#load=5-5-555550';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocations, ['blank#height=5&width=5']);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        true, true, true, true, true,
        false, false, false, false, false,
        true, true, true, true, true,
        false, false, false, false, false
    ]);
    t.is(lifePage.generationInterval, null);
    t.is(document.body.innerHTML, '');
});

test('LifePage.render, save', (t) => {
    const lifePage = new LifePage();
    const life = new Life(5, 5, [
        false, false, false, false, false,
        true, true, true, true, true,
        false, false, false, false, false,
        true, true, true, true, true,
        false, false, false, false, false
    ]);
    lifePage.generations = [life];
    const assignLocations = mockLifePageAssignLocation(lifePage);

    window.location.hash = '#height=5&width=5&save=true';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocations, []);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        true, true, true, true, true,
        false, false, false, false, false,
        true, true, true, true, true,
        false, false, false, false, false
    ]);
    t.is(lifePage.generationInterval, null);
    t.not(document.body.innerHTML, '');
});

test('LifePage.render, play', (t) => {
    const lifePage = new LifePage();
    const assignLocations = mockLifePageAssignLocation(lifePage);

    // Initial load
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocations, []);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]);
    t.not(lifePage.generationInterval, null);
    t.not(document.body.innerHTML, '');

    // Execute the generation interval
    const loadInnerHTML = document.body.innerHTML;
    lifePage.next();
    t.deepEqual(lifePage.current.values, [
        false, false, true, false, false,
        false, true, false, true, false,
        true, false, false, false, true,
        false, true, false, true, false,
        false, false, true, false, false
    ]);
    t.not(document.body.innerHTML, loadInnerHTML);

    // Pause
    window.location.hash = '#pause=true&width=5&height=5&lifeRatio=1&lifeBorder=0.2';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocations, []);
    t.deepEqual(lifePage.current.values, [
        false, false, true, false, false,
        false, true, false, true, false,
        true, false, false, false, true,
        false, true, false, true, false,
        false, false, true, false, false
    ]);
    t.is(lifePage.generationInterval, null);
    t.not(document.body.innerHTML, '');
});


// Life tests

test('Life constructor', (t) => {
    const life = new Life(3, 2);
    t.is(life.width, 3);
    t.is(life.height, 2);
    t.deepEqual(life.values, [false, false, false, false, false, false]);
});

test('Life constructor, values provided', (t) => {
    const life = new Life(3, 2, [false, true, false, true, false, true]);
    t.is(life.width, 3);
    t.is(life.height, 2);
    t.deepEqual(life.values, [false, true, false, true, false, true]);
});

test('Life constructor, invalid values provided', (t) => {
    // Invalid: values.length !== width * height
    const life = new Life(3, 2, [false, true, false, true]);
    t.is(life.width, 3);
    t.is(life.height, 2);
    t.deepEqual(life.values, [false, false, false, false, false, false]);
});

test('Life constructor, zero-sized', (t) => {
    const life = new Life(0, 0);
    t.is(life.width, 0);
    t.is(life.height, 0);
    t.deepEqual(life.values, []);
});

test('Life constructor, negative width and height', (t) => {
    const life = new Life(-3, -2);
    t.is(life.width, 0);
    t.is(life.height, 0);
    t.deepEqual(life.values, []);
});

test('Life.cell', (t) => {
    const life = new Life(3, 2, [false, true, false, true, false, true]);
    t.is(life.cell(0, 0), false);
    t.is(life.cell(1, 0), true);
    t.is(life.cell(2, 0), false);
    t.is(life.cell(0, 1), true);
    t.is(life.cell(1, 1), false);
    t.is(life.cell(2, 1), true);
});

test('Life.setCell', (t) => {
    const life = new Life(2, 2);
    t.is(life.cell(0, 0), false);
    life.setCell(0, 0, true);
    t.is(life.cell(0, 0), true);
});

test('Life.isEqual', (t) => {
    const life = new Life(3, 2, [false, true, false, true, false, true]);
    t.true(life.isEqual(new Life(3, 2, [false, true, false, true, false, true])));
    t.false(life.isEqual(new Life(3, 2, [false, false, false, false, false, false])));
    t.false(life.isEqual(new Life(3, 2, [true, true, true, true, true, true])));
    t.false(life.isEqual(new Life(3, 1, [false, true, false])));
    t.false(life.isEqual(new Life(2, 2, [false, true, false, true])));
});

test('Life.resize', (t) => {
    const life = new Life(0, 0).resize(5, 5, 1, 0.2);
    let other;

    t.true(life.isEqual(new Life(5, 5, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ])));

    other = life.resize(5, 5, 1, 0);
    t.true(other.isEqual(new Life(5, 5, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ])));

    other = life.resize(3, 3, 1, 0);
    t.true(other.isEqual(new Life(3, 3, [
        false, false, false,
        false, true, true,
        false, true, true
    ])));

    other = life.resize(6, 6, 1, 0);
    t.true(other.isEqual(new Life(6, 6, [
        false, false, false, false, false, true,
        false, true, true, true, false, true,
        false, true, true, true, false, true,
        false, true, true, true, false, true,
        false, false, false, false, false, true,
        true, true, true, true, true, true
    ])));
});

test('Life.next', (t) => {
    const life = new Life(3, 3, [
        false, true, false,
        false, true, false,
        false, true, false
    ]);
    const next = life.next();
    t.true(next.isEqual(new Life(3, 3, [
        false, false, false,
        true, true, true,
        false, false, false
    ])));
    const nextNext = next.next();
    t.true(nextNext.isEqual(life));
});

test('Life.encode', (t) => {
    t.is('3-2-60', new Life(3, 2, [
        false, false, false,
        false, false, false
    ]).encode());
    t.is('3-2-06', new Life(3, 2, [
        true, true, true,
        true, true, true
    ]).encode());
    t.is('3-2-0420', new Life(3, 2, [
        true, true, true,
        true, false, false
    ]).encode());
    t.is('3-2-42', new Life(3, 2, [
        false, false, false,
        false, true, true
    ]).encode());
    t.is('6-3-01346310', new Life(6, 3, [
        true, false, false, false, true, true,
        true, true, false, false, false, false,
        false, false, true, true, true, false
    ]).encode());
    t.is('35-1-z0', new Life(35, 1).encode());
    t.is('36-1-z010', new Life(36, 1).encode());
    t.is('35-1-0z', new Life(35, 1, Array.from({'length': 35}, () => true)).encode());
    t.is('36-1-0z01', new Life(36, 1, Array.from({'length': 36}, () => true)).encode());
});

test('Life.decode', (t) => {
    t.true(Life.decode('3-2-60').isEqual(new Life(3, 2, [
        false, false, false,
        false, false, false
    ])));
    t.true(Life.decode('3-2-06').isEqual(new Life(3, 2, [
        true, true, true,
        true, true, true
    ])));
    t.true(Life.decode('3-2-0420').isEqual(new Life(3, 2, [
        true, true, true,
        true, false, false
    ])));
    t.true(Life.decode('3-2-42').isEqual(new Life(3, 2, [
        false, false, false,
        false, true, true
    ])));
    t.true(Life.decode('6-3-01346310').isEqual(new Life(6, 3, [
        true, false, false, false, true, true,
        true, true, false, false, false, false,
        false, false, true, true, true, false
    ])));
    t.true(Life.decode('35-1-z0').isEqual(new Life(35, 1)));
    t.true(Life.decode('36-1-z010').isEqual(new Life(36, 1)));
    t.true(Life.decode('35-1-0z').isEqual(new Life(35, 1, Array.from({'length': 35}, () => true))));
    t.true(Life.decode('36-1-0z01').isEqual(new Life(36, 1, Array.from({'length': 36}, () => true))));
});

test('Life.decode, invalid', (t) => {
    t.is(Life.decode('3-2-70'), null);
    t.is(Life.decode('3-2'), null);
    t.is(Life.decode('3'), null);
    t.is(Life.decode(''), null);
    t.is(Life.decode('asdf-asdf-asdf'), null);
    t.is(Life.decode('asdf-asdf'), null);
    t.is(Life.decode('asdf'), null);
});
