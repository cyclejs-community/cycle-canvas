import {div, button} from '@cycle/dom';

export default function App ({DOM}) {
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
