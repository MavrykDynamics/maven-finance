// view
import Icon from '../Icon/Icon.view'

// style
import { CheckboxStyled } from './Checkbox.style'

type Props = {
  id: string
  className?: string
  checked?: boolean
  onChangeHandler: () => void
}

export default function Checkbox({ id, className = '', checked = false, onChangeHandler }: Props) {
  return (
    <CheckboxStyled className={className}>
      <input type="checkbox" id={id} onChange={onChangeHandler} checked={checked} />
      <label htmlFor={id}>
        <Icon id="check-fill" />
      </label>
    </CheckboxStyled>
  )
}
