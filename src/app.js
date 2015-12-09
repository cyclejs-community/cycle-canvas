import {div, button} from '@cycle/dom';

export default function App ({DOM}) {
  const count$ = DOM
    .select('.add')
    .events('click')
    .map(_ => +1)
    .scan((total, change) => total + change)
    .startWith(0);

  return {
    DOM: count$.map(count =>
      div('.foo', [
        div('.count', count.toString()),
        button('.add', '+')
      ])
    )
  };
}
