import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import type { FarmsViewVariantType } from '../Farms.controller'

// view
import Expand from '../../../app/App.components/Expand/Expand.view'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { ButtonCircle } from '../../../app/App.components/Button/ButtonCircle.view'
import { ConnectWallet } from '../../../app/App.components/ConnectWallet/ConnectWallet.controller'
import { ColoredLine } from '../../../app/App.components/ColoredLine/ColoredLine.view'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import { deposit, harvest, withdraw } from '../Farms.actions'
import { ButtonIcon } from '../../../app/App.components/Button/Button.style'
import { showModal } from '../../../app/App.components/Modal/Modal.actions'
import Icon from '../../../app/App.components/Icon/Icon.view'
import RoiCalculator from '../RoiCalculator/RoiCalculator.controller'
import CoinsIcons from '../../../app/App.components/Icon/CoinsIcons.view'

// const
import { SELECT_FARM_ADDRESS } from '../Farms.actions'
import { FARM_DEPOSIT, FARM_WITHDRAW } from '../../../app/App.components/Modal/Modal.constants'

// helpers
import { calculateAPR } from '../Frams.helpers'

// styles
import { FarmCardStyled, FarmHarvestStyled, FarmStakeStyled } from './FarmCard.style'
import { FarmStorage } from 'utils/TypesAndInterfaces/Farm'

