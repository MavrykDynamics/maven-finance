import * as PropTypes from 'prop-types'
import * as React from 'react'
import { useEffect, useState } from 'react'

import { GridSheetView } from './GridSheet.view'
import { Column, Row, CellChange, TextCell } from '@silevis/reactgrid'
import '@silevis/reactgrid/styles.css'

type GridSheetProps = {
  setTableJson: ((tableJson: string) => void) | any
  loading: boolean
}
const abcMap = new Map<number, string>([
  [1, 'A'],
  [2, 'B'],
  [3, 'C'],
  [4, 'D'],
  [5, 'E'],
  [6, 'F'],
  [7, 'G'],
  [8, 'H'],
  [9, 'I'],
  [10, 'J'],
  [11, 'K'],
  [12, 'L'],
  [13, 'M'],
  [14, 'N'],
  [15, 'O'],
  [16, 'P'],
  [17, 'Q'],
  [18, 'R'],
  [19, 'S'],
  [20, 'T'],
  [21, 'U'],
  [22, 'V'],
  [23, 'W'],
  [24, 'X'],
  [25, 'Y'],
  [26, 'Z'],
])

export const GridSheet = ({ setTableJson }: GridSheetProps) => {
  const [tableEntries, setTableEntries] = useState<any[]>(getInitialEntries())
  const [columns, setColumns] = useState<Column[]>(getColumns())
  const [headerRow, setHeaderRow] = useState<any[]>(getHeaderRow())
  const setTableJsonCallback = (tableJson: any) => {
    setTableJson(JSON.stringify(tableJson))
  }

  useEffect(() => {
    setColumns(columns)
  }, [columns])
  const rows = getRows(tableEntries)

  const handleChanges = (changes: CellChange<TextCell>[]) => {
    setTableEntries((prevEntries) => applyChangesToPeople(changes, prevEntries))
  }

  const handleAddRow = () => {
    console.log(`Here in handleAddRow`)
  }
  const handleSubtractRow = () => {
    console.log(`Here in handleSubtractRow`)
  }
  const handleAddColumn = () => {
    console.log(`Here in handleAddColumn`, columns)
    const newColumn = { columnId: 'columnC', width: 150 }
    const updatedColumns = [...columns, newColumn]
    console.log(updatedColumns)
    setColumns(updatedColumns)
  }
  const handleSubtractColumn = () => {
    console.log(`Here in handleSubtractColumn`)
  }

  return (
    <GridSheetView
      setTableEntries={setTableEntries}
      rows={rows}
      headerRow={headerRow}
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
const getHeaderRow = (): any[] => [
  { type: 'header', text: 'Satellite Name' },
  { type: 'header', text: 'Purpose' },
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
