// components
import Icon from '../Icon/Icon.view'

// style
import { InfoBlock } from './info.style'

type Props = {
  text: string
  type: 'error' | 'info'
  className?: string
}
export const Info = ({ text, type, className = '' }: Props) => {
  return (
    <InfoBlock className={`${type} ${className}`}>
      <p>{text}</p>
      {type === 'error' ? <Icon id="error" /> : null}
    </InfoBlock>
  )
}
