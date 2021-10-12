import * as React from 'react'
import * as PropTypes from 'prop-types'

import { InputStyled, InputComponent, InputStatus, InputIcon, InputErrorMessage } from './Input.style'

type InputViewProps = {
  icon?: string
  placeholder: string
  name?: string
  value?: string | number
  onChange: any
  onBlur: any
  inputStatus?: 'success' | 'error'
  type: string
  errorMessage?: string
  disabled?: boolean
}

export const InputView = ({
  icon,
  placeholder,
  name,
  value,
  onChange,
  onBlur,
  inputStatus,
  type,
  errorMessage,
  disabled,
}: InputViewProps) => (
  <InputStyled>
    {icon && (
      <InputIcon>
        <use xlinkHref={`/icons/sprites.svg#${icon}`} />
      </InputIcon>
    )}
    <InputComponent
      type={type}
      name={name}
      className={inputStatus}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      autoComplete={name}
      disabled={disabled}
    />
    <InputStatus className={inputStatus} />
    {errorMessage && <InputErrorMessage>{errorMessage}</InputErrorMessage>}
  </InputStyled>
)

InputView.propTypes = {
  icon: PropTypes.string,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  inputStatus: PropTypes.string,
  type: PropTypes.string,
  errorMessage: PropTypes.string,
  disabled: PropTypes.bool,
}

InputView.defaultProps = {
  icon: undefined,
  placeholder: undefined,
  name: undefined,
  value: undefined,
  inputStatus: undefined,
  type: 'text',
}
