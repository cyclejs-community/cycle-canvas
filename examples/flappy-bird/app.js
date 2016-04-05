import {rect, text} from '../../src/canvas-driver';

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

      width: 30,
      height: 30,

      velocity: {
        x: 0,
        y: 0
      },

      flapCooldown: FLAP_COOLDOWN
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

    value: 'Game Over'
  };

  const subTextProps = {
    x: 0,
    y: 50,

    font: '25pt Arial',
    textAlign: 'center',

    value: 'Press Space to play again'
  };

  return (
    text(props, [
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

function updateBird (bird, normalizedDelta) {
  return {
    ...bird,

    velocity: {
      y: bird.velocity.y + GRAVITY * normalizedDelta
    },

    y: bird.y + bird.velocity.y * normalizedDelta,

    flapCooldown: bird.flapCooldown - normalizedDelta
  };
}

function update (delta) {
  const normalizedDelta = delta / FRAME_RATE;

  return function (state) {
    if (state.gameOver) {
      return state;
    }

    const isColliding = state.pipes.some(pipe => collide(state.bird, pipe));
    const isOffScreen = state.bird.y > 600;

    const gameOver = isColliding || isOffScreen;

    return {
      ...state,

      gameOver,

      bird: updateBird(state.bird, normalizedDelta),

      pipes: state.pipes.map(pipe => ({...pipe, x: pipe.x - normalizedDelta}))
    };
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
  const offset = Math.sin(i) * 80;
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

  const space$  = Keys.pressed('space');

  const flap$ = space$.map(flap);

  const resetGame$ = space$.map(resetGame);

  const spawnPipe$ = Observable.interval(4000).startWith(0).map(spawnPipe);

  const update$ = Animation.pluck('delta').map(update);

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
