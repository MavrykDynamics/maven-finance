import { useState, useCallback, useRef, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { createPortal } from 'react-dom'
import { ModalCard, ModalCardContent, ModalClose, ModalMask, ModalStyled } from 'styles'

// components
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// helpers
import { getSeparateCamelCase } from '../../../utils/parse'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// types
import { BreakGlassActions } from 'utils/TypesAndInterfaces/BreakGlass'
import { CouncilActions } from "utils/TypesAndInterfaces/Council";

// actions
import { signAction } from '../../BreakGlassCouncil/BreakGlassCouncil.actions'

// styles
import { CouncilPendingStyled } from './CouncilPending.style'
import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'

type Props = (BreakGlassActions[0] | CouncilActions[0]) & {
  numCouncilMembers: number
  councilPendingActionsLength: number
  index: number
}

export const CouncilPending = (props: Props) => {
  const { id, actionType, signersCount, numCouncilMembers, councilPendingActionsLength, parameters, index } = props
  const dispatch = useDispatch()

  const [showing, setShowing] = useState(false)
  const { name, value } = parameters?.[0]
  const cardNumber = index + 1

  const ref = useRef<HTMLDivElement | null>(null)
  const showScrollInModal = useMemo(() => ref.current?.offsetHeight !== ref.current?.scrollHeight, [
    ref.current?.offsetHeight,
    ref.current?.scrollWidth
  ])

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
  const isAddVestee = actionType === 'addVestee'
  const isRequestTokens = actionType === 'requestTokens'
  const isUpdateVestee = actionType === 'updateVestee'
  const isTransfer = actionType === 'transfer'
  const isRequestMint = actionType === 'requestMint'
  const isToggleVesteeLock = actionType === 'toggleVesteeLock'
  const isRemoveVestee = actionType === 'removeVestee'
  const purpose = findActionByName('purpose')

  const modal = (
    <ModalStyled showing={true}>
      <ModalMask
        showing={true}
        onClick={() => {
          setShowing(false)
        }}
      />
      <ModalCard>
        <ModalClose
          onClick={() => {
            setShowing(false)
          }}
        >
          <Icon id="error" />
        </ModalClose>
        <ModalCardContent style={{ width: 586 }}>
          <h1>Purpose for Request</h1>
          <div ref={ref} className='text-box'>{purpose}</div>
          <div style={{ display: showScrollInModal ? 'block' : 'none' }} className='shadow-box'></div>
        </ModalCardContent>
      </ModalCard>
    </ModalStyled>
  )

    // 2/3
    if (isAddCouncilMember) {
      const councilMemberName = findActionByName('councilMemberName')
      const councilMemberWebsite = findActionByName('councilMemberWebsite')
      const councilMemberImage = findActionByName('councilMemberImage')
      return (
        <>
          <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
            <span className='number'>{cardNumber}</span>
            <h3>{getSeparateCamelCase(actionType)}</h3>
            <div className="parameters">
              <article>
                <p className="without-margin">Council Member Address</p>
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
                {councilMemberImage ? (
                  <article className="parameters-img">
                    <AvatarStyle>
                      <img src={councilMemberImage} />
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
                {councilMemberWebsite ? (
                  <a className="parameters-link" href={councilMemberWebsite} target="_blank" rel="noreferrer">
                    {councilMemberWebsite}
                  </a>
                ) : (
                  <span className="parameters-value">-</span>
                )}
              </article>
  
              <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
            </div>
          </CouncilPendingStyled>
          {showing ? createPortal(modal, document?.body) : null}
        </>
      )
    }

  // 2/3
  if (isUpdateChangeCouncilMember) {
    const newCouncilMemberAddress = findActionByName('newCouncilMemberAddress')
    const newCouncilMemberName = findActionByName('newCouncilMemberName')
    const newCouncilMemberWebsite = findActionByName('newCouncilMemberWebsite')
    const newCouncilMemberImage = findActionByName('newCouncilMemberImage')
    return (
      <>
        <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className='number'>{cardNumber}</span>
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
        </CouncilPendingStyled>
      </>
    )
  }

  // 3/3
  if (isChangeCouncilMember) {
    const oldCouncilMemberAddress = findActionByName('oldCouncilMemberAddress')
    const newCouncilMemberAddress = findActionByName('newCouncilMemberAddress')
    const newCouncilMemberName = findActionByName('newCouncilMemberName')
    const newCouncilMemberWebsite = findActionByName('newCouncilMemberWebsite')
    const newCouncilMemberImage = findActionByName('newCouncilMemberImage')
    return (
      <>
        <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className='number'>{cardNumber}</span>
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
        </CouncilPendingStyled>
      </>
    )
  }

  // 2/3
  if (isSetSingleContractAdmin) {
    const newAdminAddress = findActionByName('newAdminAddress')
    const targetContractAddress = findActionByName('targetContractAddress')
    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className='number'>{cardNumber}</span>
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
      </CouncilPendingStyled>
    )
  }

   // 2/3
   if (isAddVestee) {
    const cliffInMonths = findActionByName('cliffInMonths')
    const vestingInMonths = findActionByName('vestingInMonths')
    const totalAllocatedAmount = findActionByName('totalAllocatedAmount')

    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className='number'>{cardNumber}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <article>
            <p>Vestee Address</p>
            <span className="parameters-value">
              <TzAddress tzAddress={findActionByName('vesteeAddress')} hasIcon={false} />
            </span>
          </article>

          <article>
            <p>Total Allocated Amount</p>
            <span className="parameters-value">
              <CommaNumber value={+totalAllocatedAmount} loading={false} endingText={'MVK'} />
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
            <p>Cliff In Months</p>
            <span className="parameters-value">{cliffInMonths} months</span>
          </article>

          <article>
            <p>Vesting In Months</p>
            <span className="parameters-value">{vestingInMonths} months</span>
          </article>

          <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
        </div>
      </CouncilPendingStyled>
    )
  }

  // 2/3
  if (isUpdateVestee) {
    const newCliffInMonths = findActionByName('newCliffInMonths')
    const newVestingInMonths = findActionByName('newVestingInMonths')
    const newTotalAllocatedAmount = findActionByName('newTotalAllocatedAmount')

    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className='number'>{cardNumber}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <article>
            <p>Vestee Address</p>
            <span className="parameters-value">
              <TzAddress tzAddress={findActionByName('vesteeAddress')} hasIcon={false} />
            </span>
          </article>

          <article>
            <p>New Total Allocated Amount</p>
            <span className="parameters-value">
              <CommaNumber value={+newTotalAllocatedAmount} loading={false} endingText={'MVK'} />
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
            <p>New Cliff In Months</p>
            <span className="parameters-value">{newCliffInMonths} months</span>
          </article>

          <article>
            <p>New Vesting In Months</p>
            <span className="parameters-value">{newVestingInMonths} months</span>
          </article>

          <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
        </div>
      </CouncilPendingStyled>
    )
  }

  // 3/3
  if (isRequestTokens) {
    const treasuryAddress = findActionByName('treasuryAddress')
    const tokenAmount = findActionByName('tokenAmount')
    const tokenContractAddress = findActionByName('tokenContractAddress')
    const tokenType = findActionByName('tokenType')
    const tokenId = findActionByName('tokenId')

    return (
      <>
        <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className='number'>{cardNumber}</span>
          <h3>{getSeparateCamelCase(actionType)}</h3>
          <div className="parameters grid">
            <article>
              <p>Treasury Address</p>
              <span className="parameters-value">
                <TzAddress tzAddress={treasuryAddress} hasIcon={false} />
              </span>
            </article>
            <article>
              <p>Token Contract Address</p>
              <span className="parameters-value">
                <TzAddress tzAddress={tokenContractAddress} hasIcon={false} />
              </span>
            </article>

            <article>
              <p>Token Amount</p>
              <span className="parameters-value">
                <CommaNumber value={+tokenAmount} loading={false} endingText={'MVK'} />
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

          <div className="parameters grid">
            <article>
              <p>Token Type</p>
              <span className="parameters-value">{tokenType}</span>
            </article>

            <article>
              <p>Token ID</p>
              <span className="parameters-value">{tokenId}</span>
            </article>

            {purpose && (
              <article>
                <p>Purpose for Request</p>
                <button className="parameters-link" onClick={() => setShowing(true)}>
                  Read Request
                </button>
              </article>
            )}

            <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
          </div>
        </CouncilPendingStyled>
        {showing ? createPortal(modal, document?.body) : null}
      </>
    )
  }

  // 3/3
  if (isTransfer) {
    const receiverAddress = findActionByName('receiverAddress')
    const tokenContractAddress = findActionByName('tokenContractAddress')
    const tokenAmount = findActionByName('tokenAmount')
    const tokenType = findActionByName('tokenType')
    const tokenId = findActionByName('tokenId')

    return (
      <>
        <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className='number'>{cardNumber}</span>
          <h3>{getSeparateCamelCase(actionType)}</h3>
          <div className="parameters grid">
            <article>
              <p>Receiver Address</p>
              <span className="parameters-value">
                <TzAddress tzAddress={receiverAddress} hasIcon={false} />
              </span>
            </article>
            <article>
              <p>Token Contract Address</p>
              <span className="parameters-value">
                <TzAddress tzAddress={tokenContractAddress} hasIcon={false} />
              </span>
            </article>

            <article>
              <p>Total Amount</p>
              <span className="parameters-value">
                <CommaNumber value={+tokenAmount} loading={false} endingText={'MVK'} />
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

          <div className="parameters grid">
            <article>
              <p>Token Type</p>
              <span className="parameters-value">{tokenType}</span>
            </article>

            <article>
              <p>Token ID</p>
              <span className="parameters-value">{tokenId}</span>
            </article>

            {purpose && (
              <article>
                <p>Purpose for Request</p>
                <button className="parameters-link" onClick={() => setShowing(true)}>
                  Read Request
                </button>
              </article>
            )}

            <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
          </div>
        </CouncilPendingStyled>
        {showing ? createPortal(modal, document?.body) : null}
      </>
    )
  }

  // 2/3
  if (isRequestMint) {
    const tokenAmount = findActionByName('tokenAmount')

    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className='number'>{cardNumber}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <article>
            <p>Treasury Address</p>
            <span className="parameters-value">
              <TzAddress tzAddress={findActionByName('treasuryAddress')} hasIcon={false} />
            </span>
          </article>

          <article>
            <p>Token Amount</p>
            <span className="parameters-value">
              <CommaNumber value={+tokenAmount} loading={false} endingText={'MVK'} />
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
          {purpose && (
            <article>
              <p>Purpose for Request</p>
              <button className="parameters-link" onClick={() => setShowing(true)}>
                Read Request
              </button>
            </article>
          )}

          <article />

          <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
        </div>
        {showing ? createPortal(modal, document?.body) : null}
      </CouncilPendingStyled>
    )
  }

  // 1/3 
  // for general card with only address field
  if (isRemoveVestee || isToggleVesteeLock || isRemoveCouncilMember || isSignAction || isSetAllContractsAdmin) {
    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className='number'>{cardNumber}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
          <div className="parameters">
            <div>
              <p className='parameters-name'>{getSeparateCamelCase(name)}</p>
              <span className="parameters-value">
                <TzAddress tzAddress={value} hasIcon={false} />
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
      </CouncilPendingStyled>
    )
  }

  return (
    <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
      <span className='number'>{cardNumber}</span>
      <h3>{getSeparateCamelCase(actionType)}</h3>
      <div className="parameters">
        <div>
          <p className='parameters-name no-wrap'>{getSeparateCamelCase(name)}</p>
          <span className="parameters-value">
            {value}
          </span>
        </div>
        <div>
          <p>Signed</p>
          <span className="parameters-value">
            {signersCount}/{numCouncilMembers}
          </span>
        </div>
      </div>
      <Button text="Sign" className="sign-btn" kind={ACTION_PRIMARY} icon="sign" onClick={handleSign} />
    </CouncilPendingStyled>
  )
}
