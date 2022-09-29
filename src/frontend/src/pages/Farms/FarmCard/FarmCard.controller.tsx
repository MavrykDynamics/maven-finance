import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import type { FarmsViewVariantType } from '../Farms.controller'

// view
import Expand from '../../../app/App.components/Expand/Expand.view'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { ConnectWallet } from '../../../app/App.components/ConnectWallet/ConnectWallet.controller'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import { deposit, harvest, withdraw } from '../Farms.actions'
import { showModal } from '../../../app/App.components/Modal/Modal.actions'
import Icon from '../../../app/App.components/Icon/Icon.view'
import RoiCalculator from '../RoiCalculator/RoiCalculator.controller'
import CoinsIcons from '../../../app/App.components/Icon/CoinsIcons.view'

// const
import { SELECT_FARM_ADDRESS } from '../Farms.actions'
import { FARM_DEPOSIT, FARM_WITHDRAW } from '../../../app/App.components/Modal/Modal.constants'

// helpers
import { calculateAPR } from '../Farms.helpers'

// styles
import { FarmCardStyled, FarmHarvestStyled, FarmStakeStyled } from './FarmCard.style'
import { FarmStorage } from 'utils/TypesAndInterfaces/Farm'
import { UserFarmRewardsData } from 'utils/TypesAndInterfaces/User'

const QuestionLinkBlock = () => (
  <a className="info-link" href="https://mavryk.finance/litepaper#yield-farming" target="_blank" rel="noreferrer">
    <Icon id="question" />
  </a>
)

const LogoHeaderContent = ({
  firstToken,
  secondToken,
  name,
  subtitle,
}: {
  name: string
  firstToken: FarmStorage[number]['lpToken1']
  secondToken: FarmStorage[number]['lpToken2']
  subtitle?: string
}) => (
  <div className="farm-card-header">
    <CoinsIcons firstAssetLogoSrc={firstToken.address} secondAssetLogoSrc={secondToken.address} />
    <div className="farm-card-section">
      <h3>{name}</h3>
      {subtitle && <div className="subtitle">{subtitle}</div>}
    </div>
  </div>
)

const AprBlock = ({ valueAPR, triggerCalculatorModal }: { valueAPR: number; triggerCalculatorModal: () => void }) => (
  <div className="farm-info">
    <h3>APY</h3>
    <div className="btn-info">
      <var>
        <CommaNumber value={valueAPR} endingText="%" />
      </var>
      <button onClick={triggerCalculatorModal} className="calc-button">
        <Icon id="calculator" />
      </button>
    </div>
  </div>
)

const TotalLiquidityBlock = ({ totalLiquidity }: { totalLiquidity: number }) => (
  <div className="farm-info">
    <h3>Total Liquidity</h3>
    <var>
      <CommaNumber value={totalLiquidity} beginningText="$" />
    </var>
  </div>
)

const EarnBlock = () => (
  <div className="farm-info">
    <h3>Earn</h3>
    <var>sMVK+Fees</var>
  </div>
)

const StakedBlock = ({
  myFarmStakedBalance,
  token1Symbol,
  token2Symbol,
}: {
  token1Symbol: string
  token2Symbol: string
  myFarmStakedBalance: number
}) => (
  <div className="farm-info">
    <h3>{token1Symbol && token2Symbol ? `${token1Symbol} - ${token2Symbol}` : ''} LP staked</h3>
    <var>
      <CommaNumber value={Number(myFarmStakedBalance)} />
    </var>
  </div>
)

const LinksBlock = ({
  farmAddress,
  token1Symbol,
  token2Symbol,
}: {
  farmAddress: string
  token1Symbol: string
  token2Symbol: string
}) => (
  <div className="links-block">
    {token1Symbol && token2Symbol ? (
      <a target="_blank" rel="noreferrer" href="https://mavryk.finance/">
        Get {`${token1Symbol} - ${token2Symbol}`} <Icon id="send" />
      </a>
    ) : null}
    <a target="_blank" rel="noreferrer" href={`https://tzkt.io/${farmAddress}`}>
      View Contract <Icon id="send" />
    </a>
  </div>
)

const HarvestBlock = ({
  userReward,
  harvestRewards,
}: {
  userReward: UserFarmRewardsData
  harvestRewards: () => void
}) => (
  <FarmHarvestStyled className="farm-harvest">
    <div className="farm-info">
      <h3>sMVK Earned</h3>
      <var>{userReward?.myAvailableFarmRewards.toFixed(2) ?? '0.00'}</var>
    </div>
    <Button kind="actionPrimary" text={'Harvest'} onClick={harvestRewards} disabled={!userReward} />
  </FarmHarvestStyled>
)

