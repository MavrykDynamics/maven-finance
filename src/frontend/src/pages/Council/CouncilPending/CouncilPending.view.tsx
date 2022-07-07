import { useState } from 'react'
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

  console.log('%c ||||| council_action_record_parameters', 'color:yellowgreen', council_action_record_parameters)

  const isAddVestee = action_type === 'addVestee'
  const vesteeAddress = council_action_record_parameters.find((item) => item.name === 'vesteeAddress')?.value || ''
  const cliffInMonths = council_action_record_parameters.find((item) => item.name === 'cliffInMonths')?.value || ''
  const vestingInMonths = council_action_record_parameters.find((item) => item.name === 'vestingInMonths')?.value || ''
  const totalAllocatedAmount =
    council_action_record_parameters.find((item) => item.name === 'totalAllocatedAmount')?.value || ''

  const isRequestTokens = action_type === 'requestTokens'
  const treasuryAddress = council_action_record_parameters.find((item) => item.name === 'treasuryAddress')?.value || ''
  const tokenAmount = council_action_record_parameters.find((item) => item.name === 'tokenAmount')?.value || ''
  const tokenContractAddress =
    council_action_record_parameters.find((item) => item.name === 'tokenContractAddress')?.value || ''
  const tokenType = council_action_record_parameters.find((item) => item.name === 'tokenType')?.value || ''
  const tokenId = council_action_record_parameters.find((item) => item.name === 'tokenId')?.value || ''
  const purpose = council_action_record_parameters.find((item) => item.name === 'purpose')?.value || ''

  const calculateTokenAmount = calcWithoutPrecision(tokenAmount)

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

  if (isRequestTokens) {
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
            {calculateTokenAmount ? (
              <article>
                <p>Total Amount</p>
                <span className="parameters-value">
                  <CommaNumber value={calculateTokenAmount} loading={false} endingText={'MVK'} />
                </span>
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

          <div className="parameters grid">
            {tokenType ? (
              <article>
                <p>Token Type</p>
                <span className="parameters-value">{tokenType}</span>
              </article>
            ) : null}
            {tokenId ? (
              <article>
                <p>Token ID</p>
                <span className="parameters-value">{tokenId}</span>
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
  if (isAddVestee) {
    return (
      <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <h3>{getSeparateCamelCase(action_type)}</h3>
        <div className="parameters">
          <article>
            <p>Adress</p>
            <span className="parameters-value">
              <TzAddress tzAddress={vesteeAddress} hasIcon={false} />
            </span>
          </article>
          {totalAllocatedAmount ? (
            <article>
              <p>Total Allocated Amount</p>
              <span className="parameters-value">
                <CommaNumber value={+totalAllocatedAmount} loading={false} endingText={'MVK'} />
              </span>
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
          {cliffInMonths ? (
            <article>
              <p>Cliff Period</p>
              <span className="parameters-value">{cliffInMonths} months</span>
            </article>
          ) : null}
          {vestingInMonths ? (
            <article>
              <p>Vesting Period</p>
              <span className="parameters-value">{vestingInMonths} months</span>
            </article>
          ) : null}

          <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
        </div>
      </CouncilPendingStyled>
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
