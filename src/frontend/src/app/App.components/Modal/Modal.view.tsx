import { FARM_DEPOSIT, FARM_WITHDRAW, ModalKind, PRIMARY, REQUIRES_ACKNOWLEDGEMENT } from './Modal.constants'
import { ModalMask, ModalStyled } from 'styles'
import { FarmDepositModal } from './FarmDepositModal/FarmDepositModal.controller'
import { EmergencyGovernanceActiveModal } from './EmergencyGovernanceActiveModal/EmergencyGovernanceActive.controller'
import { FarmWithdrawModal } from './FarmWithdrawModal/FarmWithdrawModal.controller'

type ModalViewProps = {
  kind?: ModalKind
  loading: boolean
  showing: boolean
  cancelCallback: () => void
}

export const ModalView = ({ kind = PRIMARY, loading, showing, cancelCallback }: ModalViewProps) => {
  return (
    <ModalStyled showing={showing}>
      {showing && (
        <>
          <ModalMask showing={showing} onClick={() => cancelCallback()} />
          {kind === REQUIRES_ACKNOWLEDGEMENT && (
            <EmergencyGovernanceActiveModal loading={loading} cancelCallback={cancelCallback} />
          )}
          {kind === FARM_DEPOSIT && <FarmDepositModal />}
          {kind === FARM_WITHDRAW && <FarmWithdrawModal />}
        </>
      )}
    </ModalStyled>
  )
}
