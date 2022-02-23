import * as PropTypes from 'prop-types'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ModalView } from './Modal.view'
import { ModalKind, PRIMARY } from './Modal.constants'
import { MODAL_DATA } from './Modal.data'
import { State } from '../../../reducers'
import { hideModal } from './Modal.actions'
type PageHeaderProps = {
  type: string
  kind?: ModalKind
  loading: boolean
}

export const Modal = ({ type, kind, loading }: PageHeaderProps) => {
  const dispatch = useDispatch()
  const modalContent = MODAL_DATA.get(type)
  const { title, subTitle, content } = modalContent
  const { showing } = useSelector((state: State) => state.modal)

  const cancelCallback = () => {
    dispatch(hideModal())
  }

  return (
    <ModalView
      title={title}
      subTitle={subTitle}
      content={content}
      kind={kind}
      loading={loading}
      cancelCallback={cancelCallback}
      showing={showing}
    />
  )
}

Modal.propTypes = {
  page: PropTypes.string.isRequired,
  kind: PropTypes.string,
  loading: PropTypes.bool,
}

Modal.defaultProps = {
  page: 'Dashboard',
  kind: PRIMARY,
  loading: false,
}
