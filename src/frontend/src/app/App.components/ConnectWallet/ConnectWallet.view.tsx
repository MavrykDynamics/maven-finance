import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import * as React from 'react'
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
          {ready && type !== 'simpleButton' && (
            <WalletConnectedButton>
              <p>
                {accountPkh
                  ? `${accountPkh.slice(0, 7)}...${accountPkh.slice(accountPkh.length - 4, accountPkh.length)}`
                  : 'undefined'}
                <svg onClick={handleNewConnect}>
                  <use xlinkHref="/icons/sprites.svg#switch" />
                </svg>
              </p>
              <CommaNumber value={Number(myMvkTokenBalance || 0)} loading={loading} endingText={'MVK'} />
            </WalletConnectedButton>
          )}
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
      <svg>
        <use xlinkHref="/icons/sprites.svg#wallet" />
      </svg>
      <div>Connect wallet</div>
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
