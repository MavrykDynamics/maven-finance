import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { Button } from '../../../app/App.components/Button/Button.controller'
import { MoveNextRoundModal } from './MoveNextRoundModal.controller'

// actions
import { startNextRound } from '../Governance.actions'

export default function MoveToNextRound() {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { governanceStorage, governancePhase } = useSelector((state: State) => state.governance)

  const [visibleModal, setVisibleModal] = useState(false)
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  const handleCloseModal = () => {
    setVisibleModal(false)
  }
  const handleStartNextRound = async (variant: boolean) => {
    await dispatch(startNextRound(variant))
    handleCloseModal()
  }

  const handleMoveNextRound = () => {
    if (isTimeLockRound && governanceStorage.timelockProposalId > 0) {
      setVisibleModal(true)
    } else {
      handleStartNextRound(false)
    }
  }

  return (
    <>
      <Button
        icon="man-running"
        text={'Move to next round'}
        kind="actionSecondary"
        className="move-to-next"
        disabled={!accountPkh}
        onClick={handleMoveNextRound}
      />
      {visibleModal ? (
        <MoveNextRoundModal
          handleCloseModal={handleCloseModal}
          handleExecuteProposal={() => handleStartNextRound(true)}
          handleMoveNextRound={() => handleStartNextRound(false)}
        />
      ) : null}
    </>
  )
}
