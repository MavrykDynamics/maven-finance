import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../../reducers'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { ConnectWallet } from '../../../app/App.components/ConnectWallet/ConnectWallet.controller'
import {
  FarmCardContentSection,
  FarmCardDropDownContainer,
  FarmCardFirstTokenIcon,
  FarmCardRewardsSection,
  FarmCardSecondTokenIcon,
  FarmCardStakedBalanceSection,
  FarmCardStyled,
  FarmCardTokenLogoContainer,
  FarmCardTopSection,
  FarmTitleSection,
  StakedBalanceAddSubtractButton,
  StakedBalanceAddSubtractIcon,
} from './FarmCard.style'
import { useEffect, useRef, useState } from 'react'
import * as React from 'react'
import { ColoredLine } from '../../../app/App.components/ColoredLine/ColoredLine.view'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import { deposit, harvest, withdraw } from '../Farms.actions'
import { ButtonIcon } from '../../../app/App.components/Button/Button.style'
import { showModal } from '../../../app/App.components/Modal/Modal.actions'
import { Modal } from '../../../app/App.components/Modal/Modal.controller'
import { FARM_DEPOSIT, FARM_WITHDRAW } from '../../../app/App.components/Modal/Modal.constants'

type FarmCardProps = {
  farmAddress: string
  firstToken: string
  secondToken: string
  lpToken: string
  lpTokenAddress: string
  firstTokenAddress: string
  secondTokenAddress: string
  className: string
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
  className,
}: FarmCardProps) => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const myFarmStakedBalance = 45645.8987
  const [expanded, setExpanded] = useState(false)
  const [accordionHeight, setAccordionHeight] = useState(0)
  const ref = useRef(null)
  const open = () => setExpanded(!expanded)
  useEffect(() => {
    // @ts-ignore
    const getHeight = ref.current.scrollHeight
    setAccordionHeight(getHeight)
  }, [expanded])

  const harvestRewards = () => {
    dispatch(harvest(farmAddress))
  }
  const depositLpTokens = (amount: number) => {
    dispatch(deposit(farmAddress, amount))
  }
  const withdrawLpTokens = (amount: number) => {
    dispatch(withdraw(farmAddress, amount))
  }

  const triggerDepositModal = () => {
    console.log('Here in Deposit Modal')
    dispatch(showModal(FARM_DEPOSIT))
  }
  const triggerWithdrawModal = () => {
    console.log('Here in Withdraw Modal')
    dispatch(showModal(FARM_WITHDRAW))
  }
  return (
    <FarmCardStyled key={lpTokenAddress} className={`contractCard accordion${expanded ? 'Show' : 'Hide'} ${className}`}>
      <Modal />
      <FarmCardTopSection>
        <FarmCardContentSection>
          <FarmCardTokenLogoContainer>
            <FarmCardFirstTokenIcon src={'/images/coin-gold.svg'} />
            <FarmCardSecondTokenIcon src={'/images/coin-silver.svg'} />
          </FarmCardTokenLogoContainer>
          <FarmTitleSection>
            <h3>
              {firstToken}-{secondToken}
            </h3>
            <p>{lpToken}</p>
          </FarmTitleSection>
        </FarmCardContentSection>
        <FarmCardContentSection>
          <div>
            <p>APR:</p>
            <p>Earn:</p>
          </div>
          <div>
            <p>23.98%</p>
            <p>sMVK + Fees</p>
          </div>
        </FarmCardContentSection>
        <FarmCardRewardsSection>
          <h4>sMVK Earned:</h4>
          <div>
            <p>123.0q3</p>
            <Button text={'Harvest'} onClick={harvestRewards} disabled={!wallet || !ready} />
          </div>
        </FarmCardRewardsSection>
        <FarmCardStakedBalanceSection>
          <h4>
            {firstToken}-{secondToken} staked:
          </h4>
          <div>
            {!wallet || !ready ? (
              <ConnectWallet type={'simpleButton'} />
            ) : (
              <>
                <CommaNumber
                  value={Number(myFarmStakedBalance)}
                  loading={loading}
                  endingText={firstToken + '-' + secondToken}
                />
                <StakedBalanceAddSubtractButton onClick={triggerDepositModal}>
                  <StakedBalanceAddSubtractIcon>
                    <use xlinkHref={`/icons/sprites.svg#add`} />
                  </StakedBalanceAddSubtractIcon>
                </StakedBalanceAddSubtractButton>
                <StakedBalanceAddSubtractButton onClick={triggerWithdrawModal}>
                  <StakedBalanceAddSubtractIcon>
                    <use xlinkHref={`/icons/sprites.svg#subtract`} />
                  </StakedBalanceAddSubtractIcon>
                </StakedBalanceAddSubtractButton>
              </>
            )}
          </div>
        </FarmCardStakedBalanceSection>
      </FarmCardTopSection>
      <FarmCardDropDownContainer
        onClick={open}
        className={expanded ? 'show' : 'hide'}
        height={accordionHeight}
        ref={ref}
      >
        <span>
          {expanded ? 'Hide ' : 'Details '}
          {expanded ? (
            <svg>
              <use xlinkHref={`/icons/sprites.svg#arrow-up`} />
            </svg>
          ) : (
            <svg>
              <use xlinkHref={`/icons/sprites.svg#arrow-down`} />
            </svg>
          )}
        </span>
        <div className={'accordion ' + `${expanded}`} ref={ref}>
          Hello fuckers
        </div>
      </FarmCardDropDownContainer>
    </FarmCardStyled>
  )
}
