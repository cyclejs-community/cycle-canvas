# cycle-canvas
A canvas driver for Cycle.js. Great for games or art.

Currently highly experimental. Expect major breaking changes.

Installation
---

```bash
$ npm install cycle-canvas --save
```

Example
---

```js
import {run} from '@cycle/core';
import {makeCanvasDriver, rect, text} from 'cycle-canvas';
import {Observable} from 'rx';

function main () {
  return {
    Canvas: Observable.just(
      rect({
        x: 10,
        y: 10,

        width: 160,
        height: 100,

        draw: [
          {fill: 'purple'}
        ],

        children: [
          text({
            x: 15,
            y: 25,

            value: 'Hello World!',

            font: '18pt Arial',

            draw: [
              {fill: 'white'}
            ]
          })
        ]
      })
    )
  };
}

const drivers = {
  Canvas: makeCanvasDriver(null, {width: 800, height: 600})
};

run(main, drivers);
```

Looks like this:

![img](http://i.imgur.com/1LCZxrg.png)

