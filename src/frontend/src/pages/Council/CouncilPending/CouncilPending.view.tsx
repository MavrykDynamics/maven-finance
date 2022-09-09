import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createPortal } from 'react-dom'
import { ModalCard, ModalCardContent, ModalClose, ModalMask, ModalStyled } from 'styles'

// components
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// helpers
import { getSeparateCamelCase } from '../../../utils/parse'
import { calcWithoutPrecision, calcWithoutMu } from '../../../utils/calcFunctions'

// actions
import { sign } from '../Council.actions'

// style
import { CouncilPendingStyled } from './CouncilPending.style'
import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'

type Props = {
  execution_datetime: string
  action_type: string
  initiator_id: string
  signers_count: number
  num_council_members: number
  id: number
  councilPendingActionsLength: number
  council_action_record_parameters: Record<string, string>[]
}

export const CouncilPendingView = (props: Props) => {
  const dispatch = useDispatch()
  const [showing, setShowing] = useState(false)
  const {
    execution_datetime,
    action_type,
    signers_count,
    num_council_members,
    initiator_id,
    id,
    councilPendingActionsLength,
    council_action_record_parameters,
  } = props

  const handleSign = () => {
    if (id) {
      dispatch(sign(id))
    }
  }

  const findActionByName = useCallback(
    (name: string) => council_action_record_parameters.find((item) => item.name === name)?.value || '',
    [council_action_record_parameters],
  )

  const isAddVestee = action_type === 'addVestee'
  const isRequestTokens = action_type === 'requestTokens'
  const isAddCouncilMember = action_type === 'addCouncilMember'
  const isUpdateVestee = action_type === 'updateVestee'
  const isChangeCouncilMember = action_type === 'changeCouncilMember'
  const isTransfer = action_type === 'transfer'
  const isRequestMint = action_type === 'requestMint'
  const isDropFinancialRequest = action_type === 'dropFinancialRequest'
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
      <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <h3>{getSeparateCamelCase(action_type)}</h3>
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
                {signers_count}/{num_council_members}
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
        <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <h3>{getSeparateCamelCase(action_type)}</h3>
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
                  {signers_count}/{num_council_members}
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
      <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <h3>{getSeparateCamelCase(action_type)}</h3>
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
                {signers_count}/{num_council_members}
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
        <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <h3>{getSeparateCamelCase(action_type)}</h3>
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
                  {signers_count}/{num_council_members}
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
        <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <h3>{getSeparateCamelCase(action_type)}</h3>
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
                  {signers_count}/{num_council_members}
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
        <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <h3>{getSeparateCamelCase(action_type)}</h3>
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
                  {signers_count}/{num_council_members}
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
      <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <h3>{getSeparateCamelCase(action_type)}</h3>
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
                {signers_count}/{num_council_members}
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
      <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <h3>{getSeparateCamelCase(action_type)}</h3>
        <div className="parameters">
          <div>
            <p>Request ID</p>
            <span className="parameters-value">{findActionByName('requestId')}</span>
          </div>
          <div>
            <p>Signed</p>
            <span className="parameters-value">
              {signers_count}/{num_council_members}
            </span>
          </div>
        </div>
        <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
      </CouncilPendingStyled>
    )
  }

  return (
    <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
      <h3>{getSeparateCamelCase(action_type)}</h3>
      <div className="parameters">
        <div>
          <p>Signed</p>
          <span className="parameters-value">
            {signers_count}/{num_council_members}
          </span>
        </div>
      </div>
      <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
    </CouncilPendingStyled>
  )
}