const FarmingBlock = ({
  triggerDepositModal,
  triggerWithdrawModal,
  token1Symbol,
  token2Symbol,
  accountPhk,
  farmAccounts,
  isFarmLive,
}: {
  triggerDepositModal: () => void
  triggerWithdrawModal: () => void
  isFarmLive: boolean
  token1Symbol: string
  token2Symbol: string
  accountPhk?: string
  farmAccounts: FarmStorage[number]['farmAccounts']
}) => {
  const depositedAmount = farmAccounts.find(({ user_id }) => accountPhk === user_id)?.deposited_amount ?? 0
  return (
    <>
      {!accountPhk ? (
        <div className="start-farming">
          <h3>Start Farming</h3>
          <ConnectWallet />
        </div>
      ) : (
        <FarmStakeStyled className="farm-stake">
          <StakedBlock myFarmStakedBalance={depositedAmount} token1Symbol={token1Symbol} token2Symbol={token2Symbol} />
          {isFarmLive ? (
            <div className="circle-buttons">
              <Button text="Stake LP" kind="actionPrimary" icon="in" onClick={triggerDepositModal} />
              <Button text="UnStake LP" kind="actionSecondary" icon="out" onClick={triggerWithdrawModal} />
            </div>
          ) : null}
        </FarmStakeStyled>
      )}
    </>
  )
}

type FarmCardViewProps = {
  farm: FarmStorage[number]
  visibleModal: boolean
  aprValue: number
  accountPkh?: string
  isOpenedCard: boolean
  userReward: UserFarmRewardsData
  closeCalculatorModal: () => void
  triggerWithdrawModal: () => void
  triggerDepositModal: () => void
  harvestRewards: () => void
  expandBlockCallback: () => void
  triggerCalculatorModal: () => void
}

const VerticalFarmComponent = ({
  farm,
  visibleModal,
  isOpenedCard,
  userReward,
  aprValue,
  accountPkh,
  triggerWithdrawModal,
  closeCalculatorModal,
  triggerDepositModal,
  harvestRewards,
  expandBlockCallback,
  triggerCalculatorModal,
}: FarmCardViewProps) => {
  return (
    <FarmCardStyled key={farm.address} className={`contractCard accordion} vertical ${isOpenedCard ? 'opened' : ''}`}>
      <QuestionLinkBlock />
      <LogoHeaderContent
        name={
          farm.lpToken1.symbol && farm.lpToken2.symbol ? `${farm.lpToken1.symbol} - ${farm.lpToken2.symbol}` : farm.name
        }
        subtitle={farm.farmContract?.creator?.alias}
        firstToken={farm.lpToken1}
        secondToken={farm.lpToken2}
      />
      <div className="farm-info-vertical">
        <AprBlock valueAPR={aprValue} triggerCalculatorModal={triggerCalculatorModal} />
        <EarnBlock />
        <TotalLiquidityBlock totalLiquidity={farm.lpBalance} />
      </div>
      <div className="vertical-harvest">
        <HarvestBlock userReward={userReward} harvestRewards={harvestRewards} />
      </div>
      <div className="vertical-harvest">
        <FarmingBlock
          isFarmLive={farm.isLive}
          token1Symbol={farm.lpToken1.symbol}
          token2Symbol={farm.lpToken2.symbol}
          accountPhk={accountPkh}
          farmAccounts={farm.farmAccounts}
          triggerDepositModal={triggerDepositModal}
          triggerWithdrawModal={triggerWithdrawModal}
        />
      </div>

      <Expand
        className="vertical-expand"
        onClickCallback={expandBlockCallback}
        isExpandedByDefault={isOpenedCard}
        showText
      >
        <LinksBlock
          farmAddress={farm.address}
          token1Symbol={farm.lpToken1.symbol}
          token2Symbol={farm.lpToken2.symbol}
        />
      </Expand>
      {visibleModal ? <RoiCalculator lpTokenAddress={farm.lpTokenAddress} onClose={closeCalculatorModal} /> : null}
    </FarmCardStyled>
  )
}

