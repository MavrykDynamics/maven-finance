import * as React from 'react'
import { useState } from 'react'
import { TableView } from './Table.view'

type TableProps = {
  tableData: string
}

export const Table = ({ tableData }: TableProps) => {
  const [proposalTableData, _] = useState(JSON.parse(tableData))
  const tableColumns = Object.keys(proposalTableData.myrows[0])
  const cells: any[] = []
  proposalTableData.myrows.forEach((item: any, index: number) => {
    const newDataRow = createDataRow(
      index,
      item[tableColumns[0]],
      item[tableColumns[1]],
      item[tableColumns[2]],
      item[tableColumns[3]],
      item[tableColumns[4]],
    )
    cells.push(newDataRow)
  })
  return <TableView columns={tableColumns} cells={cells} />
}

function createDataRow(
  id: number,
  sat_name: string,
  sat_addr: string,
  purpose: string,
  amount: string,
  token_type: string,
) {
  return { id, sat_name, sat_addr, purpose, amount, token_type }
}
