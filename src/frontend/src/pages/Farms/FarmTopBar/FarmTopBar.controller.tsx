import { FarmTopBarView } from './FarmTopBar.view'

export type FarmTopBarProps = {
  loading: boolean
  handleToggleStakedOnly: () => void
  handleLiveFinishedToggleButtons: () => void
  searchValue: string
  onSearch: (val: string) => void
  onSort: (val: string) => void
}
export const FarmTopBar = ({
  loading,
  searchValue,
  onSearch,
  onSort,
  handleToggleStakedOnly,
  handleLiveFinishedToggleButtons,
}: FarmTopBarProps) => {
  return (
    <FarmTopBarView
      loading={loading}
      handleToggleStakedOnly={handleToggleStakedOnly}
      handleLiveFinishedToggleButtons={handleLiveFinishedToggleButtons}
      searchValue={searchValue}
      onSearch={onSearch}
      onSort={onSort}
    />
  )
}
