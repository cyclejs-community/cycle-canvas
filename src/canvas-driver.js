function renderElement (context, element, parent) {
  if (!element) {
    return;
  }

  if (!parent) {
    parent = {x: 0, y: 0};
  }

  const origin = {
    x: element.x ? parent.x + element.x : parent.x,
    y: element.y ? parent.y + element.y : parent.y
  };
  
  preDrawHooks(element, context);

  if (element.font) {
    context.font = element.font;
  }

  const elementMapping = {
    rect: drawRect,
    text: drawText,
    line: drawLine
  };

  const elementFunction = elementMapping[element.kind];

  elementFunction(context, element, origin);

  postDrawHooks(context);

  element.children && element.children.forEach(child => renderElement(context, child, element))
}

function drawLine(context, element, origin) {
  context.lineWidth = element.style.lineWidth || 1;
  context.lineCap = element.style.lineCap || 'butt';
  context.lineJoin = element.style.lineJoin || 'miter';
  context.strokeStyle = element.style.strokeStyle || 'black';

  const lineDash = element.style.lineDash;

  if (lineDash && lineDash.constructor === Array) {
    context.setLineDash(element.style.lineDash);
  }

  context.moveTo(origin.x, origin.y);
  context.beginPath();
  element.points.forEach(point => {
    context.lineTo(origin.x + point.x, origin.y + point.y);
  });
  context.stroke();
  context.setLineDash([]);
}

function drawRect(context, element, origin) {
  element.draw.forEach(operation => {
    context.lineWidth = operation.lineWidth || 1;

    if (operation.clear) {
      context.clearRect(
          origin.x,
          origin.y,
          element.width,
          element.height
      );
    }

    if (operation.fill) {
      context.fillStyle = operation.fill || 'black';

      context.fillRect(
          origin.x,
          origin.y,
          element.width,
          element.height
      );
    }

    if (operation.stroke) {
      context.strokeStyle = operation.stroke || 'black';

      context.strokeRect(
          origin.x,
          origin.y,
          element.width,
          element.height
      );
    }
  });
}

function drawText(context, element, origin) {
  element.draw.forEach(operation => {
    context.textAlign = element.textAlign || 'left';

    if (operation.fill) {
      context.fillStyle = operation.fill || 'black';

      context.fillText(
          element.value,
          origin.x,
          origin.y,
          element.width
      );
    }

    if (operation.stroke) {
      context.strokeStyle = operation.stroke || 'black';

      context.strokeText(
          element.value,
          origin.x,
          origin.y,
          element.width
      );
    }
  });
}

function preDrawHooks(element, context) {
  context.save();

  if (element.translate) {
    context.translate(element.translate.x, element.translate.y);
  }

  if (element.rotate) {
    context.rotate(element.rotate);
  }

  if(element.scale) {
    context.scale(element.scale.x, element.scale.y);
  }
}

function postDrawHooks(context) {
  context.restore();
}

export function c (kind, opts, children) {
  if (opts.children) {
    children = opts.children;
  }

  return Object.assign(
    {},
    opts,
    {kind, children}
  );
}

export function rect (opts, children) {
  return c('rect', opts, children);
}

export function text (opts, children) {
  const defaults = {
    draw: [
      {fill: 'black'}
    ]
  };

  return c('text', {...defaults, ...opts}, children);
}

export function line (opts, children) {
  const defaults = {
    style: {
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      strokeStyle: 'black'
    }
  };
  return c('line', {...defaults, ...opts}, children);
}

export function makeCanvasDriver (selector, {width, height}) {
  let canvas = document.querySelector(selector);

  if (!canvas) {
    canvas = document.createElement('canvas');

    document.body.appendChild(canvas);
  }

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  return function canvasDriver (sink$) {
    return sink$.subscribe(rootElement => {
      const defaults = {
        kind: 'rect',
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
        draw: [
          {clear: true}
        ]
      };

      const rootElementWithDefaults = Object.assign(
        {},
        defaults,
        rootElement
      );

      renderElement(context, rootElementWithDefaults);
    });
  };
}
