function renderElement (context, element, parent) {
  if (!element) {
    return;
  }

  if (!parent) {
    parent = {x: 0, y: 0};
  }

  const realX = parent.x + element.x;
  const realY = parent.y + element.y;

  if (element.font) {
    context.font = element.font;
  }

  if (element.kind === 'rect') {
    element.draw.forEach(operation => {
      context.lineWidth = operation.lineWidth || 1;

      if (operation.clear) {
        context.clearRect(
          realX,
          realY,
          element.width,
          element.height
        );
      }

      if (operation.fill) {
        context.fillStyle = operation.fill || 'black';

        context.fillRect(
          realX,
          realY,
          element.width,
          element.height
        );
      }

      if (operation.stroke) {
        context.strokeStyle = operation.stroke || 'black';

        context.strokeRect(
          realX,
          realY,
          element.width,
          element.height
        );
      }
    });
  }

  if (element.kind === 'text') {
    element.draw.forEach(operation => {
      context.textAlign = element.textAlign || 'left';

      if (operation.fill) {
        context.fillStyle = operation.fill || 'black';

        context.fillText(
          element.value,
          realX,
          realY,
          element.width
        );
      }

      if (operation.stroke) {
        context.strokeStyle = operation.stroke || 'black';

        context.strokeText(
          element.value,
          realX,
          realY,
          element.width
        );
      }
    });
  }

  element.children && element.children.forEach(child => renderElement(context, child, element))
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
