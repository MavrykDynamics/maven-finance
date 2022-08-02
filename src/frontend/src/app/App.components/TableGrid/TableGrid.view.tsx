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

export default function TableGrid({ tableData, setTableData }: Props) {
  const [openDrop, setOpenDrop] = useState('')

  const isMaxRows = MAX_ROWS <= tableData.length

  const handleChangeData = (value: string, i: number, j: number) => {
    const cloneTable = [...tableData]
    cloneTable[i][j] = value
    setTableData(cloneTable)
    setOpenDrop('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number, j: number) => {
    const value = e.target.value
    handleChangeData(value, i, j)
  }

  const handleAddRow = () => {
    setOpenDrop('')
    const newFillRow = ['', '', '', PAYMENTS_TYPES[0]]
    setTableData([...tableData, newFillRow])
  }

  const handleDeleteRow = (i: number) => {
    setOpenDrop('')
    const newTable = tableData.filter((_, index) => index !== i)
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
                const isFirstRow = i === 0
                const isLastColumn = !isFirstRow && j === 3
                const isOpen = openDrop === `${i}-${j}`

                return (
                  <td key={`${i}+${j}`}>
                    {isFirstRow ? (
                      colValue
                    ) : !isLastColumn ? (
                      <input
                        onFocus={() => setOpenDrop('')}
                        value={colValue}
                        type={j === 2 ? 'number' : 'text'}
                        onChange={(e) => handleChange(e, i, j)}
                      />
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

                    {isLastColumn && tableData.length > 2 ? (
                      <div className="delete-button-wrap">
                        <StyledTooltip placement="top" title="Delete row">
                          <button onClick={() => handleDeleteRow(i)} className="delete-button">
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
