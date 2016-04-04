import {div, button} from '@cycle/dom';

import {Observable} from 'rx';

function view (count) {
  return (
    div('.counter', [
      div('.count', `Count: ${count}`),
      button('.subtract', 'Subtract'),
      button('.add', 'Add')
    ])
  );
}

export default function App ({Canvas, Keys}) {
  return {
    Canvas: Observable.just(
      [
        {
          kind: 'rect',
          x: 10,
          y: 10,
          width: 250,
          height: 50,
          draw: [
            {fill: 'gray'},
            {stroke: 'black', lineWidth: 2}
          ],

          children: [
            {
              kind: 'text',
              x: 5,
              y: 35,
              value: 'This is a test',
              font: '40px sanserif',
              draw: [
                {stroke: 'red'},
                {fill: 'black'}
              ]
            }
          ]
        }
      ]
    )
  };
}
