import {run} from '@cycle/rxjs-run';
import {makeCanvasDriver} from '../../src/canvas-driver';
import {timeDriver} from '@cycle/time/rxjs';
import keycode from 'keycode';
import {Observable} from 'rxjs/Observable';

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
  Time: timeDriver,
  Canvas: makeCanvasDriver('.canvas'),
  Keys: makeKeysDriver()
};

run(app, drivers);
