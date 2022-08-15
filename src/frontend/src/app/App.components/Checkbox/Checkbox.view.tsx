// view
import Icon from '../Icon/Icon.view'

// style
import { CheckboxStyled } from './Checkbox.style'

type Props = {
  id: string
  className?: string
}

export default function Checkbox({ id, className = '' }: Props) {
  return (
    <CheckboxStyled className={className}>
      <input type="checkbox" id={id} />
      <label htmlFor={id}>
        <Icon id="check-fill" />
      </label>
    </CheckboxStyled>
  )
}
