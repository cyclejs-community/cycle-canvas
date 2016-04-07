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

        width: 50,
        height: 40,

        draw: [
          {fill: 'purple'}
        ],

        children: [
          text({
            x: 5,
            y: 5,
            value: 'Hello World!'
          })
        ]
      })
    )
  }
}

const drivers = {
  Canvas: makeCanvasDriver()
};

run(main, drivers);
```

Looks like this:

![img](http://i.imgur.com/1LCZxrg.png)

