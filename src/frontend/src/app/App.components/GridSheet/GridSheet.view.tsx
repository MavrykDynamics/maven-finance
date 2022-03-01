import * as PropTypes from 'prop-types'
import * as React from 'react'

import { GridSheetButtonContainer, GridSheetButtons, GridSheetStyled } from './GridSheet.style'
import { ReactGrid, Column, Row } from '@silevis/reactgrid'
import { Button } from '../Button/Button.controller'

type GridSheetViewProps = {
  setTableJsonCallback: (tableJson: any) => void
  setTableEntries: (entries: any) => void
  rows: Row[]
  columns: Column[]
  handleChanges: any
  handleAddRow: () => void
  handleSubtractRow: () => void
  handleAddColumn: () => void
  handleSubtractColumn: () => void
  onContextMenu?: () => any
}
export const GridSheetView = ({
  setTableJsonCallback,
  rows,
  columns,
  handleChanges,
  handleAddRow,
  handleSubtractRow,
  handleAddColumn,
  handleSubtractColumn,
}: GridSheetViewProps) => {
  const handleSetTableClick = () => {
    setTableJsonCallback({ rows, columns })
  }
  return (
    <GridSheetStyled>
      <ReactGrid
        rows={rows}
        columns={columns}
        onCellsChanged={handleChanges}
        enableFillHandle
        enableRangeSelection
        enableRowSelection
      />
      <GridSheetButtonContainer>
        <GridSheetButtons>
          <p>Add/Subtract Rows</p>
          <Button icon="add" text={''} kind={'secondary'} onClick={handleAddRow} />
          <Button icon="subtract" text={''} kind={'secondary'} onClick={handleSubtractRow} />
        </GridSheetButtons>
        <GridSheetButtons>
          <p>Add/Subtract Columns</p>
          <Button icon="add" text={''} kind={'secondary'} onClick={handleAddColumn} />
          <Button icon="subtract" text={''} kind={'secondary'} onClick={handleSubtractColumn} />
        </GridSheetButtons>
      </GridSheetButtonContainer>
      <Button text={'Set Table'} onClick={handleSetTableClick} kind="primary" />
    </GridSheetStyled>
  )
}

GridSheetView.propTypes = {
  setTableJsonCallback: PropTypes.func.isRequired,
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
}

GridSheetView.defaultProps = {
  setTableJsonCallback: undefined,
  rows: ['Hello'],
  columns: ['World'],
}
