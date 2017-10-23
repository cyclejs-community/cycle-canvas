import {adapt} from '@cycle/run/lib/adapt'
import xs from 'xstream'
import fromEvent from 'xstream/extra/fromEvent'
import root from 'window-or-global'

function flatten (array) {
  if (typeof array.reduce !== 'function') {
    return array
  }

  return array.reduce((flatArray, arrayElement) => flatArray.concat(flatten(arrayElement)), [])
}

function compact (array) {
  return array.filter(element => element !== undefined && element !== null)
}

function translateRect (element, origin) {
  return element.draw.map(operation => {
    const operations = [
      {set: 'lineWidth', value: operation.lineWidth || 1}
    ]

    if (operation.clear) {
      operations.push({
        call: 'clearRect',
        args: [
          origin.x,
          origin.y,
          element.width,
          element.height
        ]
      })
    }

    if (operation.fill) {
      operations.push({
        set: 'fillStyle',
        value: operation.fill || 'black'
      })

      operations.push({
        call: 'fillRect',
        args: [
          origin.x,
          origin.y,
          element.width,
          element.height
        ]
      })
    }

    if (operation.stroke) {
      operations.push({
        set: 'strokeStyle',
        value: operation.stroke || 'black'
      })

      operations.push({
        call: 'strokeRect',
        args: [
          origin.x,
          origin.y,
          element.width,
          element.height
        ]
      })
    }

    return operations
  })
}

function translateLine (element, origin) {
  const operations = [
    {set: 'lineWidth', value: element.style.lineWidth || 1},
    {set: 'lineCap', value: element.style.lineCap || 'butt'},
    {set: 'lineJoin', value: element.style.lineJoin || 'mitter'},
    {set: 'strokeStyle', value: element.style.strokeStyle || 'black'}
  ]

  if (element.style.lineDash && element.style.lineDash.constructor === Array) {
    operations.push({
      call: 'setLineDash',
      args: element.style.lineDash
    })
  }

  operations.push({
    call: 'moveTo',
    args: [
      origin.x,
      origin.y
    ]
  })

  operations.push({
    call: 'beginPath',
    args: []
  })

  element.points.forEach(point => {
    operations.push({
      call: 'lineTo',
      args: [
        origin.x + point.x,
        origin.y + point.y
      ]
    })
  })

  operations.push({
    call: 'stroke',
    args: []
  })

  operations.push({
    call: 'setLineDash',
    args: []
  })

  return operations
}

function translatePolygon (element, origin) {
  const [first, ...rest] = element.points

  return [].concat(
    [{call: 'beginPath', args: []}],
    [{call: 'moveTo', args: [origin.x + first.x, origin.y + first.y]}],
    rest.map(point => {
      return {call: 'lineTo', args: [origin.x + point.x, origin.y + point.y]}
    }),
    [{call: 'closePath', args: []}],
    element.draw.map(operation => {
      const fillInstructions = [
        {set: 'fillStyle', value: operation.fill},
        {call: 'fill', args: []}
      ]
      const strokeInstructions = [
        {set: 'strokeStyle', value: operation.stroke},
        {call: 'stroke', args: []}
      ]
      return operation.fill
        ? fillInstructions
        : operation.stroke
          ? strokeInstructions
          : []
    })
  )
}

function translateText (element, origin) {
  return element.draw.map(operation => {
    const operations = [
      {set: 'textAlign', value: element.textAlign || 'left'},
      {set: 'font', value: element.font}
    ]

    const args = [
      element.value,
      origin.x,
      origin.y
    ]

    if (element.width) {
      args.push(element.width)
    }

    if (operation.fill) {
      operations.push({
        set: 'fillStyle',
        value: operation.fill || 'black'
      })

      operations.push({
        call: 'fillText',
        args: args
      })
    }

    if (operation.stroke) {
      operations.push({
        set: 'strokeStyle',
        value: operation.stroke || 'black'
      })

      operations.push({
        call: 'strokeText',
        args: args
      })
    }

    return operations
  })
}

function translateImage (element, origin) {
  const args = [element.image]

  if (element.sx != null) {
    args.push(element.sx, element.sy, element.sWidth, element.sHeight)
  }

  args.push(element.x, element.y)

  if (element.width != null) {
    args.push(element.width, element.height)
  }

  return [{call: 'drawImage', args}]
}

