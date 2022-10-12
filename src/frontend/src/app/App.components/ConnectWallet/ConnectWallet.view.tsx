import { useCallback, useState } from 'react'
import { ACTION_PRIMARY, ACTION_SECONDARY, TRANSPARENT } from '../Button/Button.constants'
import { Button } from '../Button/Button.controller'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import Icon from '../Icon/Icon.view'
import { BLUE } from '../TzAddress/TzAddress.constants'
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
  detailsHandlers: {
    buyXTZHandler: () => void
    buyMVKHandler: () => void
    stakeMVKHandler: () => void
  }
  closeMobileMenu: (e: React.MouseEvent<HTMLElement>) => void
}

export const MobileDetailsBlock = ({
  accountPkh,
  coinsInfo,
  signOutHandler,
  changeWalletHandler,
  detailsHandlers,
  handleCloseBtn,
  closeMobileMenu,
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
          buttonHandler={detailsHandlers.buyMVKHandler}
          subtextAmount={coinsInfo.userMVKBalance * coinsInfo.MVKExchangeRate}
        />
        <ConnectedWalletDetailsItem
          buttonText={'Stake MVK'}
          coinAmount={coinsInfo.userMVKStaked}
          coinName={'MVK'}
          buttonHandler={(e: React.MouseEvent<HTMLElement>) => {
            closeMobileMenu(e)
            handleCloseBtn()
            detailsHandlers.stakeMVKHandler()
          }}
          subtextInfo="Total staked MVK"
        />
        <ConnectedWalletDetailsItem
          buttonText={'Buy XTZ'}
          coinAmount={coinsInfo.userXTZBalance}
          coinName={'XTZ'}
          buttonHandler={detailsHandlers.buyXTZHandler}
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
            strokeWidth={0.3}
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
  detailsHandlers,
  isMobile,
  closeMobileMenu,
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
        detailsHandlers={detailsHandlers}
        closeMobileMenu={closeMobileMenu}
      />
    )

  return (
    <ConnectedWalletStyled onMouseOver={mouseOverHanlder} onMouseLeave={closeHandler} onClick={mobileClickOpenHanler}>
      <div className="top-visible-part ">
        <Icon id="wallet" className="wallet" />
        <var>
          <TzAddress tzAddress={accountPkh} hasIcon type={BLUE} />
        </var>
        <Icon id="paginationArrowLeft" className="end-icon" />
      </div>

      <div className={`wallet-details ${detailsShown ? 'visible' : ''} ${isMobile ? 'mobile' : ''}`}>
        <div className='wallet-details-header'>
          <div className="top-visible-part ">
            <Icon id="wallet" className="wallet" />
            <var className='wallet-details-address'>
              <TzAddress tzAddress={accountPkh} hasIcon={false} type={BLUE} />
            </var>
          </div>

          <a href={`https://tzstats.com/${accountPkh}`} target="_blank" rel="noreferrer">
            <Icon id="send" className="icon-send" />
          </a>
        </div>

        <hr />

        <div className='wallet-details-body'>
          <ConnectedWalletDetailsItem
            buttonText={'Buy MVK'}
            coinAmount={coinsInfo.userMVKBalance}
            coinName={'MVK'}
            buttonHandler={detailsHandlers.buyMVKHandler}
            subtextAmount={coinsInfo.userMVKBalance * coinsInfo.MVKExchangeRate}
            icon="mvkTokenGold"
          />
          <ConnectedWalletDetailsItem
            buttonText={'Stake MVK'}
            coinAmount={coinsInfo.userMVKStaked}
            coinName={'MVK'}
            buttonHandler={detailsHandlers.stakeMVKHandler}
            subtextInfo="Total staked MVK"
            icon="mvkTokenSilver"
          />
          <ConnectedWalletDetailsItem
            buttonText={'Buy XTZ'}
            coinAmount={coinsInfo.userXTZBalance}
            coinName={'XTZ'}
            buttonHandler={detailsHandlers.buyXTZHandler}
            subtextAmount={coinsInfo.userXTZBalance * coinsInfo.XTZExchnageRate}
            icon="xtzTezos"
          />
        </div>

        <div className="wallet-details-footer">
          <Button
            text="Sign out"
            onClick={signOutHandler}
            kind={ACTION_SECONDARY}
            icon="exit"
          />

          <Button
            text="Change Wallet"
            onClick={changeWalletHandler}
            kind={ACTION_PRIMARY}
            icon="exchange"
            className="change-wallet"
            strokeWidth={0.3}
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
  buttonHandler: (e: React.MouseEvent<HTMLElement>) => void
  subtextInfo?: string
  subtextAmount?: number
  icon?: string
}

const ConnectedWalletDetailsItem = ({
  buttonText,
  coinName,
  coinAmount,
  buttonHandler,
  subtextInfo,
  subtextAmount,
  icon,
}: ConnectedWalletDetailsItemProps) => {
  return (
    <ConnectedWalletDetailsItemStyled>
      <div className='left-part'>
        {icon && <Icon id={icon} />}

        <div className="left-part-info">
          <CommaNumber value={coinAmount} endingText={coinName} showDecimal className="main" />
          
  
          {subtextAmount !== undefined ? (
            <CommaNumber value={subtextAmount} endingText={'USD'} showDecimal className="subtext" />
          ) : (
            <div className="subtext">{subtextInfo}</div>
          )}
        </div>
      </div>


      <div className="btn-wrapper">
        <Button text={buttonText} kind={TRANSPARENT} onClick={buttonHandler} className="connect-wallet-details" />
        <Icon id="paginationArrowLeft" />
      </div>
    </ConnectedWalletDetailsItemStyled>
  )
}
