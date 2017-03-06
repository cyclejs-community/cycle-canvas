# cycle-canvas [![npm version](https://badge.fury.io/js/cycle-canvas.svg)](https://badge.fury.io/js/cycle-canvas) [![Build Status](https://travis-ci.org/cyclejs-community/cycle-canvas.svg?branch=master)](https://travis-ci.org/cyclejs-community/cycle-canvas)
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
import {run} from '@cycle/rxjs-run';
import {makeCanvasDriver, rect, text} from 'cycle-canvas';
import {Observable} from 'rxjs/Observable';

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

Also check out the [flappy bird example](https://cyclejs-community.github.io/cycle-canvas/).

You can find the source for flappy bird [here](https://github.com/cyclejs-community/cycle-canvas/tree/master/examples/flappy-bird).

##API

#### Drawing shapes and text

- [`rect`](#rect)
- [`line`](#line)
- [`text`](#text)


#### Transformations
- [`translate`](#translate)
- [`rotate`](#rotate)
- [`scale`](#scale)

## Drawing shapes and text

### <a id="rect"></a> `rect(params = {})`

Draws a rectangle given an object containing drawing parameters.

#### params {}:

- `x: number` The x axis for the starting point.
- `y: number` The y axis for the starting point.
- `width: number` The rectangles width.
- `heigh: number` The rectangles height.
- `draw: array` List of drawing operation objects.
	- `fill: string` The color or style to use inside the rectangle. Default is *black #000*.
	- `stroke: string` The color or style to use as the stroke style. Default is *black #000*.
	- `clear: boolean` Sets all pixels in the rectangle to transparent.
- `children: array` List of child drawing shapes or text. This property is **optional**.

#### Example:
```js
rect({
	x: 10,
	y: 10,
	width: 100,
	height: 100,
	draw: [
		{fill: 'purple'}
	],
	children: [
		rect({
			x: 20,
			y: 20,
			width: 50,
			height: 50,
			draw: [
				{fill: 'blue'}
			]
		})
	]
})
```

### <a id="line"></a> `line(params = {})`

Draws line(s) given an object containing drawing parameters.

#### params {}:

- `x: number` The x axis for the starting point.
- `y: number` The y axis for the starting point.
- `style: object` The style properties. 
	- `lineWidth: number` The width of the line. Default is *1*.
	- `lineCap: string` The end point of the line. Default is *butt*. Possible values are *butt*, *round* and *square*.
	- `lineJoin: string` The type of corner created when two lines meet. Default is *miter*. Possible values are *miter*, *round* and *bevel*.
	- `strokeStyle: string` The color or style to use as the stroke style. Default is *black #000*.
	- `lineDash: array` A list of numbers that specifies the line dash pattern.
- `points: array` List of point objects that specify the x/y coordinates for each point.
- `children: array` List of child drawing shapes or text. This property is **optional**.

#### Example:
```js
line({
	x: 10,
	y: 10,
	style: {
		lineWidth: 2,
		lineCap: 'square',
		strokeStyle: '#CCCCCC'
	},
	points: [
		{x: 10, y: 10},
		{x: 10, y: 20},
		{x: 20, y: 10},
		{x: 10, y: 10}
	]
})
```

### <a id="polygon"></a> `polygon(params = {})`

Draws line(s) given an object containing drawing parameters.

#### params {}:

- `points: array` List of point objects that specify the x/y coordinates for each point of the polygon. Using less than 3 points is a terrible way to draw a line.
- `draw: array` List of drawing operation objects.
	- `fill: string` The color or style to use inside the polygon. If not present, the polygon will not be filled.
	- `stroke: string` The color or style to use as the stroke style. If not present, the polygon will not have an outline.
- `children: array` List of child drawing shapes or text. This property is **optional**.

#### Example:
```js
polygon({
	points: [
		{x: 10, y: 0},
		{x: 0, y: 10},
		{x: 0, y: 30},
		{x: 30, y: 30},
		{x: 30, y: 10} // a house shaped polygon
	],
	draw: {
		stroke: '#000',
		fill: '#ccc'
	},
})
```

### <a id="text"></a> `text(options = {})`

Draws text given an object containing drawing parameters.

#### params {}:

- `x: number` The x axis for the starting point.
- `y: number` The y axis for the starting point.
- `value: string` The text to draw.
- `font: string` The text style. Uses same syntax  as the [CSS font](https://developer.mozilla.org/en-US/docs/Web/CSS/font) property.
- `draw: array` List of drawing operations objects.
	- `fill: string` The color or style to fill the text. Default is *black #000*.
	- `stroke: string`The color or style to use as the stroke style. Default is *black #000*.
- `children: array` List of child drawing shapes or text. This property is **optional**.

#### Example:
```js
text({
	x: 10,
	y: 10,
	value: 'Hello World!',
	font: '18pt Arial',
	draw: [
		{fill: 'white'}
	]
})
```

##Transformations
Transformations are added as a list to the `transformations` attribute to drawing shapes and text. 

### <a id="translate"></a> `translate: {x: number, y: number}`

Moves the canvas origin to a different point.

#### Example:
```js
	rect({
		transformations: [
      {translate: {x: 10, y: 10}}
    ],
		x: 100,
		y: 100,
		width: 150,
		height: 150,
		draw: [
			{fill: 'purple'}
		]
	})
```

### <a id="rotate"></a> `rotate: number`

Roate the canvas around the current origin.

#### Example:
```js
	rect({
		transformations: [
		  {rotate: (20*Math.PI/180)}
    ],
		x: 10,
		y: 10,
		width: 150,
		height: 150,
		draw: [
			{fill: 'purple'}
		]
	})
```

### <a id="scale"></a> `scale: {x: number, y: number}`

Scales the drawing bigger or smaller.

#### Example:
```js
	rect({
		transformations: [
		  {scale: {x: 2, y: 2}},
    ],
		x: 10,
		y: 10,
		width: 150,
		height: 150,
		draw: [
			{fill: 'purple'}
		]
	})
```

### Combining transformations

#### Example:

Rotate aroung the point (100, 100) and draw a 50x50px box centered there:
```js
	rect({
		transformations: [
      {translate: {x: 100, y: 100}},
      {rotate: (20*Math.PI/180)}
    ],
		x: -25, // At this point, {x: 0, y: 0} is a point on position {x: 100, y: 100} of the canvas
		y: -25,
		width: 50,
		height: 50,
		draw: [
			{fill: 'purple'}
		]
	})
```
