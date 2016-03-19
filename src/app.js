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

export default function App ({DOM}) {
  const add$ = DOM
    .select('.add')
    .events('click')
    .map(ev => +1);

  const subtract$ = DOM
    .select('.subtract')
    .events('click')
    .map(ev => -1);

  const count$ = add$.merge(subtract$)
    .startWith(0)
    .scan((total, change) => total + change);

  return {
    DOM: count$.map(view)
  };
}