type FarmCardProps = {
  name: string
  farmAddress: string
  firstToken: FarmStorage[number]['lpToken1']
  secondToken: FarmStorage[number]['lpToken2']
  lpTokenBalance: number
  lpTokenAddress: string
  currentRewardPerBlock: number
  variant: FarmsViewVariantType
  totalLiquidity: number
  liquidity: number
  depositAmount: number
  isOpenedCard: boolean
  expandCallback: (address: string) => void
}
export const FarmCard = ({
  farmAddress,
  firstToken,
  secondToken,
  liquidity,
  totalLiquidity,
  lpTokenAddress,
  variant,
  name,
  lpTokenBalance,
  isOpenedCard,
  currentRewardPerBlock,
  depositAmount,
  expandCallback,
}: FarmCardProps) => {
  const dispatch = useDispatch()
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const {
    user: { myFarmRewardsData },
  } = useSelector((state: State) => state.user)
  const [visibleModal, setVisibleModal] = useState(false)
  const myFarmStakedBalance = 45645.8987
  const valueAPR = calculateAPR(currentRewardPerBlock, lpTokenBalance)

  const userReward = myFarmRewardsData[farmAddress]

  const harvestRewards = () => {
    dispatch(harvest(farmAddress))
  }

  const setReduxFarmAddress = async () => {
    await dispatch({
      type: SELECT_FARM_ADDRESS,
      selectedFarmAddress: farmAddress,
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

  const logoHeaderContent = (
    <div className="farm-card-header">
      <CoinsIcons firstAssetLogoSrc={firstToken.thumbnailUri} secondAssetLogoSrc={secondToken.thumbnailUri} />
      <div className="farm-card-section">
        <h3>{name}</h3>
      </div>
    </div>
  )

  const unclaimedSMVKBlock = (
    <div className="farm-info">
      <h3>Unclaimed sMVK</h3>
      <var>0.00</var>
    </div>
  )

  const aprBlock = (
    <div className="farm-info">
      <h3>APY</h3>
      <div className="btn-info">
        <var>{valueAPR}</var>
        <button onClick={triggerCalculatorModal} className="calc-button">
          <Icon id="calculator" />
        </button>
      </div>
    </div>
  )

  const liquidityBlock = (
    <div className="farm-info">
      <h3>Liquidity</h3>
      <var>
        <CommaNumber value={liquidity} beginningText="$" />
      </var>
    </div>
  )

  const totalLiquidityBlock = (
    <div className="farm-info">
      <h3>Total Liquidity</h3>
      <var>
        <CommaNumber value={totalLiquidity} beginningText="$" />
      </var>
    </div>
  )

  const earnBlock = (
    <div className="farm-info">
      <h3>Earn</h3>
      <var>sMVK+Fees</var>
    </div>
  )

  const stakedBlock = (
    <div className="farm-info">
      <h3>MVK-XTZ LP staked</h3>
      <var>
        <CommaNumber value={Number(myFarmStakedBalance)} />
      </var>
    </div>
  )

  const linksBlock = (
    <div className="links-block">
      <a target="_blank" rel="noreferrer" href="https://mavryk.finance/">
        Get MVK-tzBTC <Icon id="send" />
      </a>
      <a target="_blank" rel="noreferrer" href={`https://tzkt.io/${farmAddress}`}>
        View Contract <Icon id="send" />
      </a>
      <a target="_blank" rel="noreferrer" href={`https://tzkt.io/${lpTokenAddress}`}>
        See Pair Info <Icon id="send" />
      </a>
    </div>
  )

  const harvestBlock = (
    <FarmHarvestStyled className="farm-harvest">
      <div className="farm-info">
        <h3>sMVK Earned</h3>
        <var>{userReward?.myAvailableFarmRewards.toFixed(2) ?? '0.00'}</var>
      </div>
      <Button kind="actionPrimary" text={'Harvest'} onClick={harvestRewards} disabled={!userReward} />
    </FarmHarvestStyled>
  )

  const farmingBlock = (
    <>
      {!wallet || !ready ? (
        <div className="start-farming">
          <h3>Start Farming</h3>
          <ConnectWallet />
        </div>
      ) : (
        <FarmStakeStyled className="farm-stake">
          {stakedBlock}
          <div className="circle-buttons">
            <Button text="Stake LP" kind="actionPrimary" icon="in" onClick={triggerDepositModal} />
            <Button text="UnStake LP" kind="actionSecondary" icon="out" onClick={triggerWithdrawModal} />
          </div>
        </FarmStakeStyled>
      )}
    </>
  )

  const questionLinkBlock = (
    <a className="info-link" href="https://mavryk.finance/litepaper#yield-farming" target="_blank" rel="noreferrer">
      <Icon id="question" />
    </a>
  )

  const expandBlockCallback = () => {
    expandCallback(farmAddress)
  }

  if (variant === 'vertical') {
    return (
      <FarmCardStyled
        key={farmAddress}
        className={`contractCard accordion} ${variant} ${isOpenedCard ? 'opened' : ''}`}
      >
        {questionLinkBlock}
        {logoHeaderContent}
        <div className="farm-info-vertical">
          {aprBlock}
          {earnBlock}
          {totalLiquidityBlock}
        </div>
        <div className="vertical-harvest">{harvestBlock}</div>
        <div className="vertical-harvest">{farmingBlock}</div>

        <Expand
          className="vertical-expand"
          onClickCallback={expandBlockCallback}
          isExpandedByDefault={isOpenedCard}
          showText
          header={<></>}
        >
          {linksBlock}
        </Expand>
        {visibleModal ? <RoiCalculator lpTokenAddress={lpTokenAddress} onClose={closeCalculatorModal} /> : null}
      </FarmCardStyled>
    )
  }

  return (
    <FarmCardStyled className={`contractCard  ${variant} ${isOpenedCard ? 'opened' : ''}`}>
      {questionLinkBlock}
      <Expand
        onClickCallback={expandBlockCallback}
        isExpandedByDefault={isOpenedCard}
        header={
          <>
            {logoHeaderContent}
            {unclaimedSMVKBlock}
            {aprBlock}
            {liquidityBlock}
            {earnBlock}
          </>
        }
      >
        <div className="horizontal-expand">
          {harvestBlock}
          {farmingBlock}
          {linksBlock}
        </div>
      </Expand>
      {visibleModal ? <RoiCalculator lpTokenAddress={lpTokenAddress} onClose={closeCalculatorModal} /> : null}
    </FarmCardStyled>
  )
}
