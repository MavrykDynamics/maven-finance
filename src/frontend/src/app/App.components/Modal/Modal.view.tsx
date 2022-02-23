import * as PropTypes from 'prop-types'
import * as React from 'react'
import { ModalKind, PRIMARY } from './Modal.constants'
import { PageHeaderStyled, PageHeaderTextArea } from './Modal.style'
import { ModalCard, ModalCardContent, ModalClose, ModalMask, ModalStyled } from 'styles'
import {
  ExitFeeModalButtons,
  ExitFeeModalContent,
  ExitFeeModalFee,
  ExitFeeModalGrid,
} from '../../../pages/Doorman/ExitFeeModal/ExitFeeModal.style'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { Button } from '../Button/Button.controller'
type ModalViewProps = {
  title: string
  subTitle: string
  content: string
  kind?: ModalKind
  loading: boolean
  showing: boolean
  cancelCallback: () => void
}

export const ModalView = ({ title, subTitle, content, kind, loading, showing, cancelCallback }: ModalViewProps) => {
  return (
    <ModalStyled showing={showing}>
      {showing && (
        <>
          {' '}
          <ModalMask showing={showing} onClick={() => cancelCallback()} />
          <ModalCard>
            <ModalCardContent width={50}>
              <h3>{title}</h3>
              <p>{subTitle}</p>
              <p>{content}</p>
              <Button text="Acknowledge" kind="primary" icon="check" loading={loading} onClick={cancelCallback} />
            </ModalCardContent>
          </ModalCard>
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
