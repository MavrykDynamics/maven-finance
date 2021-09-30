import { Button } from 'app/App.components/Button/Button.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useAlert } from 'react-alert'

import { Mint, Vote } from './Stake.controller'
// prettier-ignore
import { StakeStyled } from "./Stake.style";

type StakeViewProps = {
  loadingTiles: boolean
  mintCallback: (mintProps: Mint) => Promise<any>
  voteCallback: (voteProps: Vote) => Promise<any>
  setMintTransactionPendingCallback: (b: boolean) => void
  connectedUser: string
  mintTransactionPending: boolean
  existingTiles: Tile[]
  urlCanvasId?: string
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
  loadingTiles,
  mintCallback,
  voteCallback,
  connectedUser,
  existingTiles,
  setMintTransactionPendingCallback,
  mintTransactionPending,
  urlCanvasId,
}: StakeViewProps) => {
  const [showGrid, setShowGrid] = useState(true)
  const [tiles, setTiles] = useState<Tile[]>([])
  const [newTiles, setNewTiles] = useState<Tile[]>([])
  const [tileWidth, setTileWidth] = useState(340)
  const [tileHeight, setTileHeight] = useState(340)
  const [lockedInputs, setLockedInputs] = useState(false)
  const [deadline, setDeadline] = useState(dayjs().add(3, 'days').format())
  const [isUploading, setIsUploading] = useState(false)
  const alert = useAlert()
  const [canvasId, setCanvasId] = useState(urlCanvasId)
  const [canvasSize, setCanvasSize] = useState({
    xMin: 0,
    xMax: 0,
    yMin: 0,
    yMax: 0,
    canvasWidth: 1,
    canvasHeight: 1,
  })

  useEffect(() => {
    console.log(tiles)
  }, [tiles])

  useEffect(() => {
    if (!urlCanvasId) setCanvasId((Math.random() + 1).toString(36).substring(7))
  }, [urlCanvasId])

  useEffect(() => {
    if (existingTiles.length > 0) {
      setTiles([...newTiles, ...existingTiles])
      setTileWidth(existingTiles[0].tileWidth)
      setTileHeight(existingTiles[0].tileHeight)
      setDeadline(existingTiles[0].deadline)
      setLockedInputs(true)
    }
  }, [existingTiles])

  useEffect(() => {
    if (tiles.length > 0) {
      const xMin = tiles.map((tile) => tile.x).reduce((result, currentValue) => Math.min(result, currentValue))
      const xMax = tiles.map((tile) => tile.x).reduce((result, currentValue) => Math.max(result, currentValue))
      const yMin = tiles.map((tile) => tile.y).reduce((result, currentValue) => Math.min(result, currentValue))
      const yMax = tiles.map((tile) => tile.y).reduce((result, currentValue) => Math.max(result, currentValue))

      if (xMin < canvasSize.xMin || xMax > canvasSize.xMax || yMin < canvasSize.yMin || yMax > canvasSize.yMax)
        setCanvasSize({
          xMin,
          xMax,
          yMin,
          yMax,
          canvasWidth: xMax - xMin + 1,
          canvasHeight: yMax - yMin + 1,
        })
    }
  }, [tiles])

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
