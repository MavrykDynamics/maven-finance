import { InputView } from './Input.view'

export type InputStatusType = 'success' | 'error' | '' | undefined
export type InputKind = 'primary' | 'search'
export type InputOneChange = React.ChangeEventHandler<HTMLInputElement>
type InputProps = {
  id?: string
  icon?: string
  placeholder?: string
  name?: string
  value?: string | number
  onChange: InputOneChange
  onBlur?: InputOneChange
  onFocus?: InputOneChange
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  inputStatus?: InputStatusType
  type?: string
  errorMessage?: string
  disabled?: boolean
  required?: boolean
  pinnedText?: string
  kind?: InputKind
}

export const Input = ({
  id = '',
  icon,
  placeholder,
  name,
  value,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  inputStatus,
  type,
  errorMessage,
  disabled,
  pinnedText,
  kind,
  required,
}: InputProps) => {
  return (
    <InputView
      id={id}
      type={type}
      icon={icon}
      name={name}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      inputStatus={inputStatus}
      errorMessage={errorMessage}
      disabled={disabled}
      pinnedText={pinnedText}
      kind={kind}
    />
  )
}
