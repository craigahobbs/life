import * as chisel from '../src/chisel.js';
import {Life, LifePage} from '../src/life.js';
import browserEnv from 'browser-env';
import test from 'ava';

/* eslint-disable id-length */


// Add browser globals
browserEnv(['document', 'window']);


// LifePage tests

test('LifePage constructor', (t) => {
    const lifePage = new LifePage();
    t.deepEqual(lifePage.generations, [new Life(0, 0)]);
    t.is(lifePage.generationInterval, null);
    t.is(lifePage.linkParams, undefined);
    t.is(lifePage.params, undefined);
});

test('LifePage.updateParams', (t) => {
    const lifePage = new LifePage();
    lifePage.updateParams();
    t.deepEqual(lifePage.linkParams, {});
    t.deepEqual(lifePage.params, {
        'bgFill': '#ffffff',
        'bgStroke': 'none',
        'bgStrokeWidth': '1',
        'cellx': undefined,
        'celly': undefined,
        'depth': 2,
        'fill': '#2a803b',
        'gap': 1,
        'height': 50,
        'lifeBorder': 0.1,
        'lifeRatio': 0.25,
        'load': undefined,
        'pause': false,
        'period': 0.5,
        'reset': false,
        'save': false,
        'size': 10,
        'step': false,
        'stroke': 'none',
        'strokeWidth': '1',
        'width': 50
    });
});

test('LifePage.updateParams, load', (t) => {
    const lifePage = new LifePage();
    const encodedLife = '7-5-077777';
    const life = Life.decode(encodedLife);
    window.location.hash = `#load=${encodedLife}`;
    lifePage.updateParams();
    t.deepEqual(lifePage.linkParams, {
        'load': encodedLife
    });
    t.deepEqual(lifePage.params, {
        'bgFill': '#ffffff',
        'bgStroke': 'none',
        'bgStrokeWidth': '1',
        'cellx': undefined,
        'celly': undefined,
        'depth': 2,
        'fill': '#2a803b',
        'gap': 1,
        'height': 5,
        'lifeBorder': 0.1,
        'lifeRatio': 0.25,
        'load': life,
        'pause': true,
        'period': 0.5,
        'reset': false,
        'save': false,
        'size': 10,
        'step': false,
        'stroke': 'none',
        'strokeWidth': '1',
        'width': 7
    });
});

test('LifePage.updateParams, invalid load', (t) => {
    const lifePage = new LifePage();
    const encodedLife = '7-5-';
    const life = new Life(7, 5);
    window.location.hash = `#load=${encodedLife}`;
    lifePage.updateParams();
    t.deepEqual(lifePage.linkParams, {
        'load': encodedLife
    });
    t.deepEqual(lifePage.params, {
        'bgFill': '#ffffff',
        'bgStroke': 'none',
        'bgStrokeWidth': '1',
        'cellx': undefined,
        'celly': undefined,
        'depth': 2,
        'fill': '#2a803b',
        'gap': 1,
        'height': 5,
        'lifeBorder': 0.1,
        'lifeRatio': 0.25,
        'load': life,
        'pause': true,
        'period': 0.5,
        'reset': false,
        'save': false,
        'size': 10,
        'step': false,
        'stroke': 'none',
        'strokeWidth': '1',
        'width': 7
    });
});

test('LifePage.updateParams, too-small load', (t) => {
    const lifePage = new LifePage();
    const encodedLife = '2-2-22';
    window.location.hash = `#load=${encodedLife}`;
    lifePage.updateParams();
    t.deepEqual(lifePage.linkParams, {
        'load': encodedLife
    });
    t.deepEqual(lifePage.params, {
        'bgFill': '#ffffff',
        'bgStroke': 'none',
        'bgStrokeWidth': '1',
        'cellx': undefined,
        'celly': undefined,
        'depth': 2,
        'fill': '#2a803b',
        'gap': 1,
        'height': 50,
        'lifeBorder': 0.1,
        'lifeRatio': 0.25,
        'load': undefined,
        'pause': false,
        'period': 0.5,
        'reset': false,
        'save': false,
        'size': 10,
        'step': false,
        'stroke': 'none',
        'strokeWidth': '1',
        'width': 50
    });
});

