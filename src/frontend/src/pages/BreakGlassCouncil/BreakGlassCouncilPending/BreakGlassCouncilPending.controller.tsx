import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

// components
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Button } from '../../../app/App.components/Button/Button.controller'

// helpers
import { getSeparateCamelCase } from '../../../utils/parse'

// types
import { BreakGlassActions } from 'utils/TypesAndInterfaces/BreakGlass'

// actions
import { signAction } from '../BreakGlassCouncil.actions'

// styles
import { BreakGlassCouncilPendingStyled } from './BreakGlassCouncilPending.style'
import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'

type Props = BreakGlassActions[0] & {
  numCouncilMembers: number
  councilPendingActionsLength: number
  index: number
}

export const BreakGlassCouncilPending = (props: Props) => {
  const dispatch = useDispatch()
  const { id, actionType, signersCount, numCouncilMembers, councilPendingActionsLength, parameters, index } = props

  const handleSign = () => {
    if (id) {
      dispatch(signAction(id))
    }
  }

  const findActionByName = useCallback(
    (name: string) => parameters.find((item) => item.name === name)?.value || '',
    [parameters],
  )

  const isAddCouncilMember = actionType === 'addCouncilMember'
  const isUpdateChangeCouncilMember = actionType === 'updateCouncilMember'
  const isChangeCouncilMember = actionType === 'changeCouncilMember'
  const isRemoveCouncilMember = actionType === 'removeCouncilMember'
  const isSetAllContractsAdmin = actionType === 'setAllContractsAdmin'
  const isSetSingleContractAdmin = actionType === 'setSingleContractAdmin'
  const isSignAction = actionType === 'signAction'

  if (isAddCouncilMember) {
    const councilMemberName = findActionByName('councilMemberName')
    return (
      <>
        <BreakGlassCouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className='number'>{index}</span>
          <h3>{getSeparateCamelCase(actionType)}</h3>
          <div className="parameters">
            <article>
              <p>Council Member Address</p>
              <span className="parameters-value">
                <TzAddress tzAddress={findActionByName('councilMemberAddress')} hasIcon={false} />
              </span>
            </article>
            {councilMemberName ? (
              <article>
                <p>Council Member Name</p>
                <span className="parameters-value">{councilMemberName}</span>
              </article>
            ) : null}
          </div>

          <div className="parameters">
            <article className="signed-article">
              <div>
                <p>Signed</p>
                <span className="parameters-value">
                  {signersCount}/{numCouncilMembers}
                </span>
              </div>
            </article>

            <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
          </div>
        </BreakGlassCouncilPendingStyled>
      </>
    )
  }

  if (isUpdateChangeCouncilMember) {
    const newCouncilMemberAddress = findActionByName('newCouncilMemberAddress')
    const newCouncilMemberName = findActionByName('newCouncilMemberName')
    const newCouncilMemberWebsite = findActionByName('newCouncilMemberWebsite')
    const newCouncilMemberImage = findActionByName('newCouncilMemberImage')
    return (
      <>
        <BreakGlassCouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className='number'>{index}</span>
          <h3>{getSeparateCamelCase(actionType)}</h3>
          <div className="parameters grid">
            <article>
              <p>Council Member</p>
              <span className="parameters-value">
                <TzAddress tzAddress={newCouncilMemberAddress} hasIcon={false} />
              </span>
            </article>

            <article>
              <p>Council Member Name</p>
              <span className="parameters-value">{newCouncilMemberName || '-'}</span>
            </article>

            <article className="signed-article">
              <div>
                <p>Signed</p>
                <span className="parameters-value">
                  {signersCount}/{numCouncilMembers}
                </span>
              </div>
            </article>
          </div>

          <div className="parameters grid">
            <article>
              {newCouncilMemberImage ? (
                <article className="parameters-img">
                  <AvatarStyle>
                    <img src={newCouncilMemberImage} />
                  </AvatarStyle>
                </article>
              ) : (
                <>
                  <p>Profile Pic</p>
                  <span className="parameters-value">-</span>
                </>
              )}
            </article>

            <article>
              <p>Council Member Website</p>
              {newCouncilMemberWebsite ? (
                <a className="parameters-link" href={newCouncilMemberWebsite} target="_blank" rel="noreferrer">
                  {newCouncilMemberWebsite}
                </a>
              ) : (
                <span className="parameters-value">-</span>
              )}
            </article>

            <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
          </div>
        </BreakGlassCouncilPendingStyled>
      </>
    )
  }

  if (isChangeCouncilMember) {
    const oldCouncilMemberAddress = findActionByName('oldCouncilMemberAddress')
    const newCouncilMemberAddress = findActionByName('newCouncilMemberAddress')
    const newCouncilMemberName = findActionByName('newCouncilMemberName')
    const newCouncilMemberWebsite = findActionByName('newCouncilMemberWebsite')
    const newCouncilMemberImage = findActionByName('newCouncilMemberImage')
    return (
      <>
        <BreakGlassCouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className='number'>{index}</span>
          <h3>{getSeparateCamelCase(actionType)}</h3>
          <div className="parameters grid">
            <article>
              <p className="without-margin">Council Member to change</p>
              <span className="parameters-value">
                <TzAddress tzAddress={oldCouncilMemberAddress} hasIcon={false} />
              </span>
            </article>
            <article>
              <p>Council Member Address</p>
              <span className="parameters-value">
                <TzAddress tzAddress={newCouncilMemberAddress} hasIcon={false} />
              </span>
            </article>

            <article>
              <p>Council Member Name</p>
              <span className="parameters-value">{newCouncilMemberName || '-'}</span>
            </article>

            <article className="signed-article">
              <div>
                <p>Signed</p>
                <span className="parameters-value">
                  {signersCount}/{numCouncilMembers}
                </span>
              </div>
            </article>
          </div>

          <div className="parameters grid">
            <div></div>

            <article>
              {newCouncilMemberImage ? (
                <article className="parameters-img">
                  <AvatarStyle>
                    <img src={newCouncilMemberImage} />
                  </AvatarStyle>
                </article>
              ) : (
                <>
                  <p>Profile Pic</p>
                  <span className="parameters-value">-</span>
                </>
              )}
            </article>

            <article>
              <p>Council Member Website</p>
              {newCouncilMemberWebsite ? (
                <a className="parameters-link" href={newCouncilMemberWebsite} target="_blank" rel="noreferrer">
                  {newCouncilMemberWebsite}
                </a>
              ) : (
                <span className="parameters-value">-</span>
              )}
            </article>

            <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
          </div>
        </BreakGlassCouncilPendingStyled>
      </>
    )
  }

  if (isSetAllContractsAdmin) {
    const newAdminAddress = findActionByName('newAdminAddress')
    return (
      <BreakGlassCouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className='number'>{index}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <div>
            <p>New Admin Addres</p>
            <span className="parameters-value">
              <TzAddress tzAddress={newAdminAddress} hasIcon={false} />
            </span>
          </div>
          <div>
            <p>Signed</p>
            <span className="parameters-value">
              {signersCount}/{numCouncilMembers}
            </span>
          </div>
        </div>
        <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
      </BreakGlassCouncilPendingStyled>
    )
  }

  if (isRemoveCouncilMember) {
    const councilMemberAddress = findActionByName('councilMemberAddress')
    return (
      <BreakGlassCouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className='number'>{index}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <div>
            <p>Council Addres</p>
            <span className="parameters-value">
              <TzAddress tzAddress={councilMemberAddress} hasIcon={false} />
            </span>
          </div>
          <div>
            <p>Signed</p>
            <span className="parameters-value">
              {signersCount}/{numCouncilMembers}
            </span>
          </div>
        </div>
        <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
      </BreakGlassCouncilPendingStyled>
    )
  }

  if (isSetSingleContractAdmin) {
    const newAdminAddress = findActionByName('newAdminAddress')
    const targetContractAddress = findActionByName('targetContractAddress')
    return (
      <BreakGlassCouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className='number'>{index}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <article>
            <p>New Admin Address</p>
            <span className="parameters-value">
              <TzAddress tzAddress={newAdminAddress} hasIcon={false} />
            </span>
          </article>

          <article className="signed-article">
            <div>
              <p>Signed</p>
              <span className="parameters-value">
                {signersCount}/{numCouncilMembers}
              </span>
            </div>
          </article>
        </div>

        <div className="parameters">
          <article>
            <div>
              <p>Target Contract</p>
              <span className="parameters-value">
                <TzAddress tzAddress={targetContractAddress} hasIcon={false} />
              </span>
            </div>
          </article>

          <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
        </div>
      </BreakGlassCouncilPendingStyled>
    )
  }

  if (isSignAction) {
    const breakGlassActionId = findActionByName('breakGlassActionId')
    return (
      <BreakGlassCouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className='number'>{index}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <div>
            <p>Break Glass Action ID</p>
            <span className="parameters-value">
              <TzAddress tzAddress={breakGlassActionId} hasIcon={false} />
            </span>
          </div>
          <div>
            <p>Signed</p>
            <span className="parameters-value">
              {signersCount}/{numCouncilMembers}
            </span>
          </div>
        </div>
        <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
      </BreakGlassCouncilPendingStyled>
    )
  }

  return (
    <BreakGlassCouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
      <span className='number'>{index}</span>
      <h3>{getSeparateCamelCase(actionType)}</h3>
      <div className="parameters">
        <div>
          <p>Signed</p>
          <span className="parameters-value">
            {signersCount}/{numCouncilMembers}
          </span>
        </div>
      </div>
      <Button text="Sign" className="sign-btn" kind={ACTION_PRIMARY} icon="sign" onClick={handleSign} />
    </BreakGlassCouncilPendingStyled>
  )
}
