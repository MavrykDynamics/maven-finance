import { TableGridWrap } from './TableGrid.style'

type TableList = string[][] | []
type Props = {
  tableData: TableList
  setTableData: (arg0: TableList) => void
}

export default function TableGrid({ tableData, setTableData }: Props) {
  console.log('%c ||||| tableData', 'color:yellowgreen', tableData)
  return <TableGridWrap>TableGrid.view</TableGridWrap>
}
