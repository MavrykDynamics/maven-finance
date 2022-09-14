import { InputStatusType, InputKind } from './Input.constants'
import { InputOneChange } from './Input.controller'
import {
  InputComponentContainer,
  InputErrorMessage,
  InputIcon,
  InputLabel,
  InputStatus,
  InputStyled,
} from './Input.style'

type InputViewProps = {
  id?: string
  icon?: string
  placeholder?: string
  name?: string
  value: string | number
  onChange: InputOneChange
  onBlur?: InputOneChange
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  onFocus?: InputOneChange
  inputStatus?: InputStatusType
  type?: string
  errorMessage?: string
  disabled?: boolean
  pinnedText?: string
  required?: boolean
  kind?: InputKind
  className?: string
}

export const InputView = ({
  id,
  icon,
  placeholder,
  name,
  value,
  onChange,
  onBlur,
  onKeyDown,
  onFocus,
  inputStatus,
  type,
  errorMessage,
  disabled,
  pinnedText,
  kind,
  required,
  className,
}: InputViewProps) => {
  const classNames = `${kind} ${inputStatus !== undefined ? inputStatus : 'none'}`

  return (
    <InputStyled className={className} id={'inputStyled'}>
      {icon && (
        <InputIcon>
          <use xlinkHref={`/icons/sprites.svg#${icon}`} />
        </InputIcon>
      )}
      <InputComponentContainer>
        <input
          id={id}
          type={type}
          name={name}
          required={required}
          className={classNames}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          autoComplete={name}
          disabled={disabled}
        />
        <InputStatus className={`${classNames} ${pinnedText ? 'with-text' : ''}`} />
        {pinnedText && <InputLabel className={`${classNames} pinned-text`}>{pinnedText}</InputLabel>}
      </InputComponentContainer>
      {errorMessage && <InputErrorMessage>{errorMessage}</InputErrorMessage>}
    </InputStyled>
  )
}
