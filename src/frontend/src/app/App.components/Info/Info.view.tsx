// components
import Icon from '../Icon/Icon.view'
import { infoType } from './info.constants'

// style
import { InfoBlock } from './info.style'

type Props = {
  text: string
  type: infoType
  className?: string
}
export const Info = ({ text, type, className = '' }: Props) => {
  return (
    <InfoBlock className={`${type} ${className}`}>
      {type === 'warning' ? <Icon id="info" /> : null}
      <p>{text}</p>
      {type === 'error' ? <Icon id="error" /> : null}
    </InfoBlock>
  )
}
