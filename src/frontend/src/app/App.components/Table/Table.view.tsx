import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { StyledTableCell, StyledTableRow, TableStyled } from './Table.style'
import { createTheme, PaletteMode, ThemeProvider } from '@mui/material'
import { useMemo } from 'react'

type TableViewProps = {
  columns: string[]
  cells: any[]
}

export const TableView = ({ columns, cells }: TableViewProps) => {
  const [mode, setMode] = React.useState<PaletteMode>('light')
  // const colorMode = React.useMemo(
  //   () => ({
  //     // The dark mode switch would invoke this method
  //     toggleColorMode: () => {
  //       setMode((prevMode: PaletteMode) => (prevMode === 'light' ? 'dark' : 'light'))
  //     },
  //   }),
  //   [],
  // )
  //
  // // @ts-ignore
  // const theme = useMemo(() => createTheme(theme), [mode])

  return (
    <TableStyled>
      <TableContainer component={Paper}>
        <Table aria-label="customized table">
          <TableHead>
            <TableRow sx={{ minHeight: 50 }}>
              {columns.map((col) => {
                return <StyledTableCell key={col}>{col}</StyledTableCell>
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {cells.map((cell) => (
              <StyledTableRow key={String(cell.sat_addr + cell.sat_name)}>
                <StyledTableCell component="th" scope="row">
                  {cell.sat_name}
                </StyledTableCell>
                <StyledTableCell align="right">{cell.sat_addr}</StyledTableCell>
                <StyledTableCell align="right">{cell.purpose}</StyledTableCell>
                <StyledTableCell align="right">{cell.amount}</StyledTableCell>
                <StyledTableCell align="right">{cell.token_type}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </TableStyled>
  )
}
