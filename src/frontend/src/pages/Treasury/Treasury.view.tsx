import { useState, useMemo, useEffect, useRef } from 'react'

// view
import { TreasuryType } from 'utils/TypesAndInterfaces/Treasury'
import PieChartView from '../../app/App.components/PieСhart/PieСhart.view'

// helpers
import { scrollToFullView } from 'utils/scrollToFullView'

// style
import { TreasuryViewStyle, TzAddress } from './Treasury.style'
import { getPieChartData } from './helpers/calculateChartData'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { columnNames, fieldsMapper } from 'pages/Dashboard/TabScreens/TreasuryTab.controller'
import { SimpleTable } from 'app/App.components/SimpleTable/SimpleTable.controller'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

type Props = {
  treasury: TreasuryType
  isGlobal?: boolean
  factoryAddress?: string
}

export default function TreasuryView({ treasury, isGlobal = false, factoryAddress = '' }: Props) {
  const [hoveredPath, setHoveredPath] = useState<null | string>(null)
  const [showZeroTreasuries, setShowZeroTreasuries] = useState<Boolean>(false)
  const ref = useRef<HTMLDivElement | null>(null)

  const filteredBalance = useMemo(
    () =>
      isGlobal || !showZeroTreasuries
        ? treasury.balances
        : treasury.balances.filter((item) => Number(item.balance) > 0.01),
    [isGlobal, showZeroTreasuries, treasury.balances],
  )

  const chartData = useMemo(() => {
    return getPieChartData(filteredBalance, treasury.treasuryTVL, hoveredPath)
  }, [hoveredPath, treasury.treasuryTVL, filteredBalance])

  useEffect(() => {
    if (treasury) {
      scrollToFullView(ref.current)
    }
  }, [treasury])

  return (
    <TreasuryViewStyle ref={ref}>
      <a href="https://mavryk.finance" target="_blank" rel="noreferrer" className="treasuryTooltip-link">
        <CustomTooltip iconId="question" className="treasuryTooltip" />
      </a>

      <div className="content-wrapper">
        <header>
          {treasury.name ? <h1 title={treasury.name}>{treasury.name}</h1> : null}
          {isGlobal ? (
            <var>
              <CommaNumber beginningText="$" value={treasury.treasuryTVL} />
            </var>
          ) : null}
        </header>
        {factoryAddress ? (
          <div className="info-block">
            <div className="text">Treasury Factory address</div>
            <div className="value">
              <TzAddress type={BLUE} tzAddress={factoryAddress} hasIcon={true} />
            </div>
          </div>
        ) : null}
        <div>
          {!isGlobal ? (
            <>
              <div className="info-block not-global">
                <p className="text">TVL</p>
                <p className="value">
                  <CommaNumber beginningText="$" value={treasury.treasuryTVL} />
                </p>
                <div />
              </div>
              <div className="info-block not-global">
                <p className="text">Treasury Address</p>
                <p className="value">
                  <CommaNumber beginningText="$" value={treasury.treasuryTVL} />
                </p>
                <div />
              </div>

              <Checkbox
                id={'show_dropped'}
                onChangeHandler={() => {
                  setShowZeroTreasuries(!showZeroTreasuries)
                }}
                checked={showZeroTreasuries}
                className={'treasury-checkbox'}
              >
                <span>Hide assets with a balance of 0</span>
              </Checkbox>
            </>
          ) : null}

          <SimpleTable
            colunmNames={columnNames}
            data={filteredBalance}
            fieldsMapper={fieldsMapper}
            className="treasury-st"
          />
        </div>
      </div>
      <div>
        <PieChartView chartData={chartData} />
      </div>
      <div>
        <div className="asset-lables scroll-block">
          {filteredBalance.map((balanceValue) => (
            <div
              style={{
                background: `linear-gradient(90deg,${
                  chartData.find(({ title }) => title === balanceValue.symbol || title.includes(balanceValue.symbol))
                    ?.color
                } 0%,rgba(255,255,255,0) 100%)`,
              }}
              className="asset-lable"
              onMouseEnter={() => {
                setHoveredPath(balanceValue.symbol)
              }}
              onMouseLeave={() => setHoveredPath(null)}
              key={balanceValue.contract + balanceValue.symbol}
            >
              <p className="asset-lable-text">{balanceValue.symbol}</p>
            </div>
          ))}
        </div>
      </div>
    </TreasuryViewStyle>
  )
}
