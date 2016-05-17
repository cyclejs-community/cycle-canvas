/* globals describe, it */
import {translateVtreeToInstructions, renderInstructionsToCanvas, rect} from '../src/canvas-driver';
import assert from 'assert';

function methodSpy () {
  let called = 0;
  let callArgs = [];

  const stub = (...args) => {
    called += 1;
    callArgs.push(args);
  }

  stub.callCount = () => called;
  stub.callArgs = () => callArgs;

  return stub;
}

describe('canvasDriver', () => {
  const x = 0;
  const y = 0;
  const width = 200;
  const height = 200;

  describe('translateVtreeToInstructions', () => {
    it('takes a vtree and returns an array of instructions', () => {
      const vtree = rect({
        x,
        y,
        width,
        height,
        draw: [{fill: 'black'}]
      });

      const instructions = translateVtreeToInstructions(vtree);

      assert.deepEqual(
        instructions,
        [
          {set: 'lineWidth', value: 1},
          {set: 'fillStyle', value: 'black'},
          {call: 'fillRect', args: [x, y, width, height]}
        ]
      );
    });
  });

  describe('renderInstructionsToCanvas', () => {
    it('takes an array of instructions and applies them to a canvas context', () => {
      const context = {
        fillRect: methodSpy()
      };

      const instructions = [
        {set: 'lineWidth', value: 1},
        {set: 'fillStyle', value: 'black'},
        {call: 'fillRect', args: [x, y, width, height]}
      ];

      renderInstructionsToCanvas(instructions, context);

      assert.equal(context.lineWidth, 1);
      assert.equal(context.fillStyle, 'black');
      assert.equal(context.fillRect.callCount(), 1);
      assert.deepEqual(
        context.fillRect.callArgs()[0],
        [x, y, width, height]
      );
    });
  });
});
