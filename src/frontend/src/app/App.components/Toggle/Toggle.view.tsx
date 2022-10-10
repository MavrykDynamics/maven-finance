import ReactToggle from 'react-toggle'

// style
import { ToggleStyle } from './Toggle.style'

type Props = {
  onChange: () => void
  className: string
  sufix: string
  disabled?: boolean
  checked: boolean
}

export default function Toggle({ onChange, className, sufix, disabled = false, checked }: Props) {
  return (
    <ToggleStyle className={`${className} ${disabled ? 'disabled' : ''}`}>
      <ReactToggle checked={checked} icons={false} onChange={onChange} className="toggle" />
      {sufix ? <span className="sufix">{sufix}</span> : null}
    </ToggleStyle>
  )
}
