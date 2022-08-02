import ReactToggle from 'react-toggle'

// style
import { ToggleStyle } from './Toggle.style'

type Props = {
  onChange: () => void
  className: string
  sufix: string
}

export default function Toggle({ onChange, className, sufix }: Props) {
  return (
    <ToggleStyle className={className}>
      <ReactToggle defaultChecked={false} icons={false} onChange={onChange} className="toggle" />
      {sufix ? <span className="sufix">{sufix}</span> : null}
    </ToggleStyle>
  )
}
