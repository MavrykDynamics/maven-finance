import { DropDownView } from './DropDown.view'

type DropDownProps = {
  placeholder: string
  items: readonly string[]
  clickOnDropDown: () => void
  clickOnItem: (value: string) => void
  isOpen: boolean
  itemSelected: string | undefined
}

export const DropDown = ({ placeholder, items, isOpen, itemSelected, clickOnItem, clickOnDropDown }: DropDownProps) => {
  return (
    <DropDownView
      placeholder={placeholder}
      isOpen={isOpen}
      items={items}
      itemSelected={itemSelected}
      onClick={clickOnDropDown}
      clickItem={clickOnItem}
    />
  )
}
