import {div, button} from '@cycle/dom';

import {Observable} from 'rx';

import _ from 'lodash';

const FRAME_RATE = 1000 / 60;
const FLAP_IMPULSE = 8;
const GRAVITY = 0.09;
const FLAP_COOLDOWN = 20;

function renderPipe (pipe) {
  return [
    {
      kind: 'rect',
      x: 800 - pipe.right,
      y: pipe.offset,
      width: 50,
      height: 300,
      draw: [
        {fill: 'lime'},
        {stroke: 'black', lineWidth: 4}
      ]
    },

    {
      kind: 'rect',
      x: 800 - pipe.right,
      y: 300 + pipe.gap + pipe.offset,
      width: 50,
      height: 300,
      draw: [
        {fill: 'lime'},
        {stroke: 'black', lineWidth: 4}
      ]
    }
  ];
}

function view (state) {
  return [
    {
      kind: 'rect',
      x: state.bird.x,
      y: state.bird.y,
      width: state.bird.width,
      height: state.bird.height,
      draw: [
        {fill: 'orange'},
        {stroke: 'black', lineWidth: 2}
      ]
    },

    ..._.flatten(state.pipes.map(renderPipe))
  ];
}

function update (delta) {
  const normalizedDelta = delta / FRAME_RATE;

  return function (state) {
    state.bird.velocity.y += GRAVITY * normalizedDelta;

    state.bird.y += state.bird.velocity.y * normalizedDelta;

    state.bird.flapCooldown -= normalizedDelta;

    state.pipes.forEach(pipe => pipe.right += normalizedDelta);

    return state;
  };
}

function flap () {
  return function (state) {
    if (state.bird.flapCooldown <= 0) {
      state.bird.velocity.y -= FLAP_IMPULSE;
      state.bird.flapCooldown = FLAP_COOLDOWN;
    }

    return state;
  };
}

function spawnPipe (i) {
  return function (state) {
    return Object.assign(
      {},
      state,
      {
        pipes: state.pipes.concat({right: 0, gap: 200, offset: -50 +  Math.sin(i) * 50 + (Math.random() * 100 - 50)})
      }
    );
  }
}

export default function App ({Canvas, Keys, Animation}) {
  const initialState = {
    bird: {
      x: 90,
      y: 30,
      velocity: {
        x: 0,
        y: 0
      },
      flapCooldown: 0,
      width: 30,
      height: 30
    },

    pipes: []
  };

  const update$ = Animation.pluck('delta').map(update);
  const flap$ = Keys.pressed('space').map(flap);
  const spawnPipe$ = Observable.interval(4000).startWith(0).map(spawnPipe);

  const action$ = Observable.merge(
    update$,
    flap$,
    spawnPipe$
  );

  const state$ = action$
    .startWith(initialState)
    .scan((state, action) => action(state));

  return {
    Canvas: state$.map(view)
  };
}
