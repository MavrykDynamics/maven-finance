import { useLockBodyScroll } from 'react-use'
import { PopupContainer, PopupStyled } from '../../ChangeNodePopup/Popup-change-node.style'
import { WertIo } from '../ConnectWallet.style'

const WertIoPopup = ({ closePopup, isOpened }: { closePopup: () => void; isOpened: boolean }) => {
  useLockBodyScroll(isOpened)

  return (
    <PopupStyled
      style={{
        visibility: isOpened ? 'visible' : 'hidden',
        transition: '1s all',
        opacity: isOpened ? 1 : 0,
        zIndex: 16,
      }}
    >
      <PopupContainer onClick={closePopup}>
        <div className="wert-io-wrapper">
          <div onClick={closePopup} className="close_modal">
            ×
          </div>
          <WertIo id="wert-io-popup-wrapper" />
        </div>
      </PopupContainer>
    </PopupStyled>
  )
}

export default WertIoPopup
