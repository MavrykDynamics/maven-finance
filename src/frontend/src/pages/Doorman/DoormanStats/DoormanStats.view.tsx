// prettier-ignore
import { ButtonLoadingIcon } from 'app/App.components/Button/Button.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { DoormanStatsGrid, DoormanStatsStyled } from './DoormanStats.style'
import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'

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
  return (
    <DoormanStatsStyled>
      <DoormanStatsGrid>
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
      </DoormanStatsGrid>
    </DoormanStatsStyled>
  )
}
