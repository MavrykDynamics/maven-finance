import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useAlert } from 'react-alert'

import { Mint, Vote } from './Stake.controller'
// prettier-ignore
import { StakeStyled } from "./Stake.style";

type StakeViewProps = {
  loading: boolean
  mintCallback: (mintProps: Mint) => Promise<any>
  voteCallback: (voteProps: Vote) => Promise<any>
  setMintTransactionPendingCallback: (b: boolean) => void
  connectedUser: string
  mintTransactionPending: boolean
  myMvkBalance: number
}

export type Tile = {
  tileId: number
  canvasId: string
  x: number
  y: number
  l: number
  image: string
  isOwned?: boolean
  owner?: string
  onSale?: boolean
  price?: number
  deadline: string
  tileWidth: number
  tileHeight: number
}

export const StakeView = ({
  loading,
  mintCallback,
  voteCallback,
  connectedUser,
  setMintTransactionPendingCallback,
  mintTransactionPending,
  myMvkBalance,
}: StakeViewProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const alert = useAlert()

  async function handleVote(tileId: number, up: boolean) {
    if (mintTransactionPending) {
      alert.info('Cannot vote on a tile while a transaction is pending...', { timeout: 10000 })
    } else {
      console.log(tileId, up)
      voteCallback({ tileId, up })
        .then((e) => {
          setMintTransactionPendingCallback(true)
          alert.info('Voting on tile...')
          e.confirmation().then((e: any) => {
            alert.success('Vote casted', {
              onOpen: () => {
                setMintTransactionPendingCallback(false)
              },
            })
            return e
          })
          return e
        })
        .catch((e: any) => {
          alert.show(e.message)
          console.error(e)
        })
    }
  }

  async function handleUpload(file: any, x: number, y: number) {
    const tileId = Math.floor(Math.random() * 1000000) //TODO: Implement better tileId

    try {
      setIsUploading(true)

      // Upload to IPFS
      // const added = await client.add(file)
      // const image = `https://ipfs.infura.io/ipfs/${added.path}`

      // const tile: Tile = {
      //   tileId,
      //   canvasId: canvasId as string,
      //   x,
      //   y,
      //   l: -1,
      //   image,
      //   owner: connectedUser,
      //   deadline,
      //   tileWidth,
      //   tileHeight,
      // }

      // setNewTiles(newTiles.concat(tile))
      // setTiles([...newTiles.concat(tile), ...existingTiles])

      // // Mint token
      // if (mintTransactionPending) {
      //   alert.info('Cannot mint a new tile while a transaction is pending...', { timeout: 10000 })
      // } else {
      //   console.log(tile)
      //   mintCallback(tile)
      //     .then((e) => {
      //       setMintTransactionPendingCallback(true)
      //       alert.info('Minting new tile...')
      //       e.confirmation().then((e: any) => {
      //         alert.success('New tile minted', {
      //           onOpen: () => {
      //             setMintTransactionPendingCallback(false)
      //           },
      //         })
      //         return e
      //       })
      //       return e
      //     })
      //     .catch((e: any) => {
      //       alert.show(e.message)
      //       console.error(e)
      //     })
      // }

      setIsUploading(false)
    } catch (error: any) {
      alert.error(error.message)
      console.error(error)
      setIsUploading(false)
    }
  }

  return <StakeStyled>Connected</StakeStyled>
}
