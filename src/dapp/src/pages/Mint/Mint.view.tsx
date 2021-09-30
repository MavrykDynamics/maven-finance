import { Button } from 'app/App.components/Button/Button.controller'
import * as React from 'react'
import { Link } from 'react-router-dom'

//prettier-ignore
import { MintGrid, MintGridCell, MintGridCellTitle, MintStyled, MintSubTitle, MintTitle } from './Mint.style'

export const MintView = () => {
  return (
    <MintStyled>
      <MintTitle>Mint a new canvas</MintTitle>
      <MintSubTitle>and cooperate with other artists</MintSubTitle>
      <MintGrid>
        <MintGridCell>
          <MintGridCellTitle>
            Tile-based
            <br />
            project
          </MintGridCellTitle>
          <svg>
            <use xlinkHref="/icons/sprites.svg#tiles" />
          </svg>
          <Link to="/edit-tiles">
            <Button color="secondary" text="Get started" />
          </Link>
        </MintGridCell>
        <MintGridCell>
          <MintGridCellTitle>
            Layer-based
            <br />
            project
          </MintGridCellTitle>
          <svg>
            <use xlinkHref="/icons/sprites.svg#layers" />
          </svg>
          <Link to="/edit-layers">
            <Button color="secondary" text="Get started" />
          </Link>
        </MintGridCell>
      </MintGrid>
    </MintStyled>
  )
}
