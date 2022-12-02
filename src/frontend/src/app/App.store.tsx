import { applyMiddleware, combineReducers, compose, createStore, Store } from 'redux'
import thunk from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

import { reducers, State } from '../reducers'
import { googleAnalytics } from './App.analytics'

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: Function
  }
}

// const persistConfig = {
//   key: 'root',
//   storage,
//   blacklist: ['wallet', 'loading', 'modal', 'exitFeeModal', 'satelliteRecord', 'toaster', 'progressBar', 'user'],
// }

export function configureStore(preloadedState: object) {
  const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        trace: true,
        traceLimit: 25,
      })
    : compose
  // const presistedReducer = persistReducer(persistConfig, reducers)
  // console.log('reducers', reducers)

  // const reducer = combineReducers(reducers)
  // console.log('reducer', reducer)

  const store: Store<State> = createStore(
    reducers,
    preloadedState,
    composeEnhancer(applyMiddleware(googleAnalytics), applyMiddleware(thunk)),
  )

  // const persistor = persistStore(store)

  // return { store, persistor }
  return { store }
}
