// prettier-ignore
import { DoormanStatsStyled, DoormanStatsGrid } from './DoormanStats.style'

type DoormanStatsViewProps = {
  loading: boolean
  mvkTotalSupply?: number
  vMvkTotalSupply?: number
}

export const DoormanStatsView = ({ loading, mvkTotalSupply, vMvkTotalSupply }: DoormanStatsViewProps) => {
  const mvkTokens = (mvkTotalSupply ?? 0) / 1000000
  const vMvkTokens = (vMvkTotalSupply ?? 0) / 1000000
  const mli = (vMvkTokens / ((mvkTokens + vMvkTokens) | 1)) * 100
  const fee = 500 / mli + 5

  return (
    <DoormanStatsStyled>
      <DoormanStatsGrid>
        <div>MVK Total Supply</div>
        <div>vMVK Total Supply</div>
        <p>{mvkTokens.toFixed(2)} MVK</p>
        <p>{vMvkTokens.toFixed(2)} vMVK</p>
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
      </DoormanStatsGrid>
    </DoormanStatsStyled>
  )
}