const HorisontalFarmComponent = ({
  farm,
  visibleModal,
  isOpenedCard,
  userReward,
  aprValue,
  accountPkh,
  triggerWithdrawModal,
  closeCalculatorModal,
  triggerDepositModal,
  harvestRewards,
  expandBlockCallback,
  triggerCalculatorModal,
}: FarmCardViewProps) => {
  return (
    <FarmCardStyled className={`contractCard  horizontal ${isOpenedCard ? 'opened' : ''}`}>
      <QuestionLinkBlock />
      <Expand
        onClickCallback={expandBlockCallback}
        isExpandedByDefault={isOpenedCard}
        header={
          <>
            <LogoHeaderContent
              name={
                farm.lpToken1.symbol && farm.lpToken2.symbol
                  ? `${farm.lpToken1.symbol} - ${farm.lpToken2.symbol}`
                  : farm.name
              }
              subtitle={farm.farmContract?.creator?.alias}
              firstToken={farm.lpToken1}
              secondToken={farm.lpToken2}
            />
            <EarnBlock />
            <AprBlock valueAPR={aprValue} triggerCalculatorModal={triggerCalculatorModal} />
            <TotalLiquidityBlock totalLiquidity={farm.lpBalance} />
          </>
        }
      >
        <div className="horizontal-expand">
          <HarvestBlock harvestRewards={harvestRewards} userReward={userReward} />
          <FarmingBlock
            isFarmLive={farm.isLive}
            accountPhk={accountPkh}
            token1Symbol={farm.lpToken1.symbol}
            token2Symbol={farm.lpToken2.symbol}
            farmAccounts={farm.farmAccounts}
            triggerDepositModal={triggerDepositModal}
            triggerWithdrawModal={triggerWithdrawModal}
          />
          <LinksBlock
            farmAddress={farm.address}
            token1Symbol={farm.lpToken1.symbol}
            token2Symbol={farm.lpToken2.symbol}
          />
        </div>
      </Expand>
      {visibleModal ? <RoiCalculator lpTokenAddress={farm.lpTokenAddress} onClose={closeCalculatorModal} /> : null}
    </FarmCardStyled>
  )
}

type FarmCardProps = {
  farm: FarmStorage[number]
  currentRewardPerBlock: number
  variant: FarmsViewVariantType
  depositAmount: number
  isOpenedCard: boolean
  expandCallback: (address: string) => void
}

export const FarmCard = ({ farm, variant, isOpenedCard, currentRewardPerBlock, expandCallback }: FarmCardProps) => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    user: { myFarmRewardsData },
  } = useSelector((state: State) => state.user)

  const [visibleModal, setVisibleModal] = useState(false)

  const valueAPR = calculateAPR(currentRewardPerBlock, farm.lpBalance)
  const userReward = myFarmRewardsData[farm.address]

  const harvestRewards = () => {
    dispatch(harvest(farm.address))
  }

  const setReduxFarmAddress = async () => {
    await dispatch({
      type: SELECT_FARM_ADDRESS,
      selectedFarmAddress: farm.address,
    })
  }

  const triggerDepositModal = async () => {
    await setReduxFarmAddress()
    await dispatch(showModal(FARM_DEPOSIT))
  }

  const triggerWithdrawModal = async () => {
    await setReduxFarmAddress()
    await dispatch(showModal(FARM_WITHDRAW))
  }

  const triggerCalculatorModal = async () => {
    await setReduxFarmAddress()
    setVisibleModal(true)
  }

  const closeCalculatorModal = async () => {
    setVisibleModal(false)
    await dispatch({ type: SELECT_FARM_ADDRESS, selectedFarmAddress: '' })
  }

  const expandBlockCallback = () => {
    expandCallback(farm.address)
  }

  return variant === 'vertical' ? (
    <VerticalFarmComponent
      farm={farm}
      visibleModal={visibleModal}
      isOpenedCard={isOpenedCard}
      userReward={userReward}
      closeCalculatorModal={closeCalculatorModal}
      expandBlockCallback={expandBlockCallback}
      aprValue={valueAPR}
      triggerCalculatorModal={triggerCalculatorModal}
      triggerDepositModal={triggerDepositModal}
      triggerWithdrawModal={triggerWithdrawModal}
      harvestRewards={harvestRewards}
      accountPkh={accountPkh}
    />
  ) : (
    <HorisontalFarmComponent
      farm={farm}
      accountPkh={accountPkh}
      visibleModal={visibleModal}
      isOpenedCard={isOpenedCard}
      userReward={userReward}
      closeCalculatorModal={closeCalculatorModal}
      expandBlockCallback={expandBlockCallback}
      aprValue={valueAPR}
      triggerCalculatorModal={triggerCalculatorModal}
      triggerDepositModal={triggerDepositModal}
      triggerWithdrawModal={triggerWithdrawModal}
      harvestRewards={harvestRewards}
    />
  )
}
