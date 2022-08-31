import { useDispatch, useSelector } from 'react-redux'
import { ModalView } from './Modal.view'
import { State } from '../../../reducers'
import { hideModal } from './Modal.actions'

export const Modal = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { kind } = useSelector((state: State) => state.modal)
  const { showing } = useSelector((state: State) => state.modal)

  const cancelCallback = () => {
    dispatch(hideModal())
  }

  return <ModalView kind={kind} loading={loading} cancelCallback={cancelCallback} showing={showing} />
}
