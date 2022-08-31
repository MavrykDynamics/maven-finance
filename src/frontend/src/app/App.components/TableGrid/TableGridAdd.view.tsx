import { useState } from 'react'
import styled from 'styled-components'
import { cyanColor, darkColor } from 'styles'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { StyledTooltip } from '../../../app/App.components/Tooltip/Tooltip.view'

// types
import type { TableListType } from './TableGrid.types'

// style
import { TableGridWrap } from './TableGrid.style'

type Props = {
  tableData: TableListType
  setTableData: (arg0: TableListType) => void
}

const MAX_ROWS = 10
const MAX_COLS = 6

export default function TableGrid({ tableData, setTableData }: Props) {
  const [activeTd, setActieTd] = useState<number | ''>('')

  const isMaxRows = MAX_ROWS <= tableData.length
  const isMaxCols = MAX_COLS <= tableData[0].length

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number, j: number) => {
    const value = e.target.value
    const cloneTable = [...tableData]
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

  const handleDeleteColumn = (j: number) => {
    const newTable = tableData.map((item) => {
      return item.filter((_, i) => i !== j)
    })
    setTableData(newTable)
  }

  return (
    <TableGridWrap>
      {!isMaxCols ? (
        <div className="btn-add-wrap">
          <StyledTooltip placement="top" title="Insert 1 column right">
            <button onClick={handleAddColumn}>+</button>
          </StyledTooltip>
        </div>
      ) : null}

      <div className="table-wrap">
        <table>
          {tableData.map((row, i) => (
            <tr key={i}>
              {row.map((colValue, j) => {
                const isLastRow = tableData[0].length > 1 && tableData.length === i + 1
                return (
                  <td
                    key={`${i}+${j}`}
                    onMouseLeave={() => setActieTd('')}
                    onMouseEnter={() => setActieTd(j)}
                    className={row.length > 1 && j === activeTd ? 'active-td' : ''}
                  >
                    <input
                      value={colValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, i, j)}
                    />
                    {isLastRow ? (
                      <div className="delete-button-wrap">
                        <StyledTooltip placement="top" title="Delete column">
                          <button onClick={() => handleDeleteColumn(j)} className="delete-button">
                            <Icon id="delete" />
                          </button>
                        </StyledTooltip>
                      </div>
                    ) : null}
                  </td>
                )
              })}
            </tr>
          ))}
        </table>
      </div>
      {!isMaxRows ? (
        <StyledTooltip placement="top" title="Insert 1 row bottom">
          <button className="btn-add-row" onClick={handleAddRow}>
            +
          </button>
        </StyledTooltip>
      ) : null}
    </TableGridWrap>
  )
}
