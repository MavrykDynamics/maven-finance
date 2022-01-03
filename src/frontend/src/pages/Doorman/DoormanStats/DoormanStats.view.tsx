// prettier-ignore
import { ButtonLoadingIcon } from 'app/App.components/Button/Button.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { DoormanStatsGrid, DoormanStatsStyled } from './DoormanStats.style'

type DoormanStatsViewProps = {
  loading: boolean
  mvkTotalSupply?: number
  totalStakedMvkSupply?: number
}

export const DoormanStatsView = ({ loading, mvkTotalSupply, totalStakedMvkSupply }: DoormanStatsViewProps) => {
  const mvkTokens = (mvkTotalSupply ?? 0) / 1000000
  const stakedMvkTokens = (totalStakedMvkSupply ?? 0) / 1000000
  const mli = (stakedMvkTokens / ((mvkTokens + stakedMvkTokens) | 1)) * 100
  const fee = 500 / (mli + 5)
  return (
    <DoormanStatsStyled>
      <DoormanStatsGrid>
        <div>MVK Total Supply</div>
        <div>Staked MVK Total Supply</div>

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
            <CommaNumber value={mvkTokens} endingText={'MVK'} />
            <CommaNumber value={stakedMvkTokens} endingText={'MVK'} />
            <div>
              MLI{' '}
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
            <p>{mli.toFixed(2)} %</p>
            <p>{fee.toFixed(2)} %</p>
          </>
        )}
      </DoormanStatsGrid>
    </DoormanStatsStyled>
  )
}
