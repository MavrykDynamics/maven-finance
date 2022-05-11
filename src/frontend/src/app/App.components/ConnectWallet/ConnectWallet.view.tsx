import * as React from 'react'

import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
// components
import Icon from '../Icon/Icon.view'
import {
  ConnectWalletStyled,
  SimpleConnectedButton,
  WalletConnectedButton,
  WalletNotConnectedButton,
} from './ConnectWallet.style'

type ConnectWalletViewProps = {
  type?: string | null
  loading: boolean
  wallet: any
  ready: boolean
  accountPkh?: string
  myMvkTokenBalance: string | number | undefined
  handleConnect: () => void
  handleNewConnect: () => void
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
}: ConnectWalletViewProps) => {
  return (
    <ConnectWalletStyled id={'connectWalletButton'}>
      {/* For use of Beacon wallet, comment out below line and remove false section of this conditional */}
      {wallet ? (
        <>
          {ready && type !== 'simpleButton' && accountPkh ? (
            <WalletConnectedButton>
              <var>
                <TzAddress tzAddress={accountPkh} hasIcon />
              </var>
              <button onClick={handleNewConnect}>
                <Icon id="switch" />
              </button>
              <CommaNumber value={Number(myMvkTokenBalance || 0)} loading={loading} endingText={'MVK'} />
            </WalletConnectedButton>
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
      <span>Connect wallet</span>
    </WalletNotConnectedButton>
  )
}
export const SimpleConnectButtonNoAddress = ({ handleConnect }: { handleConnect: () => void }) => {
  return (
    <SimpleConnectedButton onClick={handleConnect}>
      <svg>
        <use xlinkHref="/icons/sprites.svg#wallet" />
      </svg>
      <div>Connect wallet</div>
    </SimpleConnectedButton>
  )
}
