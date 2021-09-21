import { Button } from 'app/App.components/Button/Button.controller'
import * as React from 'react'
import { Link } from 'react-router-dom'

//prettier-ignore
import { CreateGrid, CreateGridCell, CreateGridCellTitle, CreateStyled, CreateSubTitle, CreateTitle } from './Create.style'

export const CreateView = () => {
  return (
    <CreateStyled>
      <CreateTitle>Create a new canvas</CreateTitle>
      <CreateSubTitle>and cooperate with other artists</CreateSubTitle>
      <CreateGrid>
        <CreateGridCell>
          <CreateGridCellTitle>
            Tile-based
            <br />
            project
          </CreateGridCellTitle>
          <svg>
            <use xlinkHref="/icons/sprites.svg#tiles" />
          </svg>
          <Link to="/edit-tiles">
            <Button color="secondary" text="Get started" />
          </Link>
        </CreateGridCell>
        <CreateGridCell>
          <CreateGridCellTitle>
            Layer-based
            <br />
            project
          </CreateGridCellTitle>
          <svg>
            <use xlinkHref="/icons/sprites.svg#layers" />
          </svg>
          <Link to="/edit-layers">
            <Button color="secondary" text="Get started" />
          </Link>
        </CreateGridCell>
      </CreateGrid>
    </CreateStyled>
  )
}
