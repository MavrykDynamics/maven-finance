// view
import Icon from '../../app/App.components/Icon/Icon.view'
import Carousel from '../../app/App.components/Carousel/Carousel.view'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'

// const
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'

// styles
import { Page } from 'styles'
import { DataFeedsStyled } from './DataFeeds.styles'

export const DataFeeds = () => {
  return (
    <Page>
      <PageHeader page={'data-feeds'} kind={PRIMARY} loading={false} />
      <DataFeedsStyled>
        <h1>Data feeds</h1>
      </DataFeedsStyled>
    </Page>
  )
}
