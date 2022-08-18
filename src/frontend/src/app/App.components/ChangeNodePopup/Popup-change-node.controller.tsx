import { PopupChangeNodeView } from './Popup-change-node.view'
import { CSSTransition } from 'react-transition-group'

import { useEffect } from 'react'
import { PopupContainer, PopupStyled } from './Popup-change-node.style'

export const PopupChangeNode = ({ isModalOpened, closeModal }: { isModalOpened: boolean; closeModal: () => void }) => {
  useEffect(() => {
    if (isModalOpened) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpened])

  return (
    <PopupStyled>
      <CSSTransition in={isModalOpened} timeout={200} classNames="popup" unmountOnExit>
        <PopupContainer onClick={() => closeModal()}>
          <PopupChangeNodeView closeModal={closeModal} />
        </PopupContainer>
      </CSSTransition>
    </PopupStyled>
  )
}
