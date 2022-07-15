// style
import { SatelliteItemStyle } from './SatelliteCard.style'

export const DataFeedCard = () => {
  return (
    <SatelliteItemStyle>
      <div className="item">
        <h5>Feed</h5>
        <var>XTZ / USD</var>
      </div>
      <div className="item">
        <h5>Answer</h5>
        <var>$ 2.04</var>
      </div>
      <div className="item">
        <h5>Contact address</h5>
        <var>0x56...8419</var>
      </div>
      <div className="item">
        <h5>Date</h5>
        <var>Nov 11th, 2022</var>
      </div>
    </SatelliteItemStyle>
  )
}
