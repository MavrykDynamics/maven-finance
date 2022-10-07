import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'
// style
import { DoormanList, DoormanStatsHeader, DoormanStatsStyled } from './DoormanStats.style'

type DoormanStatsViewProps = {
  loading: boolean
  mvkTotalSupply?: number
  totalStakedMvkSupply?: number
}

export const DoormanStatsView = ({ loading, mvkTotalSupply, totalStakedMvkSupply }: DoormanStatsViewProps) => {
  const stakedMvkTokens = totalStakedMvkSupply ?? 0
  const mli = calcMLI(mvkTotalSupply, totalStakedMvkSupply)
  const fee = calcExitFee(mvkTotalSupply, totalStakedMvkSupply)
  const { exchangeRate, mvkTokenStorage } = useSelector((state: State) => state.mvkToken)
  const { doormanAddress, mvkTokenAddress } = useSelector((state: State) => state.contractAddresses)
  const totalSupply = (mvkTokenStorage?.totalSupply ?? 0) + stakedMvkTokens
  const maximumTotalSupply = mvkTokenStorage?.maximumTotalSupply ?? 0

  const marketCapValue = exchangeRate ? exchangeRate * totalSupply : 0
  const maxSupplyCapValue = exchangeRate ? exchangeRate * maximumTotalSupply : 0

  return (
    <DoormanStatsStyled>
      <DoormanStatsHeader>Key MVK Metrics</DoormanStatsHeader>
      <DoormanList>
        <div>
          <h4>
            MVK Price

            <a
              href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
              target="_blank"
              rel="noreferrer"
            >
              <Icon id="question" />
            </a>
          </h4>
          <var>
            <CommaNumber value={exchangeRate} loading={loading} endingText={'USD'} />
          </var>
        </div>

        {mvkTokenAddress?.address ? (
          <div>
            <h4>MVK Token Address</h4>
            <var className="click-address">
              <TzAddress tzAddress={mvkTokenAddress?.address} hasIcon={false} />
            </var>
          </div>
        ) : null}

        {doormanAddress?.address ? (
          <div>
            <h4>Doorman Address</h4>
            <var className="click-address">
              <TzAddress tzAddress={doormanAddress?.address} hasIcon={false} />
            </var>
          </div>
        ) : null}

        <div>
          <h4>
            MVK Loyalty Index
            <a
              href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
              target="_blank"
              rel="noreferrer"
            >
              <Icon id="question" />
            </a>
          </h4>
          <var>
            <CommaNumber value={mli} loading={loading} endingText={' '} />
          </var>
        </div>

        <div>
          <h4>
            Exit Fee
            <a
              href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
              target="_blank"
              rel="noreferrer"
            >
              <Icon id="question" />
            </a>
          </h4>
          <var>
            <CommaNumber value={fee} loading={loading} endingText={'%'} />
          </var>
        </div>

        <div>
          <h4>Total Staked MVK</h4>
          <var>
            <CommaNumber value={stakedMvkTokens} loading={loading} endingText={'MVK'} />
          </var>
        </div>

        <div>
          <h4>Total Circulating</h4>
          <var>
            <CommaNumber value={totalSupply} loading={loading} endingText={'MVK'} />
          </var>
        </div>

        <div>
          <h4>Max Supply</h4>
          <var>
            <CommaNumber value={maxSupplyCapValue} loading={loading} endingText={'USD'} />
          </var>
        </div>

        <div>
          <h4>Market Cap</h4>
          <var>
            <CommaNumber value={marketCapValue} loading={loading} endingText={'USD'} />
          </var>
        </div>

        {/* <div>
          <h4>Total supply</h4>
          <var>
            <CommaNumber value={maximumTotalSupply} loading={loading} endingText={'MVK'} />
          </var>
        </div> */}
      </DoormanList>
    </DoormanStatsStyled>
  )
}
