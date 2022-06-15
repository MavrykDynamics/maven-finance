import * as React from 'react'
import * as PropTypes from 'prop-types'

import { DropDownStyled, DropDownMenu, DropDownListContainer, DropDownList, DropDownListItem } from './DropDown.style'

// components
import Icon from '../Icon/Icon.view'

type DropDownViewProps = {
  icon?: string
  id?: string
  placeholder: string
  name?: string
  value?: string
  onChange: any
  onBlur: any
  inputStatus?: 'success' | 'error'
  type: string
  onClick: () => void
  clickItem: (value: string) => void
  errorMessage?: string
  isOpen: boolean
  itemSelected: string | undefined
  items: readonly string[]
}

export const DropDownView = ({
  icon,
  id,
  placeholder,
  name,
  value,
  onChange,
  onBlur,
  inputStatus,
  type,
  errorMessage,
  isOpen,
  onClick,
  clickItem,
  itemSelected,
  items,
}: DropDownViewProps) => {
  return (
    <DropDownStyled id={id}>
      <DropDownMenu
        onClick={() => {
          onClick()
        }}
      >
        {itemSelected !== undefined ? itemSelected : placeholder}
        <span>
          <Icon className={isOpen ? 'open' : ''} id="arrow-down" />
        </span>
      </DropDownMenu>
      {isOpen && (
        <DropDownListContainer id={'dropDownListContainer'}>
          <DropDownList>
            {items.map((value, index) => {
              const isActive = itemSelected === value
              return (
                <DropDownListItem onClick={() => clickItem(value)} key={Math.random()}>
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
DropDownView.propTypes = {
  icon: PropTypes.string,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  inputStatus: PropTypes.string,
  type: PropTypes.string,
  errorMessage: PropTypes.string,
}

DropDownView.defaultProps = {
  icon: undefined,
  placeholder: 'Sort by...',
  name: undefined,
  value: undefined,
  inputStatus: undefined,
  type: 'text',
}
