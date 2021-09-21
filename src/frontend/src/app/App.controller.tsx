import { Home } from 'pages/Home/Home.controller'
import React from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'

import { Header } from './App.components/Header/Header.controller'

export const App = () => {
  return (
    <Router>
      <Header />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  )
}
