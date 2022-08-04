import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { SatelliteItemStyle, SatelliteOracleStatusComponent } from './SatelliteCard.style'
import { getDate_MDY_Format } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { useHistory } from 'react-router'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { DataFeedSubTitleText } from 'pages/DataFeeds/details/DataFeedsDetails.style'
import { getOracleStatus, ORACLE_STATUSES_MAPPER } from 'pages/Satellites/helpers/Satellites.consts'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// TODO: date and answer
export const OracleCard = ({ oracle }: { oracle: SatelliteRecord }) => {
  const history = useHistory()
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const oracleStatusType = getOracleStatus(oracle, feeds)

  return (
    <SatelliteItemStyle onClick={() => history.push(`/satellites/satellite-details/${oracle.address}/`)} oracle>
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
        <SatelliteOracleStatusComponent statusType={oracleStatusType}>
          {ORACLE_STATUSES_MAPPER[oracleStatusType]}
        </SatelliteOracleStatusComponent>
      </div>
      <div className="svg-wrapper">
        <svg>
          <use xlinkHref="/icons/sprites.svg#openLink" />
        </svg>
      </div>
    </SatelliteItemStyle>
  )
}
