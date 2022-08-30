import ReactGA from 'react-ga'
import { Dispatch } from 'redux'

const options = {}

const trackPage = (page: string) => {
  ReactGA.set({
    page,
    ...options,
  })
  ReactGA.pageview(page)
}

let currentPage = ''

export const googleAnalytics =
  () =>
  (next: Dispatch) =>
  (action: {
    type: string
    payload: {
      location: {
        pathname: string
        search: string
      }
    }
  }) => {
    if (action.type === '@@router/LOCATION_CHANGE') {
      const nextPage = `${action.payload.location.pathname}${action.payload.location.search}`

      if (currentPage !== nextPage) {
        currentPage = nextPage
        trackPage(nextPage)
      }
    }

    return next(action)
  }