function translateArc (element, origin) {
  const operations = [
    {call: 'beginPath', args: []},
    {call: 'arc', args: [
      element.x,
      element.y,
      element.radius,
      element.startAngle,
      element.endAngle,
      element.anticlockwise || false
    ]}
  ]

  element.draw.map(operation => {
    if (operation.fill) {
      operations.push({
        set: 'fillStyle',
        value: operation.fill || 'black'
      })

      operations.push({
        call: 'fill',
        args: []
      })
    }

    if (operation.stroke) {
      operations.push({
        set: 'strokeStyle',
        value: operation.stroke || 'black'
      })

      operations.push({
        call: 'stroke',
        args: []
      })
    }
  })

  return operations
}

export function translateVtreeToInstructions (element, parentEl) {
  if (!element) {
    return
  }

  if (!parentEl) {
    parentEl = {x: 0, y: 0}
  }

  const origin = {
    x: element.x ? parentEl.x + element.x : parentEl.x,
    y: element.y ? parentEl.y + element.y : parentEl.y
  }

  const elementMapping = {
    rect: translateRect,
    line: translateLine,
    text: translateText,
    polygon: translatePolygon,
    image: translateImage,
    arc: translateArc
  }

  const instructions = preDrawHooks(element)

  instructions.push(elementMapping[element.kind](element, origin))

  instructions.push(postDrawHooks())

  const flatInstructions = compact(flatten(instructions))

  if (element.children) {
    element.children.forEach((child) => {
      const childInstructions = translateVtreeToInstructions(child, element)

      if (childInstructions) {
        flatInstructions.push(...childInstructions)
      }
    })
  }

  return flatInstructions
}

export function renderInstructionsToCanvas (instructions, context) {
  instructions.forEach(instruction => {
    if (instruction.set) {
      context[instruction.set] = instruction.value
    } else if (instruction.call) {
      context[instruction.call](...instruction.args)
    }
  })
}

function preDrawHooks (element) {
  const operations = [
    {call: 'save', args: []}
  ]

  if (element.transformations) {
    element.transformations.forEach(transformation => {
      if (transformation.translate) {
        operations.push({
          call: 'translate',
          args: [transformation.translate.x, transformation.translate.y]
        })
      }

      if (transformation.rotate) {
        operations.push({
          call: 'rotate',
          args: [transformation.rotate]
        })
      }

      if (transformation.scale) {
        operations.push({
          call: 'scale',
          args: [transformation.scale.x, transformation.scale.y]
        })
      }
    })
  }

  return operations
}

function postDrawHooks () {
  return [
    {call: 'restore', args: []}
  ]
}

export function c (kind, opts, children) {
  if (opts.children) {
    children = opts.children
  }

  return Object.assign(
    {},
    opts,
    {kind, children}
  )
}

export function rect (opts, children) {
  return c('rect', opts, children)
}

export function arc (opts, children) {
  return c('arc', opts, children)
}

export function text (opts, children) {
  const defaults = {
    draw: [
      {fill: 'black'}
    ]
  }

  return c('text', {...defaults, ...opts}, children)
}

export function line (opts, children) {
  const defaults = {
    style: {
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      strokeStyle: 'black'
    }
  }
  return c('line', {...defaults, ...opts}, children)
}

export function polygon (opts, children) {
  return c('polygon', opts, children)
}

export function image (opts) {
  return c('image', opts, [])
}

export function makeCanvasDriver (selector, canvasSize = null) {
  let canvas = root.document.querySelector(selector)

  if (!canvas) {
    canvas = root.document.createElement('canvas')

    root.document.body.appendChild(canvas)
  }

  if (canvasSize) {
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height
  }

  const context = canvas.getContext('2d')

  let driver = function canvasDriver (sink$) {
    sink$.addListener({
      next: rootElement => {
        const defaults = {
          kind: 'rect',
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height,
          draw: [
            {clear: true}
          ]
        }

        const rootElementWithDefaults = Object.assign(
          {},
          defaults,
          rootElement
        )

        const instructions = translateVtreeToInstructions(rootElementWithDefaults)

        renderInstructionsToCanvas(instructions, context)
      },
      error: e => { throw e },
      complete: () => null
    })

    return {
      events: eventName => fromEvent(canvas, eventName)
    }
  }

  return driver
}
