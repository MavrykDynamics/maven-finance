import { Button } from 'app/App.components/Button/Button.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { create } from 'ipfs-http-client'
import { useEffect, useState } from 'react'
import { useAlert } from 'react-alert'
import { Mint, Vote } from './EditTiles.controller'
import dayjs from 'dayjs'

// prettier-ignore
import { EditTilesCanvas, EditTilesCanvasBottom, EditTilesCanvasLeft, EditTilesCanvasMiddle, EditTilesCanvasRight, EditTilesCanvasTop, EditTilesLoading, EditTilesMenu, EditTilesStyled, EditTilesTile, TileVoting, TileVotingButtons, UploaderFileSelector, UploaderLabel } from "./EditTiles.style";

const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

type EditTilesViewProps = {
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

export const EditTilesView = ({
  loadingTiles,
  mintCallback,
  voteCallback,
  connectedUser,
  existingTiles,
  setMintTransactionPendingCallback,
  mintTransactionPending,
  urlCanvasId,
}: EditTilesViewProps) => {
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
      const added = await client.add(file)
      const image = `https://ipfs.infura.io/ipfs/${added.path}`

      const tile: Tile = {
        tileId,
        canvasId: canvasId as string,
        x,
        y,
        l: -1,
        image,
        owner: connectedUser,
        deadline,
        tileWidth,
        tileHeight,
      }

      setNewTiles(newTiles.concat(tile))
      setTiles([...newTiles.concat(tile), ...existingTiles])

      // Mint token
      if (mintTransactionPending) {
        alert.info('Cannot mint a new tile while a transaction is pending...', { timeout: 10000 })
      } else {
        console.log(tile)
        mintCallback(tile)
          .then((e) => {
            setMintTransactionPendingCallback(true)
            alert.info('Minting new tile...')
            e.confirmation().then((e: any) => {
              alert.success('New tile minted', {
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

      setIsUploading(false)
    } catch (error) {
      alert.error(error.message)
      console.error(error)
      setIsUploading(false)
    }
  }

  return (
    <EditTilesStyled>
      <EditTilesMenu>
        {showGrid ? (
          <Button text="Hide grid" icon="hide" onClick={() => setShowGrid(false)} />
        ) : (
          <Button text="Show grid" icon="show" onClick={() => setShowGrid(true)} />
        )}

        {/* <Button text="Download canvas" icon="download" /> */}

        <div>Tile size:</div>
        <Input
          value={tileWidth}
          placeholder="width"
          type="text"
          onChange={(e) => setTileWidth(e.target.value || 1)}
          onBlur={() => {}}
          disabled={lockedInputs}
        />
        <div>x</div>
        <Input
          value={tileHeight}
          placeholder="height"
          type="text"
          onChange={(e) => setTileHeight(e.target.value || 1)}
          onBlur={() => {}}
          disabled={lockedInputs}
        />

        <div>Deadline:</div>
        <Input
          value={deadline}
          placeholder="days"
          type="text"
          onChange={(e) => setDeadline(e.target.value || 1)}
          onBlur={() => {}}
          disabled={lockedInputs}
        />

        <div>
          {loadingTiles && (
            <EditTilesLoading>
              <svg>
                <use xlinkHref="/icons/sprites.svg#loading" />
              </svg>
              <div>Loading existing tiles...</div>
            </EditTilesLoading>
          )}
        </div>
      </EditTilesMenu>

      <EditTilesCanvas width={tileWidth * canvasSize.canvasWidth}>
        <EditTilesCanvasLeft
          height={tileHeight * canvasSize.canvasHeight}
          onClick={() =>
            setCanvasSize({ ...canvasSize, xMin: canvasSize.xMin - 1, canvasWidth: canvasSize.canvasWidth + 1 })
          }
        >
          <img alt="arrow" src="/icons/arrow.svg" />
        </EditTilesCanvasLeft>

        <div>
          <EditTilesCanvasTop
            width={tileWidth * canvasSize.canvasWidth}
            onClick={() =>
              setCanvasSize({ ...canvasSize, yMin: canvasSize.yMin - 1, canvasHeight: canvasSize.canvasHeight + 1 })
            }
          >
            <img alt="arrow" src="/icons/arrow.svg" />
          </EditTilesCanvasTop>

          {/* @ts-ignore */}
          {Array.apply(null, { length: canvasSize.yMax + 1 - canvasSize.yMin })
            .map(function (_, idx) {
              return idx + canvasSize.yMin
            })
            .map((y) => (
              <EditTilesCanvasMiddle key={`y${y}`} tileWidth={tileWidth} canvasWidth={canvasSize.canvasWidth}>
                {/* @ts-ignore */}
                {Array.apply(null, { length: canvasSize.xMax + 1 - canvasSize.xMin })
                  .map(function (_, idx) {
                    return idx + canvasSize.xMin
                  })
                  .map((x) => {
                    const tilesThere = tiles.filter((tile) => tile.x === x && tile.y === y)

                    return (
                      <EditTilesTile key={`y${y}x${x}`} width={tileWidth} height={tileHeight} showGrid={showGrid}>
                        <div>
                          <div>
                            <p>{`Tile (${x}, ${y})`}</p>
                            {tilesThere.length > 0 ? (
                              <TileVoting>
                                Vote on tile:
                                <TileVotingButtons>
                                  <img
                                    alt="check"
                                    src="/icons/check.svg"
                                    onClick={() => handleVote(tilesThere.map((tile) => tile.tileId)[0], true)}
                                  />
                                  <img
                                    alt="cross"
                                    src="/icons/cross.svg"
                                    onClick={() => handleVote(tilesThere.map((tile) => tile.tileId)[0], false)}
                                  />
                                </TileVotingButtons>
                              </TileVoting>
                            ) : (
                              <UploaderFileSelector>
                                {isUploading ? (
                                  <div>Uploading...</div>
                                ) : (
                                  <input
                                    id="uploader"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e: any) => {
                                      e.target &&
                                        e.target.files &&
                                        e.target.files[0] &&
                                        handleUpload(e.target.files[0], x, y)
                                    }}
                                  />
                                )}
                              </UploaderFileSelector>
                            )}
                          </div>
                        </div>
                        {tilesThere.length > 0 && <img alt="tile" src={tilesThere.map((tile) => tile.image)[0]} />}
                      </EditTilesTile>
                    )
                  })}
              </EditTilesCanvasMiddle>
            ))}

          <EditTilesCanvasBottom
            width={tileWidth * canvasSize.canvasWidth}
            onClick={() =>
              setCanvasSize({ ...canvasSize, yMax: canvasSize.yMax + 1, canvasHeight: canvasSize.canvasHeight + 1 })
            }
          >
            <img alt="arrow" src="/icons/arrow.svg" />
          </EditTilesCanvasBottom>
        </div>

        <EditTilesCanvasRight
          height={tileHeight * canvasSize.canvasHeight}
          onClick={() =>
            setCanvasSize({ ...canvasSize, xMax: canvasSize.xMax + 1, canvasWidth: canvasSize.canvasWidth + 1 })
          }
        >
          <img alt="arrow" src="/icons/arrow.svg" />
        </EditTilesCanvasRight>
      </EditTilesCanvas>
    </EditTilesStyled>
  )
}
