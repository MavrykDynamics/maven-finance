import * as PropTypes from 'prop-types'
import * as React from 'react'
import { useState } from 'react'

import { GridSheetView } from './GridSheet.view'
import { Column, Row, CellChange, TextCell } from '@silevis/reactgrid'
import '@silevis/reactgrid/styles.css'

type GridSheetProps = {
  setTableJson: ((tableJson: string) => void) | any
  loading: boolean
}

export const GridSheet = ({ setTableJson }: GridSheetProps) => {
  const [tableEntries, setTableEntries] = useState<any[]>(getInitialEntries())
  const [columns] = useState<Column[]>(getColumns())
  const setTableJsonCallback = (tableJson: any) => {
    setTableJson(JSON.stringify(tableJson))
  }

  const rows = getRows(tableEntries)

  const handleChanges = (changes: CellChange<TextCell>[]) => {
    setTableEntries((prevPeople) => applyChangesToPeople(changes, prevPeople))
  }

  const handleAddRow = () => {
    console.log(`Here in handleAddRow`)
  }
  const handleSubtractRow = () => {
    console.log(`Here in handleSubtractRow`)
  }
  const handleAddColumn = () => {
    console.log(`Here in handleAddColumn`)
  }
  const handleSubtractColumn = () => {
    console.log(`Here in handleSubtractColumn`)
  }

  return (
    <GridSheetView
      setTableEntries={setTableEntries}
      rows={rows}
      columns={columns}
      setTableJsonCallback={setTableJsonCallback}
      handleChanges={handleChanges}
      handleAddRow={handleAddRow}
      handleSubtractRow={handleSubtractRow}
      handleAddColumn={handleAddColumn}
      handleSubtractColumn={handleSubtractColumn}
    />
  )
}

GridSheet.propTypes = {
  setTableJson: PropTypes.func.isRequired,
}

GridSheet.defaultProps = {
  setTableJson: undefined,
}

interface TableEntry {
  [key: string]: string
}

const getInitialEntries = (): TableEntry[] => [
  { columnA: 'Thomas', columnB: 'Goldman' },
  { columnA: 'Susie', columnB: 'Quattro' },
  { columnA: '', columnB: '' },
]

const getColumns = (): Column[] => [
  { columnId: 'columnA', width: 150 },
  { columnId: 'columnB', width: 150 },
]

const headerRow: Row = {
  rowId: 'header',
  cells: [
    { type: 'header', text: 'Satellite Name' },
    { type: 'header', text: 'Purpose' },
  ],
}

const getRows = (people: TableEntry[]): Row[] => [
  headerRow,
  ...people.map<Row>((person, idx) => ({
    rowId: idx,
    cells: [
      { type: 'text', text: person.columnA },
      { type: 'text', text: person.columnB },
    ],
  })),
]
const applyChangesToPeople = (changes: CellChange[], prevPeople: TableEntry[]): TableEntry[] => {
  changes.forEach((change) => {
    if (change.newCell.type === 'text') {
      const personIndex = change.rowId
      const fieldName = change.columnId
      // @ts-ignore
      prevPeople[personIndex][fieldName] = change.newCell.text
    }
  })
  return [...prevPeople]
}