test('LifePage.updateParams, bulk valid', (t) => {
    const lifePage = new LifePage();
    const args = {
        'pause': true,
        'step': true,
        'reset': true,
        'cellx': 5,
        'celly': 7,
        'save': true,
        'period': 0.125,
        'width': 17,
        'height': 13,
        'size': 7,
        'gap': 3,
        'depth': 5,
        'lifeRatio': 0.33,
        'lifeBorder': 0.2,
        'fill': '#808080',
        'stroke': '#000000',
        'strokeWidth': '2',
        'bgFill': '#c0c0c0',
        'bgStroke': '#ffffff',
        'bgStrokeWidth': '4'
    };
    window.location.hash = `#${chisel.encodeParams(args)}`;
    lifePage.updateParams();
    t.deepEqual(
        lifePage.linkParams,
        Object.fromEntries(Object.entries(args).map(([key, value]) => [key, String(value)]))
    );
    t.deepEqual(lifePage.params, {...args, 'load': undefined});
});

test('LifePage.updateParams, bulk invalid', (t) => {
    const lifePage = new LifePage();
    const args = {
        'pause': 'asdf',
        'step': 'asdf',
        'reset': 'asdf',
        'cellx': 'asdf',
        'celly': 'asdf',
        'save': 'asdf',
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
    lifePage.updateParams();
    t.deepEqual(lifePage.linkParams, args);
    t.deepEqual(lifePage.params, {
        'bgFill': 'asdf',
        'bgStroke': 'asdf',
        'bgStrokeWidth': 'asdf',
        'cellx': 0,
        'celly': 0,
        'depth': 0,
        'fill': 'asdf',
        'gap': 0,
        'height': 5,
        'lifeBorder': 0,
        'lifeRatio': 0,
        'load': undefined,
        'pause': false,
        'period': 0.0001,
        'reset': false,
        'save': false,
        'size': 2,
        'step': false,
        'stroke': 'asdf',
        'strokeWidth': 'asdf',
        'width': 5
    });
});

test('LifePage.updateParams, bulk too-small', (t) => {
    const lifePage = new LifePage();
    const args = {
        'cellx': -1,
        'celly': -1,
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
    lifePage.updateParams();
    t.deepEqual(
        lifePage.linkParams,
        Object.fromEntries(Object.entries(args).map(([key, value]) => [key, String(value)]))
    );
    t.deepEqual(lifePage.params, {
        'bgFill': '#ffffff',
        'bgStroke': 'none',
        'bgStrokeWidth': '1',
        'cellx': 0,
        'celly': 0,
        'depth': 0,
        'fill': '#2a803b',
        'gap': 0,
        'height': 5,
        'lifeBorder': 0,
        'lifeRatio': 0,
        'load': undefined,
        'pause': false,
        'period': 0.0001,
        'reset': false,
        'save': false,
        'size': 2,
        'step': false,
        'stroke': 'none',
        'strokeWidth': '1',
        'width': 5
    });
});

test('LifePage.updateParams, bulk too-large', (t) => {
    const lifePage = new LifePage();
    const args = {
        'cellx': 10000,
        'celly': 10000,
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
    lifePage.updateParams();
    t.deepEqual(
        lifePage.linkParams,
        Object.fromEntries(Object.entries(args).map(([key, value]) => [key, String(value)]))
    );
    t.deepEqual(lifePage.params, {
        'bgFill': '#ffffff',
        'bgStroke': 'none',
        'bgStrokeWidth': '1',
        'cellx': 999,
        'celly': 999,
        'depth': 1000,
        'fill': '#2a803b',
        'gap': 10,
        'height': 1000,
        'lifeBorder': 0.45,
        'lifeRatio': 1,
        'load': undefined,
        'pause': false,
        'period': 60,
        'reset': false,
        'save': false,
        'size': 100,
        'step': false,
        'stroke': 'none',
        'strokeWidth': '1',
        'width': 1000
    });
});

test('LifePage.next', (t) => {
    const lifePage = new LifePage();
    const life = new Life(3, 3, [
        false, true, false,
        false, true, false,
        false, true, false
    ]);
    window.location.hash = '#depth=0';
    lifePage.updateParams();
    lifePage.generations = [life];
    t.deepEqual(lifePage.current, life);
    lifePage.next();
    t.is(lifePage.generations.length, 1);
    t.deepEqual(lifePage.current, new Life(3, 3, [
        false, false, false,
        true, true, true,
        false, false, false
    ]));
    lifePage.next();
    t.is(lifePage.generations.length, 1, '2');
    t.deepEqual(lifePage.current, life);
});

test('LifePage.next, cycle', (t) => {
    const lifePage = new LifePage();
    const life = new Life(3, 3, [
        false, true, false,
        false, true, false,
        false, true, false
    ]);
    window.location.hash = '#depth=2&lifeRatio=0&lifeBorder=0';
    lifePage.updateParams();
    lifePage.generations = [life];
    t.deepEqual(lifePage.current, life);
    lifePage.next();
    t.is(lifePage.generations.length, 2);
    t.deepEqual(lifePage.current, new Life(3, 3, [
        false, false, false,
        true, true, true,
        false, false, false
    ]));
    lifePage.next();
    t.is(lifePage.generations.length, 1);
    t.deepEqual(lifePage.current, new Life(3, 3));
});

test('LifePage.next, cycle not found', (t) => {
    const lifePage = new LifePage();
    const life = new Life(3, 3, [
        false, true, false,
        false, true, false,
        false, true, false
    ]);
    window.location.hash = '#depth=1';
    lifePage.updateParams();
    lifePage.generations = [life];
    t.deepEqual(lifePage.current, life);
    lifePage.next();
    t.is(lifePage.generations.length, 2);
    t.deepEqual(lifePage.current, new Life(3, 3, [
        false, false, false,
        true, true, true,
        false, false, false
    ]));
    lifePage.next();
    t.is(lifePage.generations.length, 1);
    t.deepEqual(lifePage.current, life);
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
            'tag': 'p',
            'attrs': {'style': 'white-space: nowrap;'},
            'elems': [
                {'tag': 'span', 'attrs': {'style': 'font-weight: bold;'}, 'elems': {'text': "Conway's Game of Life"}},
                {'text': chisel.nbsp + chisel.nbsp},
                {'tag': 'a', 'attrs': {'href': 'https://github.com/craigahobbs/life'}, 'elems': {'text': 'GitHub'}},
                {'text': chisel.nbsp + chisel.nbsp},
                {
                    'tag': 'a',
                    'attrs': {'href': 'https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life', 'target': '_blank'},
                    'elems': {'text': 'Wikipedia'}
                }
            ]
        },
        {
            'tag': 'p',
            'attrs': {'style': 'white-space: nowrap;'},
            'elems': [
                [
                    [
                        null,
                        {'tag': 'a', 'attrs': {'href': 'blank#height=5&pause=1&width=5'}, 'elems': {'text': 'Pause'}}
                    ],
                    null,
                    [
                        {'text': ' | '},
                        {'tag': 'a', 'attrs': {'href': 'blank#height=5&reset=1&width=5'}, 'elems': {'text': 'Random'}}
                    ],
                    [
                        {'text': chisel.nbsp + chisel.nbsp},
                        {'tag': 'a', 'attrs': {'href': 'blank#bgStroke=black&height=5&width=5'}, 'elems': {'text': 'Border'}}
                    ],
                    [
                        {'text': ' | '},
                        {'tag': 'a', 'attrs': {'href': 'blank#height=5&period=1&width=5'}, 'elems': {'text': '<<Speed'}}
                    ],
                    [
                        {'text': chisel.nbsp + chisel.nbsp},
                        {'tag': 'a', 'attrs': {'href': 'blank#height=5&period=0.25&width=5'}, 'elems': {'text': 'Speed>>'}}
                    ],
                    [
                        {'text': ' | '},
                        {'tag': 'a', 'attrs': {'href': 'blank#height=5&width=0'}, 'elems': {'text': '<<Width'}}
                    ],
                    [
                        {'text': chisel.nbsp + chisel.nbsp},
                        {'tag': 'a', 'attrs': {'href': 'blank#height=5&width=10'}, 'elems': {'text': 'Width>>'}}
                    ],
                    [
                        {'text': ' | '},
                        {'tag': 'a', 'attrs': {'href': 'blank#height=0&width=5'}, 'elems': {'text': '<<Height'}}
                    ],
                    [
                        {'text': chisel.nbsp + chisel.nbsp},
                        {'tag': 'a', 'attrs': {'href': 'blank#height=10&width=5'}, 'elems': {'text': 'Height>>'}}
                    ],
                    [
                        {'text': ' | '},
                        {'tag': 'a', 'attrs': {'href': 'blank#height=5&size=8&width=5'}, 'elems': {'text': '<<Size'}}
                    ],
                    [
                        {'text': chisel.nbsp + chisel.nbsp},
                        {'tag': 'a', 'attrs': {'href': 'blank#height=5&size=12&width=5'}, 'elems': {'text': 'Size>>'}}
                    ]
                ]
            ]
        },
        {
            'tag': 'p',
            'attrs': {'id': 'lifeSvg'},
            'elems': {
                'tag': 'svg',
                'attrs': {'width': 56, 'height': 56},
                'elems': [
                    {
                        'tag': 'rect',
                        'attrs': {'x': '0', 'y': '0', 'width': 56, 'height': 56, 'style': 'fill: #ffffff; stroke: none; stroke-width: 1;'},
                        'ns': 'http://www.w3.org/2000/svg'
                    },
                    {
                        'tag': 'rect',
                        'attrs': {
                            '_callback': undefined, 'x': 12, 'y': 1, 'width': 10, 'height': 10,
                            'style': 'fill: #2a803b; stroke: none; stroke-width: 1;'
                        },
                        'ns': 'http://www.w3.org/2000/svg'
                    },
                    {
                        'tag': 'rect',
                        'attrs': {
                            '_callback': undefined, 'x': 1, 'y': 12, 'width': 10, 'height': 10,
                            'style': 'fill: #2a803b; stroke: none; stroke-width: 1;'
                        },
                        'ns': 'http://www.w3.org/2000/svg'}
                ],
                'ns': 'http://www.w3.org/2000/svg'
            }
        }
    ]);
});

