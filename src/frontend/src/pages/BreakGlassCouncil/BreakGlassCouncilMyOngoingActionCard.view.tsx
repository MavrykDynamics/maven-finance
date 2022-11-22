import React, { useState } from 'react'

// components
import { Button } from 'app/App.components/SettingsPopup/SettingsPopup.style'

// helpers
import { ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'
import { parseDate } from 'utils/time'
import { getSeparateCamelCase } from '../../utils/parse'

// styles
import { BreakGlassCouncilMyOngoingActionCardStyled } from './BreakGlassCouncil.style'

// types
import { BreakGlassAction } from "utils/TypesAndInterfaces/BreakGlass";

type Props = BreakGlassAction[0] & { numCouncilMembers: number }

export function BreakGlassCouncilMyOngoingActionCard(props: Props) {
  const { executionDatetime, actionType, signersCount, numCouncilMembers } = props
  console.log("🚀 ~ file: BreakGlassCouncilMyOngoingActionCard.view.tsx ~ line 18 ~ BreakGlassCouncilMyOngoingActionCard ~ props", props)
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
            <div className='column-value'>{parseDate({ time: executionDatetime, timeFormat: 'MMM Do, YYYY' })}</div>
          </div>

          <div className='column'>
            <div className='column-name'>Purpose</div>
            <div className='column-value'>{getSeparateCamelCase(actionType)}</div>
          </div>

          <div className='column'>
            <div className='column-name'>Signed</div>
            <div className='column-value'>{signersCount}/{numCouncilMembers}</div>
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
