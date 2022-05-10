// prettier-ignore
import { ButtonLoadingIcon } from 'app/App.components/Button/Button.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'
import { DoormanList, DoormanStatsGrid, DoormanStatsHeader, DoormanStatsStyled } from './DoormanStats.style'

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
  const { user } = useSelector((state: State) => state.user)
  const totalSupply = mvkTokenStorage?.totalSupply ?? 0
  const maximumTotalSupply = mvkTokenStorage?.maximumTotalSupply ?? 0

  const marketCapValue = exchangeRate ? exchangeRate * totalSupply : 0
  const maxSupplyCapValue = exchangeRate ? exchangeRate * maximumTotalSupply : 0

  return (
    <DoormanStatsStyled>
      <DoormanStatsHeader>MVK Staking contract details</DoormanStatsHeader>
      <DoormanList>
        {user?.myAddress ? (
          <div>
            <h4>Contract address</h4>
            <var className="click-addrese">
              <TzAddress tzAddress={user?.myAddress} hasIcon />
            </var>
          </div>
        ) : null}

        <div>
          <h4>Total staked MVK</h4>
          <var>
            <CommaNumber value={stakedMvkTokens} loading={loading} endingText={'MVK'} />
          </var>
        </div>

        <div>
          <h4>
            MVK Loyalty Index
            <a
              href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
              target="_blank"
              rel="noreferrer"
            >
              [?]
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
              [?]
            </a>
          </h4>
          <var>
            <CommaNumber value={fee} loading={loading} endingText={'%'} />
          </var>
        </div>

        <div>
          <h4>Circulating</h4>
          <var>
            <CommaNumber value={totalSupply} loading={loading} endingText={'MVK'} />
          </var>
        </div>

        <div>
          <h4>Market cap</h4>
          <var>
            <CommaNumber value={marketCapValue} loading={loading} endingText={'USD'} />
          </var>
        </div>

        <div>
          <h4>Max supply cap</h4>
          <var>
            <CommaNumber value={maxSupplyCapValue} loading={loading} endingText={'USD'} />
          </var>
        </div>

        <div>
          <h4>Total supply</h4>
          <var>
            <CommaNumber value={totalSupply} loading={loading} endingText={'MVK'} />
          </var>
        </div>
      </DoormanList>
    </DoormanStatsStyled>
  )
}
