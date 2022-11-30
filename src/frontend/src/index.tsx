import * as React from 'react'
import ReactDOM from 'react-dom'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Provider } from 'react-redux'
// import { PersistGate } from "redux-persist/integration/react";

import DarkThemeProvider from './app/App.components/DarkThemeProvider/DarkThemeProvider.view'
// import { App, store, persistor } from "./app/App.controller";
import { App, store } from './app/App.controller'
import reportWebVitals from './reportWebVitals'
import { unregister } from './serviceWorker'
import { GlobalStyle } from './styles'
import { isMobile } from './utils/device-info'
import Mobile from './app/App.components/Mobile/Mobile.view'

import './styles/fonts.css'

export const Root = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY} language="en">
      <Provider store={store}>
        {/* <PersistGate loading={null} persistor={persistor}> */}
        <DarkThemeProvider>
          <GlobalStyle />
          {isMobile ? <Mobile /> : <App />}
        </DarkThemeProvider>
        {/* </PersistGate> */}
      </Provider>
    </GoogleReCaptchaProvider>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<Root />, rootElement)

unregister()
reportWebVitals()
