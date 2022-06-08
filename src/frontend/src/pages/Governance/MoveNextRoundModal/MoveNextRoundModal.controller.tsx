import * as React from 'react'

// view
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// style
import { ModalCard, ModalCardContent, ModalStyled, ModalMask, ModalClose } from 'styles'
import { MoveNextRoundModalstyle } from './MoveNextRoundModal.style'

export const MoveNextRoundModal = ({
  handleMoveNextRound,
  handleExecuteProposal,
  handleCloseModal,
}: {
  handleMoveNextRound: any
  handleExecuteProposal: any
  handleCloseModal: any
}) => {
  return (
    <MoveNextRoundModalstyle>
      <ModalStyled showing={true}>
        <ModalMask showing={true} onClick={handleCloseModal} />
        <ModalCard>
          <ModalClose onClick={handleCloseModal}>
            <Icon id="error" />
          </ModalClose>
          <ModalCardContent style={{ width: '586px' }}>
            <h1>Move to the next round</h1>
            <p>Do you want to Execute Proposal or move to the next round without execution?</p>
            <div className="btn-group">
              <Button text="Move to the next round" kind="actionSecondary" onClick={handleMoveNextRound} />
              <Button text="Execute Proposal" kind="actionPrimary" onClick={handleExecuteProposal} />
            </div>
          </ModalCardContent>
        </ModalCard>
      </ModalStyled>
    </MoveNextRoundModalstyle>
  )
}
