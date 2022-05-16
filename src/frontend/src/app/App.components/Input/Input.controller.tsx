import * as PropTypes from 'prop-types'
import * as React from 'react'

import { InputView } from './Input.view'

export type InputStatusType = 'success' | 'error' | '' | undefined
export type InputKind = 'primary' | 'search'
type InputProps = {
  icon?: string
  placeholder: string
  name?: string
  value?: string | number
  onChange: any
  onBlur: any
  inputStatus?: InputStatusType
  type: string
  errorMessage?: string
  disabled?: boolean
  required?: boolean
  pinnedText?: string
  kind?: InputKind
}

export const Input = ({
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
  pinnedText,
  kind,
  required,
}: InputProps) => {
  return (
    <InputView
      type={type}
      icon={icon}
      name={name}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      inputStatus={inputStatus}
      errorMessage={errorMessage}
      disabled={disabled}
      pinnedText={pinnedText}
      kind={kind}
    />
  )
}

Input.propTypes = {
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
  kind: PropTypes.string,
}

Input.defaultProps = {
  icon: undefined,
  placeholder: undefined,
  name: undefined,
  value: undefined,
  inputStatus: undefined,
  type: 'text',
  kind: 'primary',
}
