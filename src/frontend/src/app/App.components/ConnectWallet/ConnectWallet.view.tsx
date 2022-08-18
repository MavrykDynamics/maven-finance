import { useState } from 'react'
import { ACTION_PRIMARY, TRANSPARENT } from '../Button/Button.constants'
import { Button } from '../Button/Button.controller'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import Icon from '../Icon/Icon.view'
import { TzAddress } from '../TzAddress/TzAddress.view'
import {
  ConnectedWalletStyled,
  SignOutButton,
  WalletNotConnectedButton,
  SimpleConnectedButton,
  ConnectedWalletDetailsItemStyled,
} from './ConnectWallet.style'

export type CoinsInfoType = {
  MVKExchangeRate: number
  userMVKBalance: number
  userXTZBalance: number
  userMVKStaked: number
  XTZExchnageRate: number
}

type ConnectedWalletBlockProps = {
  accountPkh: string
  signOutHandler: () => void
  changeWalletHandler: () => void
  coinsInfo: CoinsInfoType
}

export const ConnectedWalletBlock = ({
  accountPkh,
  coinsInfo,
  signOutHandler,
  changeWalletHandler,
}: ConnectedWalletBlockProps) => {
  const [detailsShown, setDetailsShown] = useState(false)

  return (
    <ConnectedWalletStyled onMouseOver={() => setDetailsShown(true)} onMouseLeave={() => setDetailsShown(false)}>
      <div className="visible-part">
        <Icon id="wallet" className="wallet" />
        <var>
          <TzAddress tzAddress={accountPkh} hasIcon={false} shouldCopy={false} />
        </var>
        <Icon id="paginationArrowLeft" className="arrow" />
      </div>

      <div className={`wallet-details ${detailsShown ? 'visible' : ''}`}>
        <ConnectedWalletDetailsItem
          buttonText={'Buy MVK'}
          coinAmount={coinsInfo.userMVKBalance}
          coinName={'MVK'}
          buttonHandler={() => {}}
          subtextAmount={coinsInfo.userMVKBalance * coinsInfo.MVKExchangeRate}
        />
        <ConnectedWalletDetailsItem
          buttonText={'Stake MVK'}
          coinAmount={coinsInfo.userMVKStaked}
          coinName={'MVK'}
          buttonHandler={() => {}}
          subtextInfo="Total staked MVK"
        />
        <ConnectedWalletDetailsItem
          buttonText={'Buy XTZ'}
          coinAmount={coinsInfo.userXTZBalance}
          coinName={'XTZ'}
          buttonHandler={() => {}}
          subtextAmount={coinsInfo.userXTZBalance * coinsInfo.XTZExchnageRate}
          isLast
        />

        <div className="buttons-wrapper">
          <SignOutButton onClick={signOutHandler}>Sign out</SignOutButton>
          <Button
            text="Chnage Wallet"
            onClick={changeWalletHandler}
            kind={ACTION_PRIMARY}
            icon="exchange"
            className="change-wallet"
          />
        </div>
      </div>
    </ConnectedWalletStyled>
  )
}

export const NoWalletConnectedButton = ({ handleConnect }: { handleConnect: () => void }) => {
  return (
    <WalletNotConnectedButton onClick={handleConnect}>
      <Icon id="wallet" />
      <span>Connect Wallet</span>
    </WalletNotConnectedButton>
  )
}

export const InstallWalletButton = () => {
  return (
    <WalletNotConnectedButton onClick={() => window.open('https://templewallet.com/', '_blank')!.focus()}>
      Install wallet
    </WalletNotConnectedButton>
  )
}

export const SimpleConnectButtonNoAddress = ({ handleConnect }: { handleConnect: () => void }) => {
  return (
    <SimpleConnectedButton onClick={handleConnect}>
      <svg>
        <use xlinkHref="/icons/sprites.svg#wallet" />
      </svg>
      <div>Connect Wallet</div>
    </SimpleConnectedButton>
  )
}

type ConnectedWalletDetailsItemProps = {
  buttonText: string
  coinName: string
  coinAmount: number
  buttonHandler: () => void
  isLast?: boolean
  subtextInfo?: string
  subtextAmount?: number
}

const ConnectedWalletDetailsItem = ({
  buttonText,
  coinName,
  coinAmount,
  buttonHandler,
  isLast,
  subtextInfo,
  subtextAmount,
}: ConnectedWalletDetailsItemProps) => {
  return (
    <ConnectedWalletDetailsItemStyled isLast={isLast}>
      <div className="left-part">
        <CommaNumber value={coinAmount} endingText={coinName} showDecimal className="main" />
        {subtextAmount !== undefined ? (
          <CommaNumber value={subtextAmount} endingText={'USD'} showDecimal className="subtext" />
        ) : (
          <div className="subtext">{subtextInfo}</div>
        )}
      </div>

      <Button text={buttonText} kind={TRANSPARENT} onClick={buttonHandler} className="connect-wallet-details" />
    </ConnectedWalletDetailsItemStyled>
  )
}
