import { Button } from 'app/App.components/Button/Button.controller'
import * as PropTypes from 'prop-types'
import { ModalCard, ModalCardContent, ModalClose, ModalMask, ModalStyled } from 'styles'

import { ExitFeeModalButtons, ExitFeeModalContent } from './ExitFeeModal.style'

type ExitFeeModalViewProps = {
  loading: boolean
  showing: boolean
  hideExitFeeModalCallback: () => void
  stakeCallback: ({ amount }: { amount: number }) => void
}

export const ExitFeeModalView = ({
  loading,
  showing,
  hideExitFeeModalCallback,
  stakeCallback,
}: ExitFeeModalViewProps) => {
  return (
    <ModalStyled showing={showing}>
      {showing && (
        <>
          <ModalMask showing={showing} onClick={() => hideExitFeeModalCallback()} />
          <ModalCard>
            <ModalClose onClick={() => hideExitFeeModalCallback()}>
              <svg>
                <use xlinkHref="/icons/sprites.svg#error" />
              </svg>
            </ModalClose>
            <ModalCardContent width={50}>
              <ExitFeeModalContent>
                <h1>Exit Fee</h1>

                <ExitFeeModalButtons>
                  <Button
                    text="Cancel"
                    kind="secondary"
                    icon="error"
                    loading={loading}
                    onClick={() => hideExitFeeModalCallback()}
                  />
                  <Button
                    text="Proceed"
                    icon="success"
                    loading={loading}
                    onClick={() => stakeCallback({ amount: 1 })}
                  />
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
  hideExitFeeModalCallback: PropTypes.func.isRequired,
  stakeCallback: PropTypes.func.isRequired,
}

ExitFeeModalView.defaultProps = {
  loading: false,
}
