import {Observable} from 'rx';
import {div} from '@cycle/dom';

export default function App ({DOM}) {
  return {
    DOM: Observable.just(div('.hello-world', 'Change me!'))
  };
}
