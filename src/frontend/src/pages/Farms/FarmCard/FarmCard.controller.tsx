import { useEffect, useRef, useState } from 'react'
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

// const
import { SELECT_FARM_ADDRESS } from '../Farms.actions'
import { FARM_DEPOSIT, FARM_WITHDRAW } from '../../../app/App.components/Modal/Modal.constants'

// helpers
import { calculateAPR } from '../Frams.helpers'

// styles
import {
  FarmCardFirstTokenIcon,
  FarmCardSecondTokenIcon,
  FarmCardStyled,
  FarmCardTokenLogoContainer,
  FarmHarvestStyled,
} from './FarmCard.style'

type FarmCardProps = {
  name: string
  farmAddress: string
  firstToken: string
  secondToken: string
  lpToken: string
  lpTokenAddress: string
  lpTokenBalance: number
  currentRewardPerBlock: number
  firstTokenAddress: string
  secondTokenAddress: string
  variant: FarmsViewVariantType
  totalLiquidity: number
}
export const FarmCard = ({
  farmAddress,
  firstToken,
  firstTokenAddress,
  secondToken,
  secondTokenAddress,
  lpToken,
  lpTokenAddress,
  totalLiquidity,
  variant,
  name,
  lpTokenBalance,
  currentRewardPerBlock,
}: FarmCardProps) => {
  const dispatch = useDispatch()
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const myFarmStakedBalance = 45645.8987
  const valueAPR = calculateAPR(currentRewardPerBlock, lpTokenBalance)

  const harvestRewards = () => {
    dispatch(harvest(farmAddress))
  }

  const triggerDepositModal = async () => {
    await dispatch({ type: SELECT_FARM_ADDRESS, selectedFarmAddress: farmAddress })
    await dispatch(showModal(FARM_DEPOSIT))
  }

  const triggerWithdrawModal = async () => {
    await dispatch({ type: SELECT_FARM_ADDRESS, selectedFarmAddress: farmAddress })
    await dispatch(showModal(FARM_WITHDRAW))
  }

  const logoHeaderContent = (
    <div className="farm-card-header">
      <FarmCardTokenLogoContainer>
        <FarmCardFirstTokenIcon src={'/images/coin-gold.svg'} />
        <FarmCardSecondTokenIcon src={'/images/coin-silver.svg'} />
      </FarmCardTokenLogoContainer>
      <div className="farm-card-section">
        <h3>
          {/* {firstToken}-{secondToken} */}
          {name}
        </h3>
        <p>{lpToken}</p>
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
        <button className="calc-button">
          <Icon id="calculator" />
        </button>
      </div>
    </div>
  )

  const liquidityBlock = (
    <div className="farm-info">
      <h3>Liquidity</h3>
      <var>$209,544,892</var>
    </div>
  )

  const totalLiquidityBlock = (
    <div className="farm-info">
      <h3>Total Liquidity</h3>
      <var>$209,544,892</var>
    </div>
  )

  const multiplierBlock = (
    <div className="farm-info">
      <h3>Multiplier</h3>
      <var>20x</var>
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
    <FarmHarvestStyled>
      <div className="farm-info">
        <h3>sMVK Earned</h3>
        <var>0.00</var>
      </div>
      <Button kind="actionPrimary" text={'Harvest'} onClick={harvestRewards} disabled={!wallet || !ready} />
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
        <FarmHarvestStyled>
          {stakedBlock}
          <div className="circle-buttons">
            <ButtonCircle onClick={triggerDepositModal} kind="actionPrimary" text="" icon="add" />
            <ButtonCircle onClick={triggerWithdrawModal} kind="actionSecondary" text="" icon="subtract" />
          </div>
        </FarmHarvestStyled>
      )}
    </>
  )

  const questionLinkBlock = (
    <a className="info-link" href="https://mavryk.finance/litepaper#yield-farming" target="_blank" rel="noreferrer">
      <Icon id="question" />
    </a>
  )

  if (variant === 'vertical') {
    return (
      <FarmCardStyled key={lpTokenAddress} className={`contractCard accordion} ${variant}`}>
        {questionLinkBlock}
        {logoHeaderContent}
        <div className="farm-info-vertical">
          {aprBlock}
          {earnBlock}
        </div>
        <div className="vertical-harvest">{harvestBlock}</div>
        <div className="vertical-harvest">{farmingBlock}</div>

        <Expand className="vertical-expand" showText header={<></>}>
          <>
            <div className="farm-info-vertical">{totalLiquidityBlock}</div>
            {linksBlock}
          </>
        </Expand>
      </FarmCardStyled>
    )
  }

  return (
    <FarmCardStyled key={lpTokenAddress} className={`contractCard  ${variant}`}>
      {questionLinkBlock}
      <Expand
        header={
          <>
            {logoHeaderContent}
            {unclaimedSMVKBlock}
            {aprBlock}
            {liquidityBlock}
            {multiplierBlock}
          </>
        }
      >
        <div className="horizontal-expand">
          {linksBlock}
          {harvestBlock}
          {farmingBlock}
        </div>
      </Expand>
    </FarmCardStyled>
  )
}
