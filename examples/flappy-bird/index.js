import {run} from '@cycle/core';
import {makeCanvasDriver} from '../../src/canvas-driver';
import {makeAnimationDriver} from 'cycle-animation-driver';
import keycode from 'keycode';
import {Observable} from 'rx';

var app = require('./app').default;

function makeKeysDriver () {
  const keydown$ = Observable.fromEvent(document, 'keydown');

  function isKey (key) {
    if (typeof key !== 'number') {
      key = keycode(key);
    }

    return (event) => {
      return event.keyCode === key;
    };
  }

  return function keysDriver () {
    return {
      pressed: (key) => keydown$.filter(isKey(key))
    };
  };
}

const drivers = {
  Animation: makeAnimationDriver(),
  Canvas: makeCanvasDriver('.canvas', {width: 800, height: 600}),
  Keys: makeKeysDriver()
};

run(app, drivers);
