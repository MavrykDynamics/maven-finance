import { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { createPortal } from 'react-dom'
import { ModalCard, ModalCardContent, ModalClose, ModalMask, ModalStyled } from 'styles'

// components
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// helpers
import { getSeparateCamelCase } from '../../../utils/parse'
import { calcWithoutPrecision } from '../../../utils/calcFunctions'

// actions
import { sign } from '../Council.actions'

// style
import { CouncilPendingStyled } from './CouncilPending.style'
import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'

// types
import { CouncilActions } from '../../../utils/TypesAndInterfaces/Council'

type Props = CouncilActions[0] & {
  numCouncilMembers: number,
  councilPendingActionsLength: number,
  index: number,
}

export const CouncilPendingView = (props: Props) => {
  const dispatch = useDispatch()
  const [showing, setShowing] = useState(false)
  const {
    executionDatetime,
    actionType,
    signersCount,
    numCouncilMembers,
    initiatorId,
    id,
    councilPendingActionsLength,
    parameters,
    index,
  } = props

  const handleSign = () => {
    if (id) {
      dispatch(sign(id))
    }
  }

  const findActionByName = useCallback(
    (name: string) => parameters.find((item) => item.name === name)?.value || '',
    [parameters],
  )

  const isAddVestee = actionType === 'addVestee'
  const isRequestTokens = actionType === 'requestTokens'
  const isAddCouncilMember = actionType === 'addCouncilMember'
  const isUpdateVestee = actionType === 'updateVestee'
  const isChangeCouncilMember = actionType === 'changeCouncilMember'
  const isTransfer = actionType === 'transfer'
  const isRequestMint = actionType === 'requestMint'
  const isDropFinancialRequest = actionType === 'dropFinancialRequest'
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
          <div>{purpose}</div>
        </ModalCardContent>
      </ModalCard>
    </ModalStyled>
  )

  // 2/3
  if (isAddVestee) {
    const cliffInMonths = findActionByName('cliffInMonths')
    const vestingInMonths = findActionByName('vestingInMonths')
    const totalAllocatedAmount = findActionByName('totalAllocatedAmount')
    const calculateTokenAmount = calcWithoutPrecision(totalAllocatedAmount)
    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className='number'>{index}</span>
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
  if (isAddCouncilMember) {
    const councilMemberName = findActionByName('councilMemberName')
    const councilMemberWebsite = findActionByName('councilMemberWebsite')
    const councilMemberImage = findActionByName('councilMemberImage')
    return (
      <>
        <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
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
            {councilMemberWebsite ? (
              <article>
                <p>Council Member Website</p>
                <a className="parameters-btn" href={councilMemberWebsite} target="_blank" rel="noreferrer">
                  Visit Website
                </a>
              </article>
            ) : null}

            {councilMemberImage ? (
              <article className="parameters-img">
                <AvatarStyle>
                  <img src={councilMemberImage} />
                </AvatarStyle>
              </article>
            ) : null}

            {purpose ? (
              <article>
                <p>Purpose for Request</p>
                <button className="parameters-btn" onClick={() => setShowing(true)}>
                  Read Request
                </button>
              </article>
            ) : null}

            <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
          </div>
        </CouncilPendingStyled>
        {showing ? createPortal(modal, document?.body) : null}
      </>
    )
  }

  // 2/3
  if (isUpdateVestee) {
    const newCliffInMonths = findActionByName('newCliffInMonths')
    const newVestingInMonths = findActionByName('newVestingInMonths')
    const newTotalAllocatedAmount = findActionByName('newTotalAllocatedAmount')
    const calculateTokenAmount = calcWithoutPrecision(newTotalAllocatedAmount)
    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className='number'>{index}</span>
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

    const calculateTokenAmount = calcWithoutPrecision(tokenAmount)
    return (
      <>
        <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className='number'>{index}</span>
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

            {purpose ? (
              <article>
                <p>Purpose for Request</p>
                <button className="parameters-btn" onClick={() => setShowing(true)}>
                  Read Request
                </button>
              </article>
            ) : null}

            <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
          </div>
        </CouncilPendingStyled>
        {showing ? createPortal(modal, document?.body) : null}
      </>
    )
  }

  // 3/3
  if (isChangeCouncilMember) {
    const newCouncilMemberAddress = findActionByName('newCouncilMemberAddress')
    const oldCouncilMemberAddress = findActionByName('oldCouncilMemberAddress')
    const newCouncilMemberName = findActionByName('newCouncilMemberName')
    const newCouncilMemberWebsite = findActionByName('newCouncilMemberWebsite')
    const newCouncilMemberImage = findActionByName('newCouncilMemberImage')

    return (
      <>
        <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className='number'>{index}</span>
          <h3>{getSeparateCamelCase(actionType)}</h3>
          <div className="parameters grid">
            <article>
              <p>New Counci lMember Address</p>
              <span className="parameters-value">
                <TzAddress tzAddress={newCouncilMemberAddress} hasIcon={false} />
              </span>
            </article>
            <article>
              <p>Old Counci lMember Address</p>
              <span className="parameters-value">
                <TzAddress tzAddress={oldCouncilMemberAddress} hasIcon={false} />
              </span>
            </article>

            <article>
              <p>New Counci lMember Name</p>
              <span className="parameters-value">{newCouncilMemberName}</span>
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
            {newCouncilMemberWebsite ? (
              <article>
                <p>New Counci lMember Website</p>
                <a className="parameters-btn" href={newCouncilMemberWebsite} target="_blank" rel="noreferrer">
                  Visit Website
                </a>
              </article>
            ) : null}

            {newCouncilMemberImage ? (
              <article className="parameters-img">
                <AvatarStyle>
                  <img src={newCouncilMemberImage} />
                </AvatarStyle>
              </article>
            ) : null}

            <article />

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

    const calculateTokenAmount = calcWithoutPrecision(tokenAmount)
    return (
      <>
        <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className='number'>{index}</span>
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

            {purpose ? (
              <article>
                <p>Purpose for Request</p>
                <button className="parameters-btn" onClick={() => setShowing(true)}>
                  Read Request
                </button>
              </article>
            ) : null}

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
        <span className='number'>{index}</span>
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
          {purpose ? (
            <article>
              <p>Purpose for Request</p>
              <button className="parameters-btn" onClick={() => setShowing(true)}>
                Read Request
              </button>
            </article>
          ) : null}

          <article />

          <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
        </div>
        {showing ? createPortal(modal, document?.body) : null}
      </CouncilPendingStyled>
    )
  }

  // 1/3
  if (isDropFinancialRequest) {
    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className='number'>{index}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <div>
            <p>Request ID</p>
            <span className="parameters-value">{findActionByName('requestId')}</span>
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
      <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
    </CouncilPendingStyled>
  )
}
