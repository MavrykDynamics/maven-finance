import { Input } from 'app/App.components/Input/Input.controller'
import dayjs from 'dayjs'
import { create } from 'ipfs-http-client'
import { Mint, Vote } from 'pages/EditTiles/EditTiles.controller'
import { Tile } from 'pages/EditTiles/EditTiles.view'
import { useEffect, useState } from 'react'
import { useAlert } from 'react-alert'

// prettier-ignore
import { EditLayersCanvas, EditLayersCanvasTop, EditLayersGrid, EditLayersLoading, EditLayersMenu, EditLayersResult, EditLayersResultLayer, EditLayersStyled, EditLayersTile, TileVoting, TileVotingButtons, UploaderFileSelector, UploaderLabel } from "./EditLayers.style";

const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

type EditLayersViewProps = {
  loadingTiles: boolean
  mintCallback: (mintProps: Mint) => Promise<any>
  voteCallback: (voteProps: Vote) => Promise<any>
  setMintTransactionPendingCallback: (b: boolean) => void
  connectedUser: string
  mintTransactionPending: boolean
  existingTiles: Tile[]
  urlCanvasId?: string
}

export const EditLayersView = ({
  loadingTiles,
  mintCallback,
  voteCallback,
  connectedUser,
  existingTiles,
  setMintTransactionPendingCallback,
  mintTransactionPending,
  urlCanvasId,
}: EditLayersViewProps) => {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [newTiles, setNewTiles] = useState<Tile[]>([])
  const [tileWidth, setTileWidth] = useState(200)
  const [tileHeight, setTileHeight] = useState(150)
  const [lockedInputs, setLockedInputs] = useState(false)
  const [deadline, setDeadline] = useState(dayjs().add(3, 'days').format())
  const [isUploading, setIsUploading] = useState(false)
  const alert = useAlert()
  const [canvasId, setCanvasId] = useState(urlCanvasId)
  const [canvasSize, setCanvasSize] = useState({
    lMax: 0,
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
      const lMax = tiles.map((tile) => tile.l).reduce((result, currentValue) => Math.max(result, currentValue))

      if (lMax > canvasSize.lMax)
        setCanvasSize({
          lMax,
          canvasWidth: 1,
          canvasHeight: lMax + 1,
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

  async function handleUpload(file: any, l: number) {
    const tileId = Math.floor(Math.random() * 1000000) //TODO: Implement better tileId

    try {
      setIsUploading(true)

      // Upload to IPFS
      const added = await client.add(file)
      const image = `https://ipfs.infura.io/ipfs/${added.path}`

      const tile: Tile = {
        tileId,
        canvasId: canvasId as string,
        x: -1,
        y: -1,
        l,
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
    <EditLayersStyled>
      <EditLayersMenu>
        <div>Canvas size:</div>
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
            <EditLayersLoading>
              <svg>
                <use xlinkHref="/icons/sprites.svg#loading" />
              </svg>
              <div>Loading existing tiles...</div>
            </EditLayersLoading>
          )}
        </div>
      </EditLayersMenu>

      <EditLayersGrid>
        <EditLayersCanvas>
          <EditLayersCanvasTop
            onClick={() =>
              setCanvasSize({ ...canvasSize, lMax: canvasSize.lMax + 1, canvasHeight: canvasSize.canvasHeight + 1 })
            }
          >
            <img alt="arrow" src="/icons/arrow.svg" />
          </EditLayersCanvasTop>

          {/* @ts-ignore */}
          {Array.apply(null, { length: canvasSize.lMax + 1 })
            .map(function (_, idx) {
              return idx
            })
            .reverse()
            .map((l) => {
              const tilesThere = tiles.filter((tile) => tile.l === l)
              console.log(l, tilesThere.map((tile) => tile.image)[0])

              return (
                <EditLayersTile key={`ll${l}`} width={tileWidth} height={tileHeight}>
                  <div>
                    <div>
                      <p>{`Layer (${l})`}</p>
                      {tilesThere.length > 0 ? (
                        <TileVoting>
                          Vote on layer:
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
                                e.target && e.target.files && e.target.files[0] && handleUpload(e.target.files[0], l)
                              }}
                            />
                          )}
                        </UploaderFileSelector>
                      )}
                    </div>
                  </div>
                  {tilesThere.length > 0 && <img alt="tile" src={tilesThere.map((tile) => tile.image)[0]} />}
                </EditLayersTile>
              )
            })}
          <div />
        </EditLayersCanvas>

        <EditLayersResult>
          {
            //@ts-ignore
            Array.apply(null, { length: canvasSize.lMax + 1 })
              .map(function (_, idx) {
                return idx
              })
              .map((l) => (
                <EditLayersResultLayer key={`l${l}`} layer={l} width={tileWidth} height={tileHeight}>
                  {tiles.filter((tile) => tile.l === l).length > 0 && (
                    <img alt="tile" src={tiles.filter((tile) => tile.l === l).map((tile) => tile.image)[0]} />
                  )}
                </EditLayersResultLayer>
              ))
          }
        </EditLayersResult>
      </EditLayersGrid>
    </EditLayersStyled>
  )
}
