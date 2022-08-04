import * as PropTypes from 'prop-types'
import * as React from 'react'
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

export const ModalView = ({ kind, loading, showing, cancelCallback }: ModalViewProps) => {
  console.log('%c ||||| showing', 'color:yellowgreen', showing)
  return (
    <ModalStyled showing={showing}>
      {showing && (
        <>
          {' '}
          <ModalMask showing={showing} onClick={() => cancelCallback()} />
          {kind === REQUIRES_ACKNOWLEDGEMENT && (
            <EmergencyGovernanceActiveModal loading={loading} cancelCallback={cancelCallback} />
          )}
          {kind === FARM_DEPOSIT && <FarmDepositModal loading={loading} cancelCallback={cancelCallback} />}
          {kind === FARM_WITHDRAW && <FarmWithdrawModal loading={loading} cancelCallback={cancelCallback} />}
        </>
      )}
    </ModalStyled>
  )
}

ModalView.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  kind: PropTypes.string,
  loading: PropTypes.bool,
}

ModalView.defaultProps = {
  title: 'Dashboard',
  subTitle: '',
  content: '',
  kind: PRIMARY,
  loading: false,
}
