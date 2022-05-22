// types
import type { TableListType } from './TableGrid.types'

// style
import { TableGridWrap } from './TableGrid.style'

type Props = {
  tableData: TableListType
  setTableData: (arg0: TableListType) => void
}

export default function TableGrid({ tableData, setTableData }: Props) {
  console.log('ТТТТТ - tableData')
  console.table(tableData)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number, j: number) => {
    const value = e.target.value
    const cloneTable = [...tableData]

    console.log('%c ||||| value', 'color:yellowgreen', value)
    cloneTable[i][j] = value
    setTableData(cloneTable)
  }

  return (
    <TableGridWrap>
      <table>
        {tableData.map((row, i) => (
          <tr key={i}>
            {row.map((colValue, j) => (
              <td key={`${i}+${j}`}>
                <input value={colValue} onChange={(e) => handleChange(e, i, j)} />
              </td>
            ))}
          </tr>
        ))}
      </table>
    </TableGridWrap>
  )
}
