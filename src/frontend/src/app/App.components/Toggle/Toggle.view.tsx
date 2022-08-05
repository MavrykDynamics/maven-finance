import ReactToggle from 'react-toggle'

// style
import { ToggleStyle } from './Toggle.style'

type Props = {
  onChange: () => void
  className: string
  sufix: string
  disabled?: boolean
}

export default function Toggle({ onChange, className, sufix, disabled = false }: Props) {
  return (
    <ToggleStyle className={`${className} ${disabled ? 'disabled' : ''}`}>
      <ReactToggle defaultChecked={false} icons={false} onChange={onChange} className="toggle" />
      {sufix ? <span className="sufix">{sufix}</span> : null}
    </ToggleStyle>
  )
}
