export function makeCanvasDriver (selector) {
  const canvas = document.querySelector(selector);

  const context = canvas.getContext('2d');

  function renderElement (context, element, parent) {
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
        if (operation.lineWidth) {
          context.lineWidth = operation.lineWidth;
        }

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

  return function canvasDriver (sink$) {
    return sink$.subscribe(vtree => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      vtree.forEach(element => renderElement(context, element));
    });
  };
}
