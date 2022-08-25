import { useCallback, useState } from 'react'
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
  MobileDetailsStyled,
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
  isMobile: boolean
}

export const MobileDetailsBlock = ({
  accountPkh,
  coinsInfo,
  signOutHandler,
  changeWalletHandler,
  handleCloseBtn,
}: ConnectedWalletBlockProps & { handleCloseBtn: () => void }) => {
  return (
    <MobileDetailsStyled>
      <div className="close" onClick={handleCloseBtn}>
        <Icon id="close-stroke" />
      </div>
      <div className="top-visible-part ">
        <Icon id="wallet" className="wallet" />
        <var>
          <TzAddress tzAddress={accountPkh} hasIcon={false} shouldCopy={false} />
        </var>
        <Icon id="openLinkRight" className="openLink" />
      </div>

      <div className="details">
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
        />

        <div className="buttons-wrapper">
          <SignOutButton onClick={signOutHandler}>Sign out</SignOutButton>
          <Button
            text="Change Wallet"
            onClick={changeWalletHandler}
            kind={ACTION_PRIMARY}
            icon="exchange"
            className="change-wallet"
          />
        </div>
      </div>
    </MobileDetailsStyled>
  )
}

export const ConnectedWalletBlock = ({
  accountPkh,
  coinsInfo,
  signOutHandler,
  changeWalletHandler,
  isMobile,
}: ConnectedWalletBlockProps) => {
  const [detailsShown, setDetailsShown] = useState(false)

  const mouseOverHanlder = useCallback(() => (isMobile ? undefined : setDetailsShown(true)), [isMobile])
  const mobileClickOpenHanler = useCallback(() => (isMobile ? setDetailsShown(true) : undefined), [isMobile])
  const closeHandler = useCallback(() => setDetailsShown(false), [])

  if (isMobile && detailsShown)
    return (
      <MobileDetailsBlock
        accountPkh={accountPkh}
        coinsInfo={coinsInfo}
        signOutHandler={signOutHandler}
        changeWalletHandler={changeWalletHandler}
        isMobile={isMobile}
        handleCloseBtn={closeHandler}
      />
    )

  return (
    <ConnectedWalletStyled onMouseOver={mouseOverHanlder} onMouseLeave={closeHandler} onClick={mobileClickOpenHanler}>
      <div className="top-visible-part ">
        <Icon id="wallet" className="wallet" />
        <var>
          <TzAddress tzAddress={accountPkh} hasIcon={false} shouldCopy={false} />
        </var>
        <Icon id="paginationArrowLeft" className="end-icon" />
      </div>

      <div className={`wallet-details ${detailsShown ? 'visible' : ''} ${isMobile ? 'mobile' : ''}`}>
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
        />

        <div className="buttons-wrapper">
          <SignOutButton onClick={signOutHandler}>Sign out</SignOutButton>
          <Button
            text="Change Wallet"
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
      <Icon id="wallet" />
      <div>Connect Wallet</div>
    </SimpleConnectedButton>
  )
}

type ConnectedWalletDetailsItemProps = {
  buttonText: string
  coinName: string
  coinAmount: number
  buttonHandler: () => void
  subtextInfo?: string
  subtextAmount?: number
}

const ConnectedWalletDetailsItem = ({
  buttonText,
  coinName,
  coinAmount,
  buttonHandler,
  subtextInfo,
  subtextAmount,
}: ConnectedWalletDetailsItemProps) => {
  return (
    <ConnectedWalletDetailsItemStyled>
      <div className="left-part">
        <CommaNumber value={coinAmount} endingText={coinName} showDecimal className="main" />
        {subtextAmount !== undefined ? (
          <CommaNumber value={subtextAmount} endingText={'USD'} showDecimal className="subtext" />
        ) : (
          <div className="subtext">{subtextInfo}</div>
        )}
      </div>

      <div className="btn-wrapper">
        <Button text={buttonText} kind={TRANSPARENT} onClick={buttonHandler} className="connect-wallet-details" />
        <Icon id="paginationArrowLeft" />
      </div>
    </ConnectedWalletDetailsItemStyled>
  )
}
