import { useRef, useEffect } from 'react'

// styles
import { DropDownStyled, DropDownMenu, DropDownListContainer, DropDownList, DropDownListItem } from './DropDown.style'

// components
import Icon from '../Icon/Icon.view'

// helpers
import { scrollToFullView } from 'utils/scrollToFullView'
import { useOnClickOutside } from '../../../utils/hooks'

type DropDownViewProps = {
  placeholder: string
  onClick: () => void
  clickItem: (value: string) => void
  isOpen: boolean
  setIsOpen: (arg: boolean) => void
  itemSelected: string | undefined
  items: readonly string[]
}

export const DropDownView = ({ placeholder, isOpen, onClick, setIsOpen, clickItem, itemSelected, items }: DropDownViewProps) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const refDropdownWrapper = useRef<HTMLDivElement | null>(null)
  useOnClickOutside(refDropdownWrapper, () => setIsOpen(false))

  // if the dropdown is not fully visible in the window,
  // move the scroll to fix it
  useEffect(() => {
    if (isOpen) {
      scrollToFullView(ref.current)
    }
  }, [isOpen])
  return (
    <DropDownStyled ref={refDropdownWrapper} className="drop-down">
      <DropDownMenu onClick={onClick}>
        {itemSelected ?? placeholder}
        <span>
          <Icon className={isOpen ? 'open' : ''} id="arrow-down" />
        </span>
      </DropDownMenu>
      {isOpen && (
        <DropDownListContainer ref={ref} id={'dropDownListContainer'}>
          <DropDownList>
            {items.map((value, idx) => {
              const isActive = itemSelected === value
              return (
                <DropDownListItem onClick={() => clickItem(value)} key={`${idx}-${value}`}>
                  {value} {isActive ? <Icon id="check-stroke" /> : null}
                </DropDownListItem>
              )
            })}
          </DropDownList>
        </DropDownListContainer>
      )}
    </DropDownStyled>
  )
}
