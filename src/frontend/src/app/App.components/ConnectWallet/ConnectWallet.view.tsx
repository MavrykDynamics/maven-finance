import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import * as React from 'react'
import { ConnectWalletStyled, WalletConnectedButton, WalletNotConnectedButton } from './ConnectWallet.style'

type ConnectWalletProps = {
  type?: string | null
  loading: boolean
  wallet: any
  ready: boolean
  accountPkh?: string
  myMvkTokenBalance?: string | number
  handleConnect: () => void
  handleNewConnect: () => void
}

export const ConnectWalletView = ({
  loading,
  wallet,
  ready,
  accountPkh,
  myMvkTokenBalance,
  handleConnect,
  handleNewConnect,
}: ConnectWalletProps) => {
  return (
    <ConnectWalletStyled>
      {/* For use of Beacon wallet, comment out below line and remove false section of this conditional */}
      {wallet ? (
        <>
          {ready && (
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
          {!ready && (
            <WalletNotConnectedButton onClick={handleConnect}>
              <svg>
                <use xlinkHref="/icons/sprites.svg#wallet" />
              </svg>
              <div>Connect wallet</div>
            </WalletNotConnectedButton>
          )}
        </>
      ) : (
        <WalletNotConnectedButton onClick={() => window.open('https://templewallet.com/', '_blank')!.focus()}>
          Install wallet
        </WalletNotConnectedButton>
      )}
    </ConnectWalletStyled>
  )
}
