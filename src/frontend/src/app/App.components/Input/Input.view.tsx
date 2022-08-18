import { InputKind, InputStatusType } from './Input.controller'
import {
  InputComponent,
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
  value?: string | number
  onChange: any
  onBlur?: any
  onKeyDown: any
  onFocus: any
  inputStatus?: InputStatusType
  type?: string
  errorMessage?: string
  disabled?: boolean
  pinnedText?: string
  required?: boolean
  kind?: InputKind
}

export const InputView = ({
  id = '',
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
}: InputViewProps) => {
  let classNames = kind
  let status = inputStatus !== undefined ? inputStatus : 'none'
  classNames += ` ${status}`
  return (
    <InputStyled id={'inputStyled'}>
      {icon && (
        <InputIcon>
          <use xlinkHref={`/icons/sprites.svg#${icon}`} />
        </InputIcon>
      )}
      <InputComponentContainer>
        <InputComponent
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
