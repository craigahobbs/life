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
    window.location.hash = chisel.encodeParams(args);
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
    window.location.hash = chisel.encodeParams(args);
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
    window.location.hash = chisel.encodeParams(args);
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
    window.location.hash = chisel.encodeParams(args);
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
    window.location.hash = `#depth=0`;
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
    window.location.hash = `#depth=2&lifeRatio=0&lifeBorder=0`;
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
    window.location.hash = `#depth=1`;
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
