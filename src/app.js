import isolate from '@cycle/isolate';
import {div, button} from '@cycle/dom';

import {Observable} from 'rx';

function Counter ({DOM}) {
  const add$ = DOM
    .select('.add')
    .events('click')
    .map(_ => +1);

  const subtract$ = DOM
    .select('.subtract')
    .events('click')
    .map(_ => -1);

  const count$ = add$.merge(subtract$)
    .scan((total, change) => total + change)
    .startWith(0);

  return {
    DOM: count$.map(count =>
      div('.foo', [
        div('.count', count.toString()),
        button('.add', '+'),
        button('.subtract', '-')
      ])
    )
  };
}

export default function App ({DOM}) {
  const counter1 = isolate(Counter)({DOM});
  const counter2 = isolate(Counter)({DOM});

  const vtree$ = Observable.combineLatest(
    counter1.DOM,
    counter2.DOM,
    (counter1DOM, counter2DOM) => (
      div('.app', [
        counter1DOM,
        counter2DOM
      ])
    )
  );

  return {
    DOM: vtree$
  };
}
