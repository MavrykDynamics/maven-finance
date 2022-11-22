import React, { useState, useCallback } from 'react'

// components
import { Button } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { TzAddress } from '../../app/App.components/TzAddress/TzAddress.view'

// helpers
import { ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'
import { parseDate } from 'utils/time'
import { getSeparateCamelCase } from '../../utils/parse'

// styles
import { BreakGlassCouncilMyOngoingActionCardStyled } from './BreakGlassCouncil.style'
import { AvatarStyle } from 'app/App.components/Avatar/Avatar.style'

// types
import { BreakGlassAction } from "utils/TypesAndInterfaces/BreakGlass";

type Props = BreakGlassAction[0] & { numCouncilMembers: number }

export function BreakGlassCouncilMyOngoingActionCard(props: Props) {
  const { executionDatetime, actionType, signersCount, numCouncilMembers, id, parameters } = props
  const [isOpen, setIsOpen] = useState(false)

  if (isOpen) {
    console.log("🚀 ~ file: BreakGlassCouncilMyOngoingActionCard.view.tsx ~ line 20 ~ BreakGlassCouncilMyOngoingActionCard ~ props", props)
  }

  const handleClickCard = () => {
    setIsOpen(!isOpen)
  }

  const findActionByName = useCallback(
    (name: string) => parameters.find((item) => item.name === name)?.value || '',
    [parameters],
  )

  const isChangeCouncilMember = actionType === 'changeCouncilMember'
  const isAddCouncilMember = actionType === 'addCouncilMember'
  const isRemoveCouncilMember = actionType === 'removeCouncilMember'

  let bottomSection = (
    <>
      <div className='row two-columns'>
        <div className='column'>
          <div className='column-name'>Break Glass Action ID</div>
          <div className='column-value'>{id}</div>
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
    </>
  )

  if (isChangeCouncilMember || isAddCouncilMember) {
    const name = findActionByName(isChangeCouncilMember ? 'newCouncilMemberName' : 'councilMemberName')
    const website = findActionByName(isChangeCouncilMember ? 'newCouncilMemberWebsite' :'councilMemberWebsite')
    const address = findActionByName(isChangeCouncilMember ? 'newCouncilMemberAddress' : 'councilMemberAddress')
    const oldAddress = findActionByName('oldCouncilMemberAddress')
    const image = findActionByName(isChangeCouncilMember ? 'newCouncilMemberImage' : 'councilMemberImage')

    bottomSection = (
      <>
        <div className='row'>
          {isChangeCouncilMember && <div className='column'>
            <div className='column-name'>Council Member to change</div>
            <TzAddress className='column-value' tzAddress={oldAddress} hasIcon={true} />
          </div>}
  
          <div className='column'>
            <div className='column-name'>Council Member Name</div>
            <div className='column-value'>{name}</div>
          </div>
  
          <div className='column'>
            <div className='column-name'>Council Member Website</div>
            <div className='column-value'>{website}</div>
          </div>

          {isAddCouncilMember && <div className='column'>
            <div className='column-name'>New Council Member Address</div>
            <TzAddress className='column-value' tzAddress={address} hasIcon={true} />
          </div>}
        </div>
  
        <div className='row'>
          {isChangeCouncilMember ? <div className='column'>
            <div className='column-name'>New Council Member Address</div>
            <div className='column-value'>T1jk4...723h</div>
          </div> : <div className='column-value'></div>}
  
          {image ? <div className='column'>
            <div className='column-name'>Profile Pic</div>
            <img className='column-image' src={image} alt='user logo' />
          </div>: <div className='column-value'>-</div>}
  
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
      </>
    )
  }

  if (isRemoveCouncilMember) {
    const address = findActionByName('councilMemberAddress')

    bottomSection = (
      <>
        <div className='row two-columns'>
          <div className='column'>
            <div className='column-name'>Council Member to remove</div>
            <TzAddress className='column-value' tzAddress={address} hasIcon={true} />
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
      </>
    )
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
        {bottomSection}
      </div>}
    </BreakGlassCouncilMyOngoingActionCardStyled>
  )
}
