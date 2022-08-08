import * as React from 'react'

import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
// components
import Icon from '../Icon/Icon.view'
import { ConnectWalletStyled, SignOutButton, SimpleConnectedButton, WalletConnectedButton, WalletNotConnectedButton } from './ConnectWallet.style'

type ConnectWalletViewProps = {
  type?: string | null
  loading: boolean
  wallet: any
  ready: boolean
  accountPkh?: string
  myMvkTokenBalance: string | number | undefined
  handleConnect: () => void
  handleNewConnect: () => void
  className?: string
}

export const ConnectWalletView = ({
  type,
  loading,
  wallet,
  ready,
  accountPkh,
  myMvkTokenBalance,
  handleConnect,
  handleNewConnect,
  className,
}: ConnectWalletViewProps) => {
  return (
    <ConnectWalletStyled className={className} id={'connectWalletButton'}>
      {/* For use of Beacon wallet, comment out below line and remove false section of this conditional */}
      {wallet ? (
        <>
          {ready && type !== 'simpleButton' && accountPkh ? (
            <>
              <WalletConnectedButton>
                <var>
                  <TzAddress tzAddress={accountPkh} hasIcon />
                </var>
                <button onClick={handleNewConnect}>
                  <Icon id="switch" />
                </button>
                <CommaNumber value={Number(myMvkTokenBalance || 0)} loading={loading} endingText={'MVK'} />
              </WalletConnectedButton>
              {/* TODO: Implement disconnect from the wallet fucntional */}
              <SignOutButton onClick={() => null}>Sign out</SignOutButton>
            </>
          ) : null}
          {type === 'simpleButton' && <SimpleConnectButtonNoAddress handleConnect={handleConnect} />}
          {!ready && type !== 'simpleButton' && <NoWalletConnectedButton handleConnect={handleConnect} />}
        </>
      ) : (
        <WalletNotConnectedButton onClick={() => window.open('https://templewallet.com/', '_blank')!.focus()}>
          Install wallet
        </WalletNotConnectedButton>
      )}
    </ConnectWalletStyled>
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
