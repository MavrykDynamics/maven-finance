import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { SatelliteItemStyle, SatelliteOracleStatusComponent } from './SatelliteCard.style'
import { getDate_MDY_Format } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { useHistory } from 'react-router'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { DataFeedSubTitleText } from 'pages/DataFeeds/details/DataFeedsDetails.style'

export const OracleCard = ({ oracle }: { oracle: SatelliteRecord }) => {
  const history = useHistory()

  return (
    <SatelliteItemStyle onClick={() => history.push(`/feed-details/${oracle.address}/`)} oracle>
      <div className="item">
        <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
          Oracle
        </DataFeedSubTitleText>
        <TzAddress tzAddress={oracle.address} hasIcon type="secondary" />
      </div>
      <div className="item">
        <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
          Answer
        </DataFeedSubTitleText>
        <var>$ priceeee</var>
      </div>
      <div className="item">
        <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
          Date
        </DataFeedSubTitleText>
        <var>{getDate_MDY_Format(oracle.unregisteredDateTime?.toString() || '')}</var>
      </div>
      <div className="item center-v">
        <SatelliteOracleStatusComponent statusType="responded">responded</SatelliteOracleStatusComponent>
      </div>
      <div className="svg-wrapper">
        <svg>
          <use xlinkHref="/icons/sprites.svg#openLink" />
        </svg>
      </div>
    </SatelliteItemStyle>
  )
}