test('LifePage.pageElements, pause', (t) => {
    const lifePage = new LifePage();
    const life = new Life(2, 2, [
        false, true,
        true, false
    ]);
    window.location.hash = '#width=5&height=5&pause=1&bgStroke=black';
    lifePage.updateParams();
    lifePage.generations = [life];

    // Overwrite lifePage.assignLocation
    const assignLocation = [];
    lifePage.assignLocation = (location) => {
        assignLocation.push(location);
    };

    // Check the SVG element callback functions
    const pageElements = lifePage.pageElements();
    const svgElements = pageElements[2].elems.elems;
    for (let ix = 1; ix < svgElements.length; ix++) {
        const element = svgElements[ix];
        t.is(element.tag, 'rect');

        // Call the callback
        const callback = element.attrs._callback;
        t.true(typeof callback === 'function');
        callback({
            'addEventListener': (event, onclick) => {
                t.is(event, 'click');
                t.is(typeof onclick, 'function');
                onclick();
            }
        });

        delete element.attrs._callback;
    }
    t.deepEqual(assignLocation, [
        'blank#bgStroke=black&cellx=0&celly=0&height=5&pause=1&width=5',
        'blank#bgStroke=black&cellx=1&celly=0&height=5&pause=1&width=5',
        'blank#bgStroke=black&cellx=0&celly=1&height=5&pause=1&width=5',
        'blank#bgStroke=black&cellx=1&celly=1&height=5&pause=1&width=5'
    ]);

    t.deepEqual(pageElements, [
        {
            'tag': 'p',
            'attrs': {'style': 'white-space: nowrap;'},
            'elems': [
                {'tag': 'span', 'attrs': {'style': 'font-weight: bold;'}, 'elems': {'text': "Conway's Game of Life"}},
                {'text': chisel.nbsp + chisel.nbsp},
                {'tag': 'a', 'attrs': {'href': 'https://github.com/craigahobbs/life'}, 'elems': {'text': 'GitHub'}},
                {'text': chisel.nbsp + chisel.nbsp},
                {
                    'tag': 'a',
                    'attrs': {'href': 'https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life', 'target': '_blank'},
                    'elems': {'text': 'Wikipedia'}
                }
            ]
        },
        {
            'tag': 'p',
            'attrs': {'style': 'white-space: nowrap;'},
            'elems': [
                [
                    [
                        null,
                        {'tag': 'a', 'attrs': {'href': 'blank#bgStroke=black&height=5&width=5'}, 'elems': {'text': 'Play'}}
                    ],
                    [
                        [
                            {'text': ' | '},
                            {
                                'tag': 'a',
                                'attrs': {'href': 'blank#bgStroke=black&height=5&pause=1&step=1&width=5'},
                                'elems': {'text': 'Step'}
                            }
                        ],
                        [
                            {'text': chisel.nbsp + chisel.nbsp},
                            {
                                'tag': 'a',
                                'attrs': {'href': 'blank#bgStroke=black&height=5&load=2-2-1210&pause=1&save=1&width=5'},
                                'elems': {'text': 'Save'}
                            }
                        ]
                    ],
                    [
                        {'text': ' | '},
                        {
                            'tag': 'a',
                            'attrs': {'href': 'blank#bgStroke=black&height=5&pause=1&reset=1&width=5'},
                            'elems': {'text': 'Random'}
                        }
                    ],
                    [
                        {'text': chisel.nbsp + chisel.nbsp},
                        {'tag': 'a', 'attrs': {'href': 'blank#height=5&pause=1&width=5'}, 'elems': {'text': 'Border'}}
                    ],
                    [
                        {'text': ' | '},
                        {
                            'tag': 'a',
                            'attrs': {'href': 'blank#bgStroke=black&height=5&pause=1&period=1&width=5'},
                            'elems': {'text': '<<Speed'}
                        }
                    ],
                    [
                        {'text': chisel.nbsp + chisel.nbsp},
                        {
                            'tag': 'a',
                            'attrs': {'href': 'blank#bgStroke=black&height=5&pause=1&period=0.25&width=5'},
                            'elems': {'text': 'Speed>>'}
                        }
                    ],
                    [
                        {'text': ' | '},
                        {'tag': 'a', 'attrs': {'href': 'blank#bgStroke=black&height=5&pause=1&width=0'}, 'elems': {'text': '<<Width'}}
                    ],
                    [
                        {'text': chisel.nbsp + chisel.nbsp},
                        {'tag': 'a', 'attrs': {'href': 'blank#bgStroke=black&height=5&pause=1&width=10'}, 'elems': {'text': 'Width>>'}}
                    ],
                    [
                        {'text': ' | '},
                        {'tag': 'a', 'attrs': {'href': 'blank#bgStroke=black&height=0&pause=1&width=5'}, 'elems': {'text': '<<Height'}}
                    ],
                    [
                        {'text': chisel.nbsp + chisel.nbsp},
                        {'tag': 'a', 'attrs': {'href': 'blank#bgStroke=black&height=10&pause=1&width=5'}, 'elems': {'text': 'Height>>'}}
                    ],
                    [
                        {'text': ' | '},
                        {'tag': 'a', 'attrs': {'href': 'blank#bgStroke=black&height=5&pause=1&size=8&width=5'}, 'elems': {'text': '<<Size'}}
                    ],
                    [
                        {'text': chisel.nbsp + chisel.nbsp},
                        {
                            'tag': 'a',
                            'attrs': {'href': 'blank#bgStroke=black&height=5&pause=1&size=12&width=5'},
                            'elems': {'text': 'Size>>'}
                        }
                    ]
                ]
            ]
        },
        {
            'tag': 'p',
            'attrs': {'id': 'lifeSvg'},
            'elems': {
                'tag': 'svg',
                'attrs': {'width': 56, 'height': 56},
                'elems': [
                    {
                        'tag': 'rect',
                        'attrs': {'x': '0', 'y': '0', 'width': 56, 'height': 56, 'style': 'fill: #ffffff; stroke: black; stroke-width: 1;'},
                        'ns': 'http://www.w3.org/2000/svg'
                    },
                    {
                        'tag': 'rect',
                        'attrs': {
                            'x': 1, 'y': 1, 'width': 10, 'height': 10,
                            'style': 'fill: rgba(255, 255, 255, 0); stroke: none;'
                        },
                        'ns': 'http://www.w3.org/2000/svg'
                    },
                    {
                        'tag': 'rect',
                        'attrs': {
                            'x': 12, 'y': 1, 'width': 10, 'height': 10,
                            'style': 'fill: #2a803b; stroke: none; stroke-width: 1;'
                        },
                        'ns': 'http://www.w3.org/2000/svg'
                    },
                    {
                        'tag': 'rect',
                        'attrs': {
                            'x': 1, 'y': 12, 'width': 10, 'height': 10,
                            'style': 'fill: #2a803b; stroke: none; stroke-width: 1;'
                        },
                        'ns': 'http://www.w3.org/2000/svg'
                    },
                    {
                        'tag': 'rect',
                        'attrs': {
                            'x': 12, 'y': 12, 'width': 10, 'height': 10,
                            'style': 'fill: rgba(255, 255, 255, 0); stroke: none;'
                        },
                        'ns': 'http://www.w3.org/2000/svg'
                    }
                ],
                'ns': 'http://www.w3.org/2000/svg'
            }
        }
    ]);
});

