import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { DataFeedSubTitleText } from 'pages/DataFeeds/details/DataFeedsDetails.style'
import { getOracleStatus, ORACLE_STATUSES_MAPPER } from 'pages/Satellites/helpers/Satellites.consts'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

import { SatelliteItemStyle, SatelliteOracleStatusComponent } from './SatelliteCard.style'

// TODO: date and answer
export const OracleCard = ({ oracle }: { oracle: SatelliteRecord }) => {
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const oracleStatusType = getOracleStatus(oracle, feeds)

  return (
    <Link to={`/satellites/satellite-details/${oracle.address}`}>
      <SatelliteItemStyle oracle>
        <div className="item">
          <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
            Oracle
          </DataFeedSubTitleText>
          <TzAddress tzAddress={oracle.address} hasIcon type="secondary" />
        </div>
        <div className="item">
          <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
            sMVK Rewards
          </DataFeedSubTitleText>
          <var>
            <CommaNumber
              showDecimal
              value={oracle.oracleRecords.reduce<number>((acc, { sMVKReward }) => (acc += sMVKReward), 0)}
            />
          </var>
        </div>
        <div className="item">
          <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
            XTZ Rewards
          </DataFeedSubTitleText>
          <var>
            <CommaNumber
              showDecimal
              value={oracle.oracleRecords.reduce<number>((acc, { XTZReward }) => (acc += XTZReward), 0)}
            />
          </var>
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
    </Link>
  )
}
