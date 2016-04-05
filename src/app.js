import {rect, text} from './canvas-driver';

import {Observable} from 'rx';

import _ from 'lodash';
import collide from 'box-collide';

const FRAME_RATE = 1000 / 60;
const FLAP_IMPULSE = 8;
const GRAVITY = 0.09;
const FLAP_COOLDOWN = 20;

function startState () {
  return {
    bird: {
      x: 90,
      y: 30,
      velocity: {
        x: 0,
        y: 0
      },
      flapCooldown: FLAP_COOLDOWN,
      width: 30,
      height: 30
    },

    pipes: [],

    gameOver: false
  };
}

function renderPipe (pipe) {
  return (
    rect({
      ...pipe,

      draw: [
        {fill: 'lime'},
        {stroke: 'black', lineWidth: 4}
      ]
    })
  );
}

function renderBird (bird) {
  return (
    rect({
      ...bird,

      draw: [
        {fill: 'orange'},
        {stroke: 'black', lineWidth: 2}
      ]
    })
  );
}

function renderGameOverSplash () {
  const props = {
    x: 400,
    y: 300,

    font: '72pt Arial',
    textAlign: 'center',

    value: 'Game Over',

    draw: [
      {fill: 'black'}
    ]
  };

  const subTextProps = {
    value: 'Press Space to play again',
    font: '25pt Arial',
    textAlign: 'center',
    x: 0,
    y: 50,
    draw: [
      {fill: 'black'}
    ]
  };

  return (
    rect(props, [
      text({value: 'Press Space to play again', ...subTextProps})
    ])
  );
}

function view (state) {
  return (
    rect({draw: [{fill: 'skyblue'}]}, [
      renderBird(state.bird),

      ..._.flatten(state.pipes.map(renderPipe)),

      state.gameOver ? renderGameOverSplash() : null
    ])
  );
}

function update (delta) {
  const normalizedDelta = delta / FRAME_RATE;

  return function (state) {
    if (state.gameOver) {
      return state;
    }

    state.bird.velocity.y += GRAVITY * normalizedDelta;

    state.bird.y += state.bird.velocity.y * normalizedDelta;

    state.bird.flapCooldown -= normalizedDelta;

    state.pipes.forEach(pipe => pipe.x -= normalizedDelta);

    if (state.pipes.some(pipe => collide(state.bird, pipe)) || state.bird.y > 600) {
      state.gameOver = true;
    }

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
  const offset = Math.sin(i) * 50;
  const gap = 200;

  return function (state) {
    return {
      ...state,
      pipes: state.pipes.concat([
        {x: 800, y: -10, width: 60, height: 310 + offset - gap / 2},
        {x: 800, y: 300 + gap / 2 + offset, width: 60, height: 300}
      ])
    };
  };
}

function resetGame () {
  return function (state) {
    if (state.gameOver) {
      return startState();
    }

    return state;
  };
}

export default function App ({Canvas, Keys, Animation}) {
  const initialState = startState();

  const update$ = Animation.pluck('delta').map(update);
  const flap$ = Keys.pressed('space').map(flap);
  const resetGame$ = Keys.pressed('space').map(resetGame);
  const spawnPipe$ = Observable.interval(4000).startWith(0).map(spawnPipe);

  const action$ = Observable.merge(
    update$,
    flap$,
    spawnPipe$,
    resetGame$
  );

  const state$ = action$
    .startWith(initialState)
    .scan((state, action) => action(state));

  return {
    Canvas: state$.map(view)
  };
}