test('LifePage.render', (t) => {
    const lifePage = new LifePage();
    const assignLocation = [];
    lifePage.assignLocation = (location) => {
        // istanbul ignore next
        assignLocation.push(location);
    };

    // Validate initial render
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&pause=1';
    lifePage.render();
    t.deepEqual(assignLocation, []);
    t.deepEqual(lifePage.current, new Life(5, 5, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]));
    t.is(lifePage.generationInterval, null);
    t.deepEqual(lifePage.linkParams, {
        'height': '5',
        'lifeBorder': '0.2',
        'lifeRatio': '1',
        'pause': '1',
        'width': '5'
    });
    t.deepEqual(lifePage.params, {
        'bgFill': '#ffffff',
        'bgStroke': 'none',
        'bgStrokeWidth': '1',
        'cellx': undefined,
        'celly': undefined,
        'depth': 2,
        'fill': '#2a803b',
        'gap': 1,
        'height': 5,
        'lifeBorder': 0.2,
        'lifeRatio': 1,
        'load': undefined,
        'pause': true,
        'period': 0.5,
        'reset': false,
        'save': false,
        'size': 10,
        'step': false,
        'stroke': 'none',
        'strokeWidth': '1',
        'width': 5
    });
    t.is(
        document.body.innerHTML,
        '<p style="white-space: nowrap;">' +
            '<span style="font-weight: bold;">Conway\'s Game of Life</span>&nbsp;&nbsp;' +
            '<a href="https://github.com/craigahobbs/life">GitHub</a>&nbsp;&nbsp;' +
            '<a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life" target="_blank">Wikipedia</a>' +
            '</p>' +
            '<p style="white-space: nowrap;">' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;width=5">Play</a> | ' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=1&amp;step=1&amp;width=5">Step</a>&nbsp;&nbsp;' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;load=5-5-63232360&amp;pause=1&amp;save=1&amp;width=5">' +
            'Save</a> | ' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=1&amp;reset=1&amp;width=5">Random</a>&nbsp;&nbsp;' +
            '<a href="blank#bgStroke=black&amp;height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=1&amp;width=5">Border</a> | ' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=1&amp;period=1&amp;width=5">' +
            '&lt;&lt;Speed</a>&nbsp;&nbsp;' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=1&amp;period=0.25&amp;width=5">Speed&gt;&gt;</a> | ' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=1&amp;width=0">&lt;&lt;Width</a>&nbsp;&nbsp;' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=1&amp;width=10">Width&gt;&gt;</a> | ' +
            '<a href="blank#height=0&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=1&amp;width=5">&lt;&lt;Height</a>&nbsp;&nbsp;' +
            '<a href="blank#height=10&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=1&amp;width=5">Height&gt;&gt;</a> | ' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=1&amp;size=8&amp;width=5">&lt;&lt;Size</a>&nbsp;&nbsp;' +
            '<a href="blank#height=5&amp;lifeBorder=0.2&amp;lifeRatio=1&amp;pause=1&amp;size=12&amp;width=5">Size&gt;&gt;</a>' +
            '</p>' +
            '<p id="lifeSvg">' +
            '<svg width="56" height="56">' +
            '<rect x="0" y="0" width="56" height="56" style="fill: #ffffff; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="1" y="1" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="12" y="1" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="23" y="1" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="34" y="1" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="45" y="1" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="1" y="12" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="12" y="12" width="10" height="10" style="fill: #2a803b; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="12" width="10" height="10" style="fill: #2a803b; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="12" width="10" height="10" style="fill: #2a803b; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="45" y="12" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="1" y="23" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="12" y="23" width="10" height="10" style="fill: #2a803b; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="23" width="10" height="10" style="fill: #2a803b; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="23" width="10" height="10" style="fill: #2a803b; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="45" y="23" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="1" y="34" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="12" y="34" width="10" height="10" style="fill: #2a803b; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="23" y="34" width="10" height="10" style="fill: #2a803b; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="34" y="34" width="10" height="10" style="fill: #2a803b; stroke: none; stroke-width: 1;"></rect>' +
            '<rect x="45" y="34" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="1" y="45" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="12" y="45" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="23" y="45" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="34" y="45" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '<rect x="45" y="45" width="10" height="10" style="fill: rgba(255, 255, 255, 0); stroke: none;"></rect>' +
            '</svg>' +
            '</p>'
    );
});

