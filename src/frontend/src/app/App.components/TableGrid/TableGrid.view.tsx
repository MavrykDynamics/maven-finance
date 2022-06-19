import { useState } from 'react'
import styled from 'styled-components'
import { cyanColor, darkColor } from 'styles'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { StyledTooltip } from '../../../app/App.components/Tooltip/Tooltip.view'

// const
import { PAYMENTS_TYPES } from '../../../pages/ProposalSubmission/StageThreeForm/StageThreeForm.controller'

// types
import type { TableListType } from './TableGrid.types'

// style
import { TableGridWrap } from './TableGrid.style'
import {
  DropDownStyled,
  DropDownMenu,
  DropDownListContainer,
  DropDownList,
  DropDownListItem,
} from '../../../app/App.components/DropDown/DropDown.style'

type Props = {
  tableData: TableListType
  setTableData: (arg0: TableListType) => void
}

const MAX_ROWS = 10
const MAX_COLS = 6

export default function TableGrid({ tableData, setTableData }: Props) {
  const [openDrop, setOpenDrop] = useState('')

  const isMaxRows = MAX_ROWS <= tableData.length
  const isMaxCols = MAX_COLS <= tableData[0].length

  const handleChangeData = (value: string, i: number, j: number) => {
    const cloneTable = [...tableData]
    cloneTable[i][j] = value
    setTableData(cloneTable)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number, j: number) => {
    const value = e.target.value
    handleChangeData(value, i, j)
  }

  const handleAddRow = () => {
    const newFillRow = ['', '', '', PAYMENTS_TYPES[0]]
    setTableData([...tableData, newFillRow])
  }

  const handleDeleteColumn = (j: number) => {
    const newTable = tableData.map((item) => {
      return item.filter((_, i) => i !== j)
    })
    setTableData(newTable)
  }

  const handleToggleDrop = (i: number, j: number) => {
    if (openDrop) {
      setOpenDrop('')
    } else {
      setOpenDrop(`${i}-${j}`)
    }
  }

  return (
    <TableGridWrap>
      <div className="table-wrap">
        <table>
          {tableData.map((row, i) => (
            <tr key={i}>
              {row.map((colValue, j) => {
                const isLastRow = tableData[0].length > 1 && tableData.length === i + 1
                const isFirstRow = i === 0
                const isLastColumn = !isFirstRow && j === 3

                const isOpen = openDrop === `${i}-${j}`

                return (
                  <td key={`${i}+${j}`}>
                    {isFirstRow ? (
                      colValue
                    ) : !isLastColumn ? (
                      <input value={colValue} onChange={(e) => handleChange(e, i, j)} />
                    ) : (
                      <div className="table-drop">
                        <button onClick={() => handleToggleDrop(i, j)} className="table-drop-btn-cur">
                          {colValue}
                        </button>
                        {isOpen && (
                          <DropDownListContainer>
                            <DropDownList>
                              {PAYMENTS_TYPES.map((value, index) => {
                                const isActive = colValue === value
                                return (
                                  <DropDownListItem onClick={() => handleChangeData(value, i, j)} key={Math.random()}>
                                    {value} {isActive ? <Icon id="check-stroke" /> : null}
                                  </DropDownListItem>
                                )
                              })}
                            </DropDownList>
                          </DropDownListContainer>
                        )}
                      </div>
                    )}

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
