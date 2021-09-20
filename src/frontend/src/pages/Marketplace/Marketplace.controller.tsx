import { MAVRYK_ADDRESS, NETWORK } from 'dapp/defaults'
import { useCallback, useEffect, useState } from 'react'
import { Message, Page } from 'styles'
import { TezosToolkit } from '@taquito/taquito'
import { MarketplaceView } from './Marketplace.view'
import { Tile } from 'pages/EditTiles/EditTiles.view'
import { Loader } from 'app/App.components/Loader/Loader.view'
import { useOnBlock, useTezos } from 'dapp/dapp'

type MarketplaceProps = {
  setTransactionPendingCallback: (b: boolean) => void
  transactionPending: boolean
}

export type Buy = {
  tileId: number
  price: number
}

export const Marketplace = ({ transactionPending }: MarketplaceProps) => {
  const rpcProvider: string = `https://${NETWORK}.smartpy.io`
  const tk: TezosToolkit = new TezosToolkit(rpcProvider)
  const [contractTaquito, setContractTaquito] = useState(undefined)
  const [tiles, setTiles] = useState<Tile[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const tezos = useTezos()
  const [contract, setContract] = useState(undefined)

  useEffect(() => {
    ;(async () => {
      const contract2: any = await tk.contract.at(MAVRYK_ADDRESS)
      setContractTaquito(contract2)
    })()
  }, [transactionPending])

  useEffect(() => {
    ;(async () => {
      if (contractTaquito) {
        const storage: any = await (contractTaquito as any).storage()
        const tileIdsBigNumbers = storage['market'].tileIds
        if (tileIdsBigNumbers) {
          const tileNumbers: number[] = tileIdsBigNumbers.map((tile: { c: any[] }) => tile.c[0])
          console.log('tileNumbers', tileNumbers)

          const tilesToShow = await Promise.all(
            tileNumbers.map(async (tileId: number) => {
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
          setTiles(tilesToShow.filter((tile) => tile !== undefined) as Tile[])
          setLoading(false)
        }
      }
    })()
  }, [contractTaquito])

  // const loadStorage = useCallback(async () => {
  //   if (contract) {
  //     await (contract as any).storage()
  //   }
  // }, [contract])

  // useEffect(() => {
  //   loadStorage()
  // }, [loadStorage])

  // useOnBlock(tezos, loadStorage)

  useEffect(() => {
    ;(async () => {
      console.log('tezos', tezos)
      if (tezos) {
        const ctr = await (tezos as any).wallet.at(MAVRYK_ADDRESS)
        console.log('ctr', ctr)
        setContract(ctr)
      }
    })()
  }, [tezos, transactionPending])

  const buyCallback = useCallback(
    ({ tileId, price }: Buy) => {
      return (contract as any).methods.buyTile(tileId, price).send({ amount: price })
    },
    [contract],
  )

  return (
    <Page>
      {tiles && tiles.length > 0 ? (
        <MarketplaceView tiles={tiles} buyCallback={buyCallback} />
      ) : (
        <div>
          {loading ? (
            <Message>
              <Loader />
            </Message>
          ) : (
            <Message>No tile available</Message>
          )}
        </div>
      )}
    </Page>
  )
}