test('LifePage.render, step', (t) => {
    const lifePage = new LifePage();
    const assignLocation = [];
    lifePage.assignLocation = (location) => {
        assignLocation.push(location);
    };

    // Step
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&pause=1&step=1';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocation, ['blank#height=5&lifeBorder=0.2&lifeRatio=1&pause=1&width=5']);
    t.deepEqual(lifePage.current.values, [
        false, false, true, false, false,
        false, true, false, true, false,
        true, false, false, false, true,
        false, true, false, true, false,
        false, false, true, false, false
    ]);
    t.is(lifePage.generationInterval, null);
    t.is(document.body.innerHTML, '');
});

test('LifePage.render, reset', (t) => {
    const lifePage = new LifePage();
    const assignLocation = [];
    lifePage.assignLocation = (location) => {
        assignLocation.push(location);
    };

    // Reset
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&pause=1&reset=1';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocation, ['blank#height=5&lifeBorder=0.2&lifeRatio=1&pause=1&width=5']);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]);
    t.is(lifePage.generationInterval, null);
    t.is(document.body.innerHTML, '');
});

test('LifePage.render, toggle cell', (t) => {
    const lifePage = new LifePage();
    const assignLocation = [];
    lifePage.assignLocation = (location) => {
        assignLocation.push(location);
    };
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&pause=1&cellx=2&celly=1';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocation, ['blank#height=5&lifeBorder=0.2&lifeRatio=1&pause=1&width=5']);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, true, false, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]);
    t.is(lifePage.generationInterval, null);
    t.is(document.body.innerHTML, '');
});

