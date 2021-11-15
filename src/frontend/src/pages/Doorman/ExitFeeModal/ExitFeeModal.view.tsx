import { Button } from 'app/App.components/Button/Button.controller'
import * as PropTypes from 'prop-types'
import { ModalCard, ModalCardContent, ModalClose, ModalMask, ModalStyled } from 'styles'

import { ExitFeeModalButtons, ExitFeeModalContent } from './ExitFeeModal.style'

type ExitFeeModalViewProps = {
  loading: boolean
  showing: boolean
  unStakeCallback: (amount: number) => void
  cancelCallback: () => void
  mvkTotalSupply?: number
  vMvkTotalSupply?: number
  amount: number
}

export const ExitFeeModalView = ({
  loading,
  showing,
  unStakeCallback,
  cancelCallback,
  mvkTotalSupply,
  vMvkTotalSupply,
  amount,
}: ExitFeeModalViewProps) => {
  const mli =
    ((vMvkTotalSupply ?? 0) / 1000000 / ((mvkTotalSupply ?? 0) / 1000000 + (vMvkTotalSupply ?? 1) / 1000000)) * 100

  return (
    <ModalStyled showing={showing}>
      {showing && (
        <>
          <ModalMask showing={showing} onClick={() => cancelCallback()} />
          <ModalCard>
            <ModalClose onClick={() => cancelCallback()}>
              <svg>
                <use xlinkHref="/icons/sprites.svg#error" />
              </svg>
            </ModalClose>
            <ModalCardContent width={50}>
              <ExitFeeModalContent>
                <h1>Exit Fee</h1>

                <div>{`MVK Total Supply : ${(mvkTotalSupply ?? 0) / 1000000} MVK`}</div>
                <div>{`vMVK Total Supply : ${(vMvkTotalSupply ?? 0) / 1000000} vMVK`}</div>
                <div>{`Amount unstaking : ${amount} vMVK to MVK`}</div>
                <div>{`MLI : ${mli}%`}</div>
                <div>{`Exit Fee : ${500 / mli + 5}%`}</div>
                <br />
                <br />

                <ExitFeeModalButtons>
                  <Button
                    text="Cancel"
                    kind="secondary"
                    icon="error"
                    loading={loading}
                    onClick={() => cancelCallback()}
                  />
                  <Button text="Proceed" icon="success" loading={loading} onClick={() => unStakeCallback(1)} />
                </ExitFeeModalButtons>
              </ExitFeeModalContent>
            </ModalCardContent>
          </ModalCard>
        </>
      )}
    </ModalStyled>
  )
}

ExitFeeModalView.propTypes = {
  loading: PropTypes.bool,
  showing: PropTypes.bool.isRequired,
  cancelCallback: PropTypes.func.isRequired,
  unStakeCallback: PropTypes.func.isRequired,
}

ExitFeeModalView.defaultProps = {
  loading: false,
}
