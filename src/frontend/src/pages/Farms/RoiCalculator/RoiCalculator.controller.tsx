//view
import ModalPopup from '../../../app/App.components/Modal/ModalPopup.view'
import CoinsIcons from '../../../app/App.components/Icon/CoinsIcons.view'

// style
import { RoiCalculatorStyled } from './RoiCalculator.style'

type Props = {
  onClose: () => void
}

export default function RoiCalculator({ onClose }: Props) {
  return (
    <ModalPopup onClose={onClose}>
      <RoiCalculatorStyled>
        <header>
          <CoinsIcons />
          <h2>ROI Calculator</h2>
        </header>
      </RoiCalculatorStyled>
    </ModalPopup>
  )
}
