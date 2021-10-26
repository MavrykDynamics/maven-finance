// prettier-ignore
import { useAccountPkh, useOnBlock, useReady, useTezos, useWallet } from "dapp/dapp";
import { ADMIN, MAVRYK_ADDRESS } from 'dapp/defaults'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Message, Page } from 'styles'

import { StakeView, Tile } from './Stake.view'
import { StakeHeader } from './StakeHeader/StakeHeader.controller'
import { StakeUnstake } from './StakeUnstake/StakeUnstake.controller'

export type Mint = {
  tileId: number
  canvasId: string
  x: number
  y: number
  l: number
  image: string
  owner?: string
  deadline: string
  tileWidth: number
  tileHeight: number
}

export type Vote = {
  tileId: number
  up: boolean
}

type StakeProps = {
  setMintTransactionPendingCallback: (b: boolean) => void
  mintTransactionPending: boolean
}

export const Stake = ({ setMintTransactionPendingCallback, mintTransactionPending }: StakeProps) => {
  const wallet = useWallet()
  const ready = useReady()
  const tezos = useTezos()
  const accountPkh = useAccountPkh()
  const [contract, setContract] = useState(undefined)
  const [myMvkBalance, setMyMvkBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadStorage = React.useCallback(async () => {
    setLoading(true)
    if (contract) {
      const storage = await (contract as any).storage()
      setMyMvkBalance(storage['totalSupply'])
      setLoading(false)
    }
  }, [contract])

  useEffect(() => {
    loadStorage()
  }, [loadStorage])

  useEffect(() => {
    ;(async () => {
      if (tezos) {
        const ctr = await (tezos as any).wallet.at(MAVRYK_ADDRESS)
        setContract(ctr)
      }
    })()
  }, [tezos, mintTransactionPending])

  useOnBlock(tezos, loadStorage)

  const voteCallback = React.useCallback(
    ({ tileId, up }: Vote) => {
      if (up) return (contract as any).methods.upvote(tileId).send()
      else return (contract as any).methods.downvote(tileId).send()
    },
    [contract],
  )

  const mintCallback = React.useCallback(
    ({ tileId, canvasId, x, y, l, image, owner, deadline, tileWidth, tileHeight }: Mint) => {
      return (contract as any).methods
        .mint(canvasId, deadline, image, l, ADMIN, owner, tileHeight, tileId, tileWidth, x, y)
        .send()
    },
    [contract],
  )

  return (
    <Page>
      <StakeHeader />
      <StakeUnstake myMvkBalance={myMvkBalance} />
      {wallet ? (
        <>
          {ready ? (
            <StakeView
              loading={loading}
              mintCallback={mintCallback}
              voteCallback={voteCallback}
              connectedUser={accountPkh as unknown as string}
              setMintTransactionPendingCallback={setMintTransactionPendingCallback}
              mintTransactionPending={mintTransactionPending}
              myMvkBalance={myMvkBalance}
            />
          ) : (
            <Message>Please connect your wallet</Message>
          )}
        </>
      ) : (
        <Message>Please install the Temple Wallet Chrome Extension.</Message>
      )}
    </Page>
  )
}