test('LifePage.render, invalid toggle cell', (t) => {
    const lifePage = new LifePage();
    const assignLocation = [];
    lifePage.assignLocation = (location) => {
        assignLocation.push(location);
    };
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&pause=1&cellx=99&celly=99';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocation, ['blank#height=5&lifeBorder=0.2&lifeRatio=1&pause=1&width=5']);
    t.deepEqual(lifePage.current.values, [
        false, false, false, false, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, true, true, true, false,
        false, false, false, false, false
    ]);
    t.is(lifePage.generationInterval, null);
    t.is(document.body.innerHTML, '');
});

test('LifePage.render, load', (t) => {
    const lifePage = new LifePage();
    const assignLocation = [];
    lifePage.assignLocation = (location) => {
        assignLocation.push(location);
    };
    window.location.hash = '#load=5-5-555550';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocation, ['blank#height=5&pause=1&width=5']);
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
    const assignLocation = [];
    lifePage.assignLocation = (location) => {
        // istanbul ignore next
        assignLocation.push(location);
    };
    window.location.hash = '#load=5-5-555550&save=1';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocation, []);
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
    const assignLocation = [];
    lifePage.assignLocation = (location) => {
        // istanbul ignore next
        assignLocation.push(location);
    };

    // Initial load
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocation, []);
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
    lifePage.onIntervalTimeout();
    t.deepEqual(lifePage.current.values, [
        false, false, true, false, false,
        false, true, false, true, false,
        true, false, false, false, true,
        false, true, false, true, false,
        false, false, true, false, false
    ]);
    t.not(document.body.innerHTML, loadInnerHTML);

    // Pause
    window.location.hash = '#width=5&height=5&lifeRatio=1&lifeBorder=0.2&pause=1';
    document.body.innerHTML = '';
    lifePage.render();
    t.deepEqual(assignLocation, []);
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

test('LifePage.main', (t) => {
    window.location.hash = '#';
    document.body.innerHTML = '';
    const onHashChange = LifePage.main(document.body);
    window.removeEventListener('hashchange', onHashChange, false);
    t.not(document.body.innerHTML, '');

    // Execute onHashChange to verify it renders and to clear the generation interval
    window.location.hash = '#pause=1';
    document.body.innerHTML = '';
    onHashChange();
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
    t.true(Life.decode('3-2').isEqual(new Life(3, 2)));
    t.true(Life.decode('3').isEqual(new Life(3, 0)));
    t.true(Life.decode('').isEqual(new Life(0, 0)));
    t.true(Life.decode('asdf').isEqual(new Life(0, 0)));
});
