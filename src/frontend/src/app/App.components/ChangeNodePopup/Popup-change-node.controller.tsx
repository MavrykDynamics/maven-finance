import { PopupChangeNodeView } from './Popup-change-node.view'
import { CSSTransition } from 'react-transition-group'

import { PopupContainer, PopupStyled } from './Popup-change-node.style'
import { useLockBodyScroll } from 'react-use'

export const PopupChangeNode = ({ isModalOpened, closeModal }: { isModalOpened: boolean; closeModal: () => void }) => {
  useLockBodyScroll(isModalOpened)

  return (
    <PopupStyled>
      <CSSTransition in={isModalOpened} timeout={200} classNames="popup" unmountOnExit>
        <PopupContainer onClick={closeModal}>
          <PopupChangeNodeView closeModal={closeModal} />
        </PopupContainer>
      </CSSTransition>
    </PopupStyled>
  )
}
