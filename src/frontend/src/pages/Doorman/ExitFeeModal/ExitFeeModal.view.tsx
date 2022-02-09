import { Button } from 'app/App.components/Button/Button.controller'
import * as PropTypes from 'prop-types'
import { ModalCard, ModalCardContent, ModalClose, ModalMask, ModalStyled } from 'styles'

import { ExitFeeModalButtons, ExitFeeModalContent, ExitFeeModalFee, ExitFeeModalGrid } from './ExitFeeModal.style'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'

type ExitFeeModalViewProps = {
  loading: boolean
  showing: boolean
  unstakeCallback: (amount: number) => void
  cancelCallback: () => void
  mvkTotalSupply?: number
  totalStakedMvkSupply?: number
  amount: number
}

export const ExitFeeModalView = ({
  loading,
  showing,
  unstakeCallback,
  cancelCallback,
  mvkTotalSupply,
  totalStakedMvkSupply,
  amount,
}: ExitFeeModalViewProps) => {
  const mvkTokens = mvkTotalSupply ?? 0
  const stakedMvkTokens = totalStakedMvkSupply ?? 0
  const mli = calcMLI(mvkTotalSupply, totalStakedMvkSupply)
  const fee = calcExitFee(mvkTotalSupply, totalStakedMvkSupply)
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
                  <div>Total Staked MVK Supply</div>
                  <CommaNumber value={mvkTokens} endingText={'MVK'} />
                  <CommaNumber value={stakedMvkTokens} endingText={'MVK'} />
                  <div>Amount to Unstake</div>
                  <div>
                    MVK Loyalty Index{' '}
                    <a
                      href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
                      target="_blank"
                      rel="noreferrer"
                    >
                      [?]
                    </a>
                  </div>
                  <CommaNumber value={Number(amount)} endingText={'MVK'} />
                  <div>
                    <p>{mli.toFixed(2)} </p>
                  </div>
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
