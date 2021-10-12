import { applyMiddleware, compose, createStore, Store } from 'redux'
import thunk from 'redux-thunk'

import { reducers, State } from '../reducers'
import { googleAnalytics } from './App.analytics'

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
  }
}

export function configureStore(preloadedState: any) {
  const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true, traceLimit: 25 })
    : compose

  const store: Store<State> = createStore(
    reducers,
    preloadedState,
    composeEnhancer(applyMiddleware(googleAnalytics), applyMiddleware(thunk)),
  )

  return store
}
