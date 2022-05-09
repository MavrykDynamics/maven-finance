import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// prettier-ignore
import { ButtonLoadingIcon } from 'app/App.components/Button/Button.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'

import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'
import { DoormanStatsGrid, DoormanStatsStyled, DoormanStatsHeader, DoormanList } from './DoormanStats.style'

type DoormanStatsViewProps = {
  loading: boolean
  mvkTotalSupply?: number
  totalStakedMvkSupply?: number
}

export const DoormanStatsView = ({ loading, mvkTotalSupply, totalStakedMvkSupply }: DoormanStatsViewProps) => {
  const mvkTokens = mvkTotalSupply ?? 0
  const stakedMvkTokens = totalStakedMvkSupply ?? 0
  const mli = calcMLI(mvkTotalSupply, totalStakedMvkSupply)
  const fee = calcExitFee(mvkTotalSupply, totalStakedMvkSupply)
  const { user } = useSelector((state: State) => state.user)

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
          <h4>Number of stakers</h4>
          <var></var>
        </div>
        <div>
          <h4>Circulating</h4>
          <var></var>
        </div>
        <div>
          <h4>Market cap</h4>
          <var></var>
        </div>
        <div>
          <h4>Max supply cap</h4>
          <var></var>
        </div>
        <div>
          <h4>Total supply</h4>
          <var>
            <CommaNumber value={mvkTokens} loading={loading} endingText={'MVK'} />
          </var>
        </div>
      </DoormanList>
      {/* <DoormanStatsGrid>
        <div>
          <h4 className={'primary bold'}>MVK Total Supply</h4>
        </div>
        <div>
          <h4 className={'primary bold'}>Total Staked MVK Supply</h4>
        </div>
        {mvkTokens <= 0 ? (
          <>
            <p>
              <ButtonLoadingIcon className={'transparent'}>
                <use xlinkHref="/icons/sprites.svg#loading" />
              </ButtonLoadingIcon>
              Loading...
            </p>
            <p>
              <ButtonLoadingIcon className={'transparent'}>
                <use xlinkHref="/icons/sprites.svg#loading" />
              </ButtonLoadingIcon>
              Loading...
            </p>
          </>
        ) : (
          <>
            <CommaNumber value={mvkTokens} loading={loading} endingText={'MVK'} />
            <CommaNumber value={stakedMvkTokens} loading={loading} endingText={'MVK'} />
            <div>
              <h4 className={'primary bold'}>
                MVK Loyalty Index{' '}
                <a
                  href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
                  target="_blank"
                  rel="noreferrer"
                >
                  [?]
                </a>
              </h4>
            </div>
            <div>
              <h4 className={'primary bold'}>
                Exit Fee{' '}
                <a
                  href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
                  target="_blank"
                  rel="noreferrer"
                >
                  [?]
                </a>
              </h4>
            </div>
            <CommaNumber value={mli} loading={loading} endingText={' '} />
            <CommaNumber value={fee} loading={loading} endingText={'%'} />
          </>
        )}
      </DoormanStatsGrid> */}
    </DoormanStatsStyled>
  )
}
