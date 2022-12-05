import { DropDownView } from './DropDown.view'

type DropDownProps = {
  placeholder: string
  items: readonly string[]
  clickOnDropDown: () => void
  clickOnItem: (value: string) => void
  isOpen: boolean
  setIsOpen: (arg: boolean) => void
  itemSelected: string | undefined
  className?: string
}

export type DropdownItemType = {
  text: string
  value: string
}

export const DropDown = ({
  placeholder,
  items,
  isOpen,
  setIsOpen,
  itemSelected,
  clickOnItem,
  clickOnDropDown,
  className,
}: DropDownProps) => {
  return (
    <DropDownView
      placeholder={placeholder}
      isOpen={isOpen}
      items={items}
      itemSelected={itemSelected}
      onClick={clickOnDropDown}
      clickItem={clickOnItem}
      setIsOpen={setIsOpen}
      className={className}
    />
  )
}
