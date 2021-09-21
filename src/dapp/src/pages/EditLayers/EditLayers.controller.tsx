// prettier-ignore
import { useAccountPkh, useOnBlock, useReady, useTezos, useWallet } from "dapp/dapp";
import { ADMIN, MAVRYK_ADDRESS } from 'dapp/defaults'
import { Mint, Vote } from 'pages/EditTiles/EditTiles.controller'
import { Tile } from 'pages/EditTiles/EditTiles.view'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Message, Page } from 'styles'
import { EditLayersView } from './EditLayers.view'

type EditLayersProps = {
  setMintTransactionPendingCallback: (b: boolean) => void
  mintTransactionPending: boolean
}

export const EditLayers = ({ setMintTransactionPendingCallback, mintTransactionPending }: EditLayersProps) => {
  const wallet = useWallet()
  const ready = useReady()
  const tezos = useTezos()
  const accountPkh = useAccountPkh()
  const [contract, setContract] = useState(undefined)
  const [loadingTiles, setLoadingTiles] = useState(false)
  const [existingTiles, setExistingTiles] = useState<Tile[]>([])
  let { canvasId } = useParams<{ canvasId?: string }>()

  const loadStorage = React.useCallback(async () => {
    if (canvasId) {
      setLoadingTiles(true)
      if (contract) {
        const storage = await (contract as any).storage()
        if (storage['market']?.tileIds?.length > 0) {
          console.log('tileIds', storage['market'].tileIds)

          const existingTilesToShow = await Promise.all(
            storage['market'].tileIds.map(async (tileId: number) => {
              const tileRaw = await storage.market.tiles.get(tileId.toString())
              console.log('tileRaw', tileRaw)

              if (tileRaw) {
                const tile: Tile = {
                  tileId: tileRaw.tileId.c[0],
                  canvasId: tileRaw.canvasId,
                  x: tileRaw.x.s * tileRaw.x.c[0],
                  y: tileRaw.y.s * tileRaw.y.c[0],
                  l: tileRaw.l.s * tileRaw.l.c[0],
                  image: tileRaw.image,
                  isOwned: tileRaw.isOwned,
                  owner: tileRaw.owner,
                  onSale: tileRaw.onSale,
                  price: tileRaw.price,
                  deadline: tileRaw.deadline,
                  tileHeight: tileRaw.tileHeight,
                  tileWidth: tileRaw.tileWidth,
                }
                return tile
              } else return undefined
            }),
          )
          //@ts-ignore
          setExistingTiles(existingTilesToShow.filter((tile: Tile) => tile && tile.canvasId === canvasId) as Tile[])
        }
        setLoadingTiles(false)
      }
      // setExistingTokenIds(storage['market'].tileIds.map((tileIdAsObject: { c: any[] }) => tileIdAsObject.c[0]))
      // setEditLayersAdress(storage.market.admin)
    }
  }, [canvasId, contract])

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
      {wallet ? (
        <>
          {ready ? (
            <EditLayersView
              loadingTiles={loadingTiles}
              voteCallback={voteCallback}
              mintCallback={mintCallback}
              connectedUser={(accountPkh as unknown) as string}
              existingTiles={existingTiles}
              setMintTransactionPendingCallback={setMintTransactionPendingCallback}
              mintTransactionPending={mintTransactionPending}
              urlCanvasId={canvasId}
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
