import { CSSTransition } from 'react-transition-group'
import { useLockBodyScroll } from 'react-use'
import { PopupContainer, PopupStyled } from '../ChangeNodePopup/Popup-change-node.style'
import { WertIo } from './ConnectWallet.style'

const WertIoPopup = ({ closePopup, isOpened }: { closePopup: () => void; isOpened: boolean }) => {
  useLockBodyScroll(isOpened)

  return (
    <PopupStyled>
      <CSSTransition in={isOpened} timeout={200} classNames="popup" unmountOnExit>
        <PopupContainer onClick={closePopup}>
          <div className="wert-io-wrapper">
            <div onClick={closePopup} className="close_modal">
              +
            </div>
            <WertIo id="wert-io-popup-wrapper" />
          </div>
        </PopupContainer>
      </CSSTransition>
    </PopupStyled>
  )
}

export default WertIoPopup
