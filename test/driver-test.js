/* globals describe, it */
import {translateVtreeToInstructions, renderInstructionsToCanvas, rect, line, arc, text, polygon, image, makeCanvasDriver} from '../src/canvas-driver'
import assert from 'assert'
import root from 'window-or-global'
import { JSDOM } from 'jsdom'
import xs from 'xstream'

function methodSpy () {
  let called = 0
  let callArgs = []

  const stub = (...args) => {
    called += 1
    callArgs.push(args)
  };

  stub.callCount = () => called
  stub.callArgs = () => callArgs

  return stub
}

describe('canvasDriver', () => {
  const x = 0
  const y = 0
  const width = 200
  const height = 200

  describe('translateVtreeToInstructions', () => {
    it('takes a vtree and checks if the instructions array contains drawing a filled rectangle', () => {
      const vtree = rect({
        x,
        y,
        width,
        height,
        draw: [{fill: 'black'}]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {set: 'lineWidth', value: 1},
          {set: 'fillStyle', value: 'black'},
          {call: 'fillRect', args: [x, y, width, height]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks if the instructions array contains drawing a rectangular outline', () => {
      const vtree = rect({
        x,
        y,
        width,
        height,
        draw: [{stroke: 'black'}]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {set: 'lineWidth', value: 1},
          {set: 'strokeStyle', value: 'black'},
          {call: 'strokeRect', args: [x, y, width, height]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks if the instructions array handle nested children', () => {
      const vtree = rect({
        x,
        y,
        width,
        height,
        draw: [{fill: 'black'}],
        children: [
          rect({
            x: 10,
            y: 10,
            width: 25,
            height: 25,
            draw: [{fill: 'black'}],
            children: [
              rect({
                x: 10,
                y: 10,
                width: 50,
                height: 50,
                draw: [{stroke: 'purple'}]
              })
            ]
          })
        ]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {set: 'lineWidth', value: 1},
          {set: 'fillStyle', value: 'black'},
          {call: 'fillRect', args: [x, y, width, height]},
          {call: 'restore', args: []},
          {call: 'save', args: []},
          {set: 'lineWidth', value: 1},
          {set: 'fillStyle', value: 'black'},
          {call: 'fillRect', args: [10, 10, 25, 25]},
          {call: 'restore', args: []},
          {call: 'save', args: []},
          {set: 'lineWidth', value: 1},
          {set: 'strokeStyle', value: 'purple'},
          {call: 'strokeRect', args: [20, 20, 50, 50]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks if the instructions array handles relative origins', () => {
      const vtree = rect({
        x,
        y,
        width,
        height,
        draw: [{fill: 'black'}],
        children: [
          text({
            x: 50,
            y: 50,
            value: 'Hello World',
            font: '18pt Arial',
            draw: [{fill: 'white'}]
          })
        ]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {set: 'lineWidth', value: 1},
          {set: 'fillStyle', value: 'black'},
          {call: 'fillRect', args: [x, y, width, height]},
          {call: 'restore', args: []},
          {call: 'save', args: []},
          {set: 'textAlign', value: 'left'},
          {set: 'font', value: '18pt Arial'},
          {set: 'fillStyle', value: 'white'},
          {call: 'fillText', args: ['Hello World', 50, 50]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks if the instructions array contains drawing a line', () => {
      const vtree = line({
        x,
        y,
        style: {
          lineCap: 'square',
          strokeStyle: '#CCCCCC',
          lineDash: [5, 15]
        },
        points: [
          {x: 10, y: 10},
          {x: 10, y: 20},
          {x: 20, y: 10},
          {x: 10, y: 10}
        ]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {set: 'lineWidth', value: 1},
          {set: 'lineCap', value: 'square'},
          {set: 'lineJoin', value: 'mitter'},
          {set: 'strokeStyle', value: '#CCCCCC'},
          {call: 'setLineDash', args: [5, 15]},
          {call: 'moveTo', args: [x, y]},
          {call: 'beginPath', args: []},
          {call: 'lineTo', args: [x + 10, y + 10]},
          {call: 'lineTo', args: [x + 10, y + 20]},
          {call: 'lineTo', args: [x + 20, y + 10]},
          {call: 'lineTo', args: [x + 10, y + 10]},
          {call: 'stroke', args: []},
          {call: 'setLineDash', args: []},
          {call: 'restore', args: []}
        ])
    })

    it('takes a vtree and checks if the instructions array contain drawing filled text without a width', () => {
      const vtree = text({
        x,
        y,
        value: 'Hello World',
        font: '18pt Arial',
        draw: [{fill: 'purple'}]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {set: 'textAlign', value: 'left'},
          {set: 'font', value: '18pt Arial'},
          {set: 'fillStyle', value: 'purple'},
          {call: 'fillText', args: ['Hello World', x, y]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks if the instructions array contain drawing filled text including a width', () => {
      const vtree = text({
        x,
        y,
        width: width,
        value: 'Hello World',
        font: '18pt Arial',
        draw: [{fill: 'purple'}]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {set: 'textAlign', value: 'left'},
          {set: 'font', value: '18pt Arial'},
          {set: 'fillStyle', value: 'purple'},
          {call: 'fillText', args: ['Hello World', x, y, width]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks if the instructions array contain drawing stroked text without a width', () => {
      const vtree = text({
        x,
        y,
        value: 'Hello World',
        font: '18pt Arial',
        draw: [{stroke: 'purple'}]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {set: 'textAlign', value: 'left'},
          {set: 'font', value: '18pt Arial'},
          {set: 'strokeStyle', value: 'purple'},
          {call: 'strokeText', args: ['Hello World', x, y]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks if the instructions array contain drawing stroked text including a width', () => {
      const vtree = text({
        x,
        y,
        width: width,
        value: 'Hello World',
        font: '18pt Arial',
        draw: [{stroke: 'purple'}]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {set: 'textAlign', value: 'left'},
          {set: 'font', value: '18pt Arial'},
          {set: 'strokeStyle', value: 'purple'},
          {call: 'strokeText', args: ['Hello World', x, y, width]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks if the instructions array contain save/restore calls', () => {
      const vtree = rect({
        x,
        y,
        width,
        height,
        draw: [{fill: 'black'}]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {set: 'lineWidth', value: 1},
          {set: 'fillStyle', value: 'black'},
          {call: 'fillRect', args: [x, y, width, height]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks if the instructions array contain translate transformation', () => {
      const vtree = rect({
        transformations: [
          {translate: {x: 10, y: 10}}
        ],
        x,
        y,
        width,
        height,
        draw: [{fill: 'black'}]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {call: 'translate', args: [10, 10]},
          {set: 'lineWidth', value: 1},
          {set: 'fillStyle', value: 'black'},
          {call: 'fillRect', args: [x, y, width, height]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks if the instructions array contain rotate transformation', () => {
      const vtree = rect({
        transformations: [
          {rotate: (20 * Math.PI / 180)}
        ],
        x,
        y,
        width,
        height,
        draw: [{fill: 'black'}]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {call: 'rotate', args: [20 * Math.PI / 180]},
          {set: 'lineWidth', value: 1},
          {set: 'fillStyle', value: 'black'},
          {call: 'fillRect', args: [x, y, width, height]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks if the instructions array contain scale transformation', () => {
      const vtree = rect({
        transformations: [
          {scale: {x: 2, y: 2}}
        ],
        x,
        y,
        width,
        height,
        draw: [{fill: 'black'}]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {call: 'scale', args: [2, 2]},
          {set: 'lineWidth', value: 1},
          {set: 'fillStyle', value: 'black'},
          {call: 'fillRect', args: [x, y, width, height]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks that the instructions contain drawing a polygon', () => {
      const vtree = polygon({
        points: [{x: 1, y: 1}, {x: 30, y: 1}, {x: 15, y: 10}],
        draw: [{fill: 'red'}, {stroke: 'black'}]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {call: 'beginPath', args: []},
          {call: 'moveTo', args: [1, 1]},
          {call: 'lineTo', args: [30, 1]},
          {call: 'lineTo', args: [15, 10]},
          {call: 'closePath', args: []},
          {set: 'fillStyle', value: 'red'},
          {call: 'fill', args: []},
          {set: 'strokeStyle', value: 'black'},
          {call: 'stroke', args: []},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks that the instructions contain drawing an image', () => {
      const img = 'image'
      const vtree = image({
        image: img,
        x,
        y
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {call: 'drawImage', args: [img, x, y]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks that the instructions contain drawing an image including scaling', () => {
      const img = 'image'
      const vtree = image({
        image: img,
        x,
        y,
        width,
        height
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {call: 'drawImage', args: [img, x, y, width, height]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks that the instructions contain drawing an image including slicing', () => {
      const img = 'image'
      const vtree = image({
        image: img,
        x,
        y,
        width,
        height,
        sx: 16,
        sy: 16,
        sWidth: 128,
        sHeight: 128
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {call: 'drawImage', args: [img, 16, 16, 128, 128, x, y, width, height]},
          {call: 'restore', args: []}
        ]
      )
    })

    it('takes a vtree and checks that the instructions contain drawing an arc', () => {
      const vtree = arc({
        x: 10,
        y: 10,
        radius: 100,
        startAngle: 0,
        endAngle: 180,
        anticlockwise: false,
        draw: [{fill: 'black'}, {stroke: 'red'}]
      })

      const instructions = translateVtreeToInstructions(vtree)

      assert.deepEqual(
        instructions,
        [
          {call: 'save', args: []},
          {call: 'beginPath', args: []},
          {call: 'arc', args: [10, 10, 100, 0, 180, false]},
          {set: 'fillStyle', value: 'black'},
          {call: 'fill', args: []},
          {set: 'strokeStyle', value: 'red'},
          {call: 'stroke', args: []},
          {call: 'restore', args: []}
        ]
      )
    })
  })

  describe('renderInstructionsToCanvas', () => {
    it('takes an array of instructions for a filled rectangle and applies them to a canvas context', () => {
      const context = {
        fillRect: methodSpy()
      }

      const instructions = [
        {set: 'lineWidth', value: 1},
        {set: 'fillStyle', value: 'black'},
        {call: 'fillRect', args: [x, y, width, height]}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.lineWidth, 1)
      assert.equal(context.fillStyle, 'black')
      assert.equal(context.fillRect.callCount(), 1)
      assert.deepEqual(
        context.fillRect.callArgs()[0],
        [x, y, width, height]
      )
    })

    it('takes an array of instructions for a rectangular outline and applies them to a canvas context', () => {
      const context = {
        strokeRect: methodSpy()
      }

      const instructions = [
        {set: 'lineWidth', value: 1},
        {set: 'strokeStyle', value: 'black'},
        {call: 'strokeRect', args: [x, y, width, height]}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.lineWidth, 1)
      assert.equal(context.strokeStyle, 'black')
      assert.equal(context.strokeRect.callCount(), 1)
      assert.deepEqual(
        context.strokeRect.callArgs()[0],
        [x, y, width, height]
      )
    })

    it('takes an array of instructions for a line and applies them to a canvas context', () => {
      const context = {
        setLineDash: methodSpy(),
        moveTo: methodSpy(),
        beginPath: methodSpy(),
        lineTo: methodSpy(),
        stroke: methodSpy()
      }

      const instructions = [
        {set: 'lineWidth', value: 1},
        {set: 'lineCap', value: 'square'},
        {set: 'lineJoin', value: 'mitter'},
        {set: 'strokeStyle', value: '#CCCCCC'},
        {call: 'setLineDash', args: [5, 15]},
        {call: 'moveTo', args: [x, y]},
        {call: 'beginPath', args: []},
        {call: 'lineTo', args: [x + 10, y + 10]},
        {call: 'lineTo', args: [x + 10, y + 20]},
        {call: 'lineTo', args: [x + 20, y + 10]},
        {call: 'lineTo', args: [x + 10, y + 10]},
        {call: 'stroke', args: []},
        {call: 'setLineDash', args: []}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.lineWidth, 1)
      assert.equal(context.strokeStyle, '#CCCCCC')
      assert.equal(context.setLineDash.callCount(), 2)
      assert.equal(context.moveTo.callCount(), 1)
      assert.equal(context.beginPath.callCount(), 1)
      assert.equal(context.lineTo.callCount(), 4)
      assert.equal(context.stroke.callCount(), 1)
      assert.deepEqual(
        context.setLineDash.callArgs()[0],
        [5, 15]
      )
      assert.deepEqual(
        context.setLineDash.callArgs()[1],
        []
      )
      assert.deepEqual(
        context.moveTo.callArgs()[0],
        [x, y]
      )
      assert.deepEqual(
        context.lineTo.callArgs()[0],
        [x + 10, y + 10]
      )
      assert.deepEqual(
        context.lineTo.callArgs()[1],
        [x + 10, y + 20]
      )
      assert.deepEqual(
        context.lineTo.callArgs()[2],
        [x + 20, y + 10]
      )
      assert.deepEqual(
        context.lineTo.callArgs()[3],
        [x + 10, y + 10]
      )
      assert.deepEqual(
        context.stroke.callArgs()[0],
        []
      )
    })

    it('takes an array of instructions for a polygon and applies them to a canvas context', () => {
      const context = {
        moveTo: methodSpy(),
        beginPath: methodSpy(),
        lineTo: methodSpy(),
        closePath: methodSpy(),
        stroke: methodSpy(),
        fill: methodSpy()
      }

      const instructions = [
        {call: 'beginPath', args: []},
        {call: 'moveTo', args: [1, 1]},
        {call: 'lineTo', args: [30, 1]},
        {call: 'lineTo', args: [15, 10]},
        {call: 'closePath', args: []},
        {set: 'fillStyle', value: 'red'},
        {call: 'fill', args: []},
        {set: 'strokeStyle', value: 'black'},
        {call: 'stroke', args: []}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.strokeStyle, 'black')
      assert.equal(context.fillStyle, 'red')
      assert.equal(context.beginPath.callCount(), 1)
      assert.equal(context.moveTo.callCount(), 1)
      assert.deepEqual(context.moveTo.callArgs()[0], [1, 1])
      assert.equal(context.lineTo.callCount(), 2)
      assert.deepEqual(context.lineTo.callArgs()[0], [30, 1])
      assert.deepEqual(context.lineTo.callArgs()[1], [15, 10])
      assert.equal(context.closePath.callCount(), 1)
      assert.equal(context.fill.callCount(), 1)
      assert.equal(context.stroke.callCount(), 1)
    })

    it('takes an array of instructions for filled text without a width and applies them to a canvas context', () => {
      const context = {
        fillText: methodSpy()
      }

      const instructions = [
        {set: 'textAlign', value: 'left'},
        {set: 'font', value: '18pt Arial'},
        {set: 'fillStyle', value: 'purple'},
        {call: 'fillText', args: ['Hello World', x, y]}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.textAlign, 'left')
      assert.equal(context.font, '18pt Arial')
      assert.equal(context.fillStyle, 'purple')
      assert.equal(context.fillText.callCount(), 1)
      assert.deepEqual(
        context.fillText.callArgs()[0],
        ['Hello World', x, y]
      )
    })

    it('takes an array of instructions for filled text including a width and applies them to a canvas context', () => {
      const context = {
        fillText: methodSpy()
      }

      const instructions = [
        {set: 'textAlign', value: 'left'},
        {set: 'font', value: '18pt Arial'},
        {set: 'fillStyle', value: 'purple'},
        {call: 'fillText', args: ['Hello World', x, y, width]}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.textAlign, 'left')
      assert.equal(context.font, '18pt Arial')
      assert.equal(context.fillStyle, 'purple')
      assert.equal(context.fillText.callCount(), 1)
      assert.deepEqual(
        context.fillText.callArgs()[0],
        ['Hello World', x, y, width]
      )
    })

    it('takes an array of instructions for a stroked text without a width and applies them to a canvas context', () => {
      const context = {
        strokeText: methodSpy()
      }

      const instructions = [
        {set: 'textAlign', value: 'left'},
        {set: 'font', value: '18pt Arial'},
        {set: 'strokeStyle', value: 'purple'},
        {call: 'strokeText', args: ['Hello World', x, y]}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.textAlign, 'left')
      assert.equal(context.font, '18pt Arial')
      assert.equal(context.strokeStyle, 'purple')
      assert.equal(context.strokeText.callCount(), 1)
      assert.deepEqual(
        context.strokeText.callArgs()[0],
        ['Hello World', x, y]
      )
    })

    it('takes an array of instructions for a stroked text including a width and applies them to a canvas context', () => {
      const context = {
        strokeText: methodSpy()
      }

      const instructions = [
        {set: 'textAlign', value: 'left'},
        {set: 'font', value: '18pt Arial'},
        {set: 'strokeStyle', value: 'purple'},
        {call: 'strokeText', args: ['Hello World', x, y, width]}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.textAlign, 'left')
      assert.equal(context.font, '18pt Arial')
      assert.equal(context.strokeStyle, 'purple')
      assert.equal(context.strokeText.callCount(), 1)
      assert.deepEqual(
        context.strokeText.callArgs()[0],
        ['Hello World', x, y, width]
      )
    })

    it('takes an array of instructions for an image and applies them to a canvas context', () => {
      const context = {
        drawImage: methodSpy()
      }

      const img = 'image'
      const instructions = [
        {call: 'drawImage', args: [img, x, y]}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.drawImage.callCount(), 1)
      assert.deepEqual(
        context.drawImage.callArgs()[0],
        [img, x, y]
      )
    })

    it('takes an array of instructions for an image with scaling and applies them to a canvas context', () => {
      const context = {
        drawImage: methodSpy()
      }

      const img = 'image'
      const instructions = [
        {call: 'drawImage', args: [img, x, y, width, height]}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.drawImage.callCount(), 1)
      assert.deepEqual(
        context.drawImage.callArgs()[0],
        [img, x, y, width, height]
      )
    })

    it('takes an array of instructions for an image with slicing and applies them to a canvas context', () => {
      const context = {
        drawImage: methodSpy()
      }

      const img = 'image'
      const instructions = [
        {call: 'drawImage', args: [img, 16, 16, 128, 128, x, y, width, height]}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.drawImage.callCount(), 1)
      assert.deepEqual(
        context.drawImage.callArgs()[0],
        [img, 16, 16, 128, 128, x, y, width, height]
      )
    })

    it('takes an array of instructions for saving/restoring state and applies them to a canvas context', () => {
      const context = {
        save: methodSpy(),
        restore: methodSpy()
      }

      const instructions = [
        {call: 'save', args: []},
        {call: 'restore', args: []}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.save.callCount(), 1)
      assert.equal(context.restore.callCount(), 1)
      assert.deepEqual(
        context.save.callArgs()[0],
        []
      )
      assert.deepEqual(
        context.restore.callArgs()[0],
        []
      )
    })

    it('takes an array of instructions for an arc and applies them to a canvas context', () => {
      const context = {
        beginPath: methodSpy(),
        stroke: methodSpy(),
        fill: methodSpy(),
        arc: methodSpy()
      }

      const instructions = [
        {call: 'beginPath', args: []},
        {call: 'arc', args: [10, 10, 10, 100, 0, false]},
        {set: 'fillStyle', value: 'red'},
        {call: 'fill', args: []},
        {set: 'strokeStyle', value: 'black'},
        {call: 'stroke', args: []}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.strokeStyle, 'black')
      assert.equal(context.fillStyle, 'red')
      assert.equal(context.beginPath.callCount(), 1)
      assert.equal(context.fill.callCount(), 1)
      assert.equal(context.stroke.callCount(), 1)
      assert.deepEqual(
        context.arc.callArgs()[0],
        [10, 10, 10, 100, 0, false]
      )
    })

    it('takes an array of instructions for a translate transformation and applies them to a canvas context', () => {
      const context = {
        translate: methodSpy()
      }

      const instructions = [
        {call: 'translate', args: [10, 10]}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.translate.callCount(), 1)
      assert.deepEqual(
        context.translate.callArgs()[0],
        [10, 10]
      )
    })

    it('takes an array of instructions for a rotate transformation and applies them to a canvas context', () => {
      const context = {
        rotate: methodSpy()
      }

      const instructions = [
        {call: 'rotate', args: [20 * Math.PI / 180]}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.rotate.callCount(), 1)
      assert.deepEqual(
        context.rotate.callArgs()[0],
        [20 * Math.PI / 180]
      )
    })

    it('takes an array of instructions for a scale transformation and applies them to a canvas context', () => {
      const context = {
        scale: methodSpy()
      }

      const instructions = [
        {call: 'scale', args: [2, 2]}
      ]

      renderInstructionsToCanvas(instructions, context)

      assert.equal(context.scale.callCount(), 1)
      assert.deepEqual(
        context.scale.callArgs()[0],
        [2, 2]
      )
    })
  })

  describe('makeCanvasDriver', () => {
    it('returns object containing "events" method, which accepts an event name and returns stream of such events on the canvas', done => {
      const jsdom = new JSDOM('<!DOCTYPE html><html><body><canvas></canvas></body></html>')
      root.document = jsdom.window.document

      const canvasEl = root.document.querySelector('canvas')
      canvasEl.getContext = methodSpy()

      const Canvas = makeCanvasDriver('canvas')(xs.empty())
      const click$ = Canvas.events('click')

      const event = new jsdom.window.MouseEvent('click')

      click$.addListener({
        next: clickEvent => {
          assert.strictEqual(clickEvent, event)
          done()
        }
      })

      canvasEl.dispatchEvent(event)
    })
  })
})
