import React, { useState } from 'react'

// components
import { Button } from 'app/App.components/SettingsPopup/SettingsPopup.style'

// helpers
import { ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'

// styles
import { BreakGlassCouncilMyOngoingActionCardStyled } from './BreakGlassCouncil.style'

// types
import { BreakGlassAction } from "utils/TypesAndInterfaces/BreakGlass";

type Props = BreakGlassAction[0]

export function BreakGlassCouncilMyOngoingActionCard(props: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClickCard = () => {
    setIsOpen(!isOpen)
  }

  return (
    <BreakGlassCouncilMyOngoingActionCardStyled>
      <div className='top' onClick={handleClickCard}>
        <div className='row top-row'>
          <div className='column'>
            <div className='column-name'>Date</div>
            <div className='column-value'>28.03.2023</div>
          </div>

          <div className='column'>
            <div className='column-name'>Purpose</div>
            <div className='column-value'>Change Council Member</div>
          </div>

          <div className='column'>
            <div className='column-name'>Signed</div>
            <div className='column-value'>3/8</div>
          </div>
        </div>
      </div>

      {isOpen && <div className='bottom'>
        <div className='row'>
          <div className='column'>
            <div className='column-name'>Council Member to change</div>
            <div className='column-value'>T1jk4...723h</div>
          </div>

          <div className='column'>
            <div className='column-name'>Council Member to change</div>
            <div className='column-value'>T1jk4...723h</div>
          </div>

          <div className='column'>
            <div className='column-name'>Council Member to change</div>
            <div className='column-value'>T1jk4...723h</div>
          </div>
        </div>

        <div className='row'>
          <div className='column'>
            <div className='column-name'>New Council Member Address</div>
            <div className='column-value'>T1jk4...723h</div>
          </div>

          <div className='column'>
            <div className='column-name'>New Council Member Address</div>
            <div className='column-value'>T1jk4...723h</div>
          </div>

          <div className='column'>
            <Button
              className='drop-btn'
              icon="close-stroke"
              text="Drop Action"
              kind={ACTION_SECONDARY}
              onClick={() => {}}
            />
          </div>
        </div>
      </div>}
    </BreakGlassCouncilMyOngoingActionCardStyled>
  )
}
