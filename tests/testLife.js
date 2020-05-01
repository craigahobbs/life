import {Life} from '../src/life.js';
import test from 'ava';

/* eslint-disable id-length */

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

test('Life constructor, bogus values provided', (t) => {
    // Bogus: values.length !== width * height
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
    t.is(
        '3-2-60',
        new Life(3, 2, [
            false, false, false,
            false, false, false
        ]).encode()
    );
    t.is(
        '3-2-06',
        new Life(3, 2, [
            true, true, true,
            true, true, true
        ]).encode()
    );
    t.is(
        '3-2-0420',
        new Life(3, 2, [
            true, true, true,
            true, false, false
        ]).encode()
    );
    t.is(
        '3-2-42',
        new Life(3, 2, [
            false, false, false,
            false, true, true
        ]).encode()
    );
    t.is(
        '6-3-01346310',
        new Life(6, 3, [
            true, false, false, false, true, true,
            true, true, false, false, false, false,
            false, false, true, true, true, false
        ]).encode()
    );
    t.is(
        '35-1-z0',
        new Life(35, 1).encode()
    );
    t.is(
        '36-1-z010',
        new Life(36, 1).encode()
    );
    t.is(
        '35-1-0z',
        new Life(35, 1, Array.from({'length': 35}, () => true)).encode()
    );
    t.is(
        '36-1-0z01',
        new Life(36, 1, Array.from({'length': 36}, () => true)).encode()
    );
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
