import * as React from 'react'

import { ToggleButtonWrapper, ToggleButtonItem } from './Toggle-button.style'

type ToggleButtonViewProps = {
  uniqueContracts: string[]
  selected: string
  handleSetSelectedToggler: (arg0: string) => void
}

export const ToggleButton = ({ uniqueContracts, selected, handleSetSelectedToggler }: ToggleButtonViewProps) => {
  return (
    <ToggleButtonWrapper
      className={`${uniqueContracts.length <= 2 ? 'small-size' : ''} ${uniqueContracts.length > 4 ? 'big-size' : ''}`}
    >
      {uniqueContracts.map((contract) => (
        <ToggleButtonItem
          key={contract}
          className={`${selected === contract ? 'selected' : ''} toggle-btn`}
          onClick={() => handleSetSelectedToggler(contract)}
        >
          {contract}
        </ToggleButtonItem>
      ))}
    </ToggleButtonWrapper>
  )
}
