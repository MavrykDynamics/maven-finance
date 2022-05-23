import { useState } from 'react'
import { Tooltip } from '@mui/material'
import styled from 'styled-components'

// types
import type { TableListType } from './TableGrid.types'

// style
import { TableGridWrap } from './TableGrid.style'

type Props = {
  tableData: TableListType
  setTableData: (arg0: TableListType) => void
}

const StyledTooltip = styled((props) => <Tooltip classes={{ popper: props.className }} {...props} />)`
  & .MuiTooltip-tooltip {
    background-color: #86d4c9;
    color: #160e3f;
  }
`

export default function TableGrid({ tableData, setTableData }: Props) {
  const [activeTd, setActieTd] = useState<number | ''>('')
  console.log('ТТТТТ - tableData')
  console.table(tableData)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number, j: number) => {
    const value = e.target.value
    const cloneTable = [...tableData]

    console.log('%c ||||| value', 'color:yellowgreen', value)
    cloneTable[i][j] = value
    setTableData(cloneTable)
  }

  const handleAddRow = () => {
    const innerTableLength = tableData[0].length
    const newFillRow = Array.from({ length: innerTableLength }, () => '')
    setTableData([...tableData, newFillRow])
  }

  const handleAddColumn = () => {
    const newTable = tableData.map((item) => {
      return item.concat('')
    })
    setTableData(newTable)
  }

  return (
    <TableGridWrap>
      <div className="btn-add-wrap">
        <StyledTooltip placement="top" title="Insert 1 column right">
          <button onClick={handleAddColumn}>+</button>
        </StyledTooltip>
      </div>
      <div className="table-wrap">
        <table>
          {tableData.map((row, i) => (
            <tr key={i}>
              {row.map((colValue, j) => (
                <td
                  key={`${i}+${j}`}
                  onMouseLeave={() => setActieTd('')}
                  onMouseEnter={() => setActieTd(j)}
                  className={row.length > 1 && j === activeTd ? 'active-td' : ''}
                >
                  <input value={colValue} onChange={(e) => handleChange(e, i, j)} />
                </td>
              ))}
            </tr>
          ))}
        </table>
      </div>
      <StyledTooltip placement="top" title="Insert 1 row bottom">
        <button className="btn-add-row" onClick={handleAddRow}>
          +
        </button>
      </StyledTooltip>
    </TableGridWrap>
  )
}
