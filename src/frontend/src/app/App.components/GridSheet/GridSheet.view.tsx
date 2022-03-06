import * as PropTypes from 'prop-types'
import * as React from 'react'

import { GridSheetButtonContainer, GridSheetButtons, GridSheetStyled } from './GridSheet.style'
import { ReactGrid, Column, Row } from '@silevis/reactgrid'
import { Button } from '../Button/Button.controller'
import { useState } from 'react'

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
  headerRow: any
}
export const GridSheetView = ({
  setTableJsonCallback,
  rows,
  columns,
  headerRow,
  handleChanges,
  handleAddRow,
  handleSubtractRow,
  handleAddColumn,
  handleSubtractColumn,
}: GridSheetViewProps) => {
  const [items, setItems] = useState<string[]>([])

  const [message, setMessage] = useState<any>('')
  const handleSetTableClick = () => {
    setTableJsonCallback({ rows, columns })
  }
  const updateMessage = (e: any) => {
    setMessage(e.target.value)
  }

  const handleClick = () => {
    setItems([...items, message])
    setMessage('')
  }

  const handleItemChanged = (index: number, e: any) => {
    let newItems = [...items]
    newItems[index] = e.target.value
    setItems(newItems)
    // this.setState({
    //   items: newItems
    // });
  }

  const handleItemDeleted = (index: number) => {
    let newItems = [...items]

    newItems.splice(index, 1)
    setItems(newItems)
    // this.setState({
    //   items: newItems
    // });
  }
  const renderRows = () => {
    return items.map((item, index) => {
      return (
        <tr key={'item-' + index}>
          <td>
            <input type="text" value={item} onChange={(e: any) => handleItemChanged(index, e)} />
          </td>
          <td>
            <button onClick={() => handleItemDeleted(index)}>Delete</button>
          </td>
        </tr>
      )
    })
  }
  const renderColumns = () => {
    return headerRow.map((item: any, index: number) => {
      return (
        <tr key={'item-' + index}>
          <th>
            <input type="text" value={item.text} onChange={(e: any) => handleItemChanged(index, e)} />
          </th>
        </tr>
      )
    })
  }
  return (
    <GridSheetStyled>
      <>
        <div>
          <table className="">
            <thead>
              <tr>{renderColumns()}</tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>
          <hr />
          <input type="text" value={message} onChange={(e: any) => updateMessage(e)} />
          <button onClick={handleClick}>Add Item</button>
        </div>
      </>
      {/*<ReactGrid*/}
      {/*  rows={rows}*/}
      {/*  columns={columns}*/}
      {/*  onCellsChanged={handleChanges}*/}
      {/*  enableFillHandle*/}
      {/*  enableRangeSelection*/}
      {/*  enableRowSelection*/}
      {/*/>*/}
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
