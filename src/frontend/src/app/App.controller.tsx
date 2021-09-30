import { Home } from 'pages/Home/Home.controller'
import { Litepaper } from 'pages/Litepaper/Litepaper.controller'
import { Privacy } from 'pages/Privacy/Privacy.controller'
import React from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { Footer } from './App.components/Footer/Footer.controller'

import { Menu } from './App.components/Menu/Menu.controller'
import { Popup } from './App.components/Popup/Popup.controller'

export const App = () => {
  return (
    <Router>
      <Popup />
      <Menu />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/litepaper">
          <Litepaper />
        </Route>
        <Route exact path="/privacy">
          <Privacy />
        </Route>
      </Switch>
      <Footer />
    </Router>
  )
}
