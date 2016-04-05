import {run} from '@cycle/core';
import {makeCanvasDriver} from '../../src/canvas-driver';
import {makeAnimationDriver} from 'cycle-animation-driver';
import {restart, restartable} from 'cycle-restart';
import isolate from '@cycle/isolate';
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
  Animation: restartable(makeAnimationDriver()),
  Canvas: restartable(makeCanvasDriver('.canvas', {width: 800, height: 600}), {pauseSinksWhileReplaying: false}),
  Keys: restartable(makeKeysDriver())
};

const {sinks, sources} = run(app, drivers);

if (module.hot) {
  module.hot.accept('./app', () => {
    app = require('./app').default;

    restart(app, drivers, {sinks, sources}, isolate);
  });
}
