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
  executed_datetime: string
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
    executed_datetime,
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
  const purpose = findActionByName('purpose')

  if (isUpdateVestee) {
    console.log('%c ||||| action_type', 'color:green', action_type)
    console.log('%c ||||| council_action_record_parameters', 'color:green', council_action_record_parameters)
  }

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
          <p>{purpose}</p>
        </ModalCardContent>
      </ModalCard>
    </ModalStyled>
  )

  // 2/3
  if (isAddVestee) {
    const cliffInMonths = findActionByName('cliffInMonths')
    const vestingInMonths = findActionByName('vestingInMonths')
    const totalAllocatedAmount = findActionByName('totalAllocatedAmount')
    return (
      <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <h3>{getSeparateCamelCase(action_type)}</h3>
        <div className="parameters">
          <article>
            <p>Adress</p>
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
            <p>Cliff Period</p>
            <span className="parameters-value">{cliffInMonths} months</span>
          </article>

          <article>
            <p>Vesting Period</p>
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
      <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <h3>{getSeparateCamelCase(action_type)}</h3>
        <div className="parameters">
          <article>
            <p>Adress</p>
            <span className="parameters-value">
              <TzAddress tzAddress={findActionByName('councilMemberAddress')} hasIcon={false} />
            </span>
          </article>
          {councilMemberName ? (
            <article>
              <p>Member Name</p>
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
              <p>Member Website</p>
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
      <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <h3>{getSeparateCamelCase(action_type)}</h3>
        <div className="parameters">
          <article>
            <p>Adress</p>
            <span className="parameters-value">
              <TzAddress tzAddress={findActionByName('vesteeAddress')} hasIcon={false} />
            </span>
          </article>

          <article>
            <p>New Total Amount</p>
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
            <p>New Cliff Period</p>
            <span className="parameters-value">{newCliffInMonths} months</span>
          </article>

          <article>
            <p>New Vesting Period</p>
            <span className="parameters-value">{newVestingInMonths} months</span>
          </article>

          <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
        </div>
      </CouncilPendingStyled>
    )
  }

  // 3/3
  if (isRequestTokens) {
    const treasuryAddress =
      council_action_record_parameters.find((item) => item.name === 'treasuryAddress')?.value || ''
    const tokenAmount = council_action_record_parameters.find((item) => item.name === 'tokenAmount')?.value || ''
    const tokenContractAddress =
      council_action_record_parameters.find((item) => item.name === 'tokenContractAddress')?.value || ''
    const tokenType = council_action_record_parameters.find((item) => item.name === 'tokenType')?.value || ''
    const tokenId = council_action_record_parameters.find((item) => item.name === 'tokenId')?.value || ''

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
              <p>Total Amount</p>
              <span className="parameters-value">
                <CommaNumber value={calculateTokenAmount} loading={false} endingText={'MVK'} />
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

  return (
    <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
      <h3>{getSeparateCamelCase(action_type)}</h3>
      <div className="parameters">
        <div>
          <p>Adress</p>
          <span className="parameters-value">
            <TzAddress tzAddress={initiator_id} hasIcon={false} />
          </span>
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
