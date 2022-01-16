// prettier-ignore
import { ButtonLoadingIcon } from 'app/App.components/Button/Button.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { DoormanStatsGrid, DoormanStatsStyled } from './DoormanStats.style'
import { PRECISION_NUMBER } from '../../../utils/constants'
import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'

type DoormanStatsViewProps = {
  loading: boolean
  mvkTotalSupply?: number
  totalStakedMvkSupply?: number
}

export const DoormanStatsView = ({ loading, mvkTotalSupply, totalStakedMvkSupply }: DoormanStatsViewProps) => {
  const mvkTokens = (mvkTotalSupply ?? 0) / PRECISION_NUMBER
  const stakedMvkTokens = totalStakedMvkSupply ?? 0
  const mli = calcMLI(mvkTotalSupply, totalStakedMvkSupply)
  const fee = calcExitFee(mvkTotalSupply, totalStakedMvkSupply)
  return (
    <DoormanStatsStyled>
      <DoormanStatsGrid>
        <div>MVK Total Supply</div>
        <div>Total Staked MVK Supply</div>
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
              MVK Loyalty Index{' '}
              <a
                href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
                target="_blank"
                rel="noreferrer"
              >
                [?]
              </a>
            </div>
            <div>
              Exit Fee{' '}
              <a
                href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
                target="_blank"
                rel="noreferrer"
              >
                [?]
              </a>
            </div>
            <p>{mli.toFixed(2)}</p>
            <p>{fee.toFixed(2)} %</p>
          </>
        )}
      </DoormanStatsGrid>
    </DoormanStatsStyled>
  )
}
