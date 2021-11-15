import { Button } from 'app/App.components/Button/Button.controller'
import * as PropTypes from 'prop-types'
import { ModalCard, ModalCardContent, ModalClose, ModalMask, ModalStyled } from 'styles'

import { ExitFeeModalButtons, ExitFeeModalContent, ExitFeeModalFee, ExitFeeModalGrid } from './ExitFeeModal.style'

type ExitFeeModalViewProps = {
  loading: boolean
  showing: boolean
  unstakeCallback: (amount: number) => void
  cancelCallback: () => void
  mvkTotalSupply?: number
  vMvkTotalSupply?: number
  amount: number
}

export const ExitFeeModalView = ({
  loading,
  showing,
  unstakeCallback,
  cancelCallback,
  mvkTotalSupply,
  vMvkTotalSupply,
  amount,
}: ExitFeeModalViewProps) => {
  const mvkTokens = (mvkTotalSupply ?? 0) / 1000000
  const vMvkTokens = (vMvkTotalSupply ?? 0) / 1000000
  const mli = (vMvkTokens / ((mvkTokens + vMvkTokens) | 1)) * 100
  const fee = 500 / mli + 5

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

                <ExitFeeModalGrid>
                  <div>MVK Total Supply</div>
                  <div>vMVK Total Supply</div>
                  <p>{mvkTokens.toFixed(2)} MVK</p>
                  <p>{vMvkTokens.toFixed(2)} vMVK</p>
                  <div>Amount Unstaking</div>
                  <div>
                    MLI{' '}
                    <a
                      href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
                      target="_blank"
                      rel="noreferrer"
                    >
                      [?]
                    </a>
                  </div>
                  <p>{amount} MVK</p>
                  <p>{mli.toFixed(2)} %</p>
                </ExitFeeModalGrid>

                <ExitFeeModalFee>
                  <div>
                    Exit Fee{' '}
                    <a
                      href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
                      target="_blank"
                      rel="noreferrer"
                    >
                      [?]
                    </a>
                  </div>
                  <p>{fee.toFixed(2)} %</p>
                </ExitFeeModalFee>

                <ExitFeeModalButtons>
                  <Button
                    text="Cancel"
                    kind="secondary"
                    icon="error"
                    loading={loading}
                    onClick={() => cancelCallback()}
                  />
                  <Button text="Proceed" icon="success" loading={loading} onClick={() => unstakeCallback(amount)} />
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
  unstakeCallback: PropTypes.func.isRequired,
}

ExitFeeModalView.defaultProps = {
  loading: false,
}
