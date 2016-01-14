import isolate from '@cycle/isolate';
import {a, div, button, input} from '@cycle/dom';

import {Observable} from 'rx';

function searchWikipedia (term) {
  return `https://api.github.com/search/repositories?q=${term}`;
}

function renderResult (result) {
  return (
    div('.result', [
      div('.result-name', [
        a({href: `https://github.com/${result.full_name}`}, result.full_name),
        ` - ${result.stargazers_count} ★`
      ]),
      div('.result-description', result.description)
    ])
  );
}

function sortedByStars (results) {
  return results
    .sort((result, result2) => parseInt(result2.stargazers_count, 10) - parseInt(result.stargazers_count, 10))
}

function WikipediaSearchBox ({DOM, HTTP}) {
  const results$ = HTTP.mergeAll()
    .do(console.log.bind(console, 'response'))
    .map(response => JSON.parse(response.text))
    .startWith({items: []});

  const searchTerm$ = DOM
    .select('.search-term')
    .events('input')
    .debounce(300)
    .map(ev => ev.target.value)

  return {
    DOM: results$.do(console.log.bind(console, 'results')).map(results =>
      div('.search-box', [
        input('.search-term'),
        div('.results', sortedByStars(results.items).map(renderResult))
      ])
    ),

    HTTP: searchTerm$.map(searchWikipedia)
  };
}

export default function App ({DOM, HTTP}) {
  const searchBox = isolate(WikipediaSearchBox)({DOM, HTTP});

  const vtree$ = Observable.combineLatest(
    searchBox.DOM,
    (...vtrees) => (
      div('.app', vtrees)
    )
  );

  return {
    DOM: vtree$,
    HTTP: searchBox.HTTP
  };
}
