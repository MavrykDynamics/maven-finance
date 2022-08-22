import { useCallback } from 'react'

import useLockedBody from 'utils/useScrollLocking'

import { PopupChangeNodeView } from './Popup-change-node.view'
import { CSSTransition } from 'react-transition-group'

import { PopupContainer, PopupStyled } from './Popup-change-node.style'

export const PopupChangeNode = ({ isModalOpened, closeModal }: { isModalOpened: boolean; closeModal: () => void }) => {
  const [_, setLocked] = useLockedBody(isModalOpened)

  const closeModalHanlder = useCallback(() => {
    closeModal()
    setLocked(false)
  }, [])

  return (
    <PopupStyled>
      <CSSTransition in={isModalOpened} timeout={200} classNames="popup" unmountOnExit>
        <PopupContainer onClick={closeModalHanlder}>
          <PopupChangeNodeView closeModal={closeModalHanlder} />
        </PopupContainer>
      </CSSTransition>
    </PopupStyled>
  )
}
