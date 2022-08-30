import { DropDownStyled, DropDownMenu, DropDownListContainer, DropDownList, DropDownListItem } from './DropDown.style'

// components
import Icon from '../Icon/Icon.view'

type DropDownViewProps = {
  placeholder: string
  onClick: () => void
  clickItem: (value: string) => void
  isOpen: boolean
  itemSelected: string | undefined
  items: readonly string[]
}

export const DropDownView = ({ placeholder, isOpen, onClick, clickItem, itemSelected, items }: DropDownViewProps) => {
  return (
    <DropDownStyled className="drop-down">
      <DropDownMenu onClick={onClick}>
        {itemSelected ?? placeholder}
        <span>
          <Icon className={isOpen ? 'open' : ''} id="arrow-down" />
        </span>
      </DropDownMenu>
      {isOpen && (
        <DropDownListContainer id={'dropDownListContainer'}>
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
