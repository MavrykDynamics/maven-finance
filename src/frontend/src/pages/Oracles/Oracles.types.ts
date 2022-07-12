export type OraclesListProps = {
  listTitle: string
  items: Array<any>
  noItemsText: string
  listType: 'satellites' | 'feeds' | 'oracles'
  name: string
  onClickHandler: (arg0: any) => void
  selectedItem?: any
}