import * as PropTypes from 'prop-types'
import * as React from 'react'

import { TextAreaView } from './TextArea.view'

export type TextAreaStatusType = 'success' | 'error' | '' | undefined
type TextAreaProps = {
  icon?: string
  placeholder: string
  name?: string
  className?: string
  value?: string | number
  onChange: any
  onBlur: any
  inputStatus?: TextAreaStatusType
  errorMessage?: string
  disabled?: boolean
  required?: boolean
}

export const TextArea = ({
  icon,
  placeholder,
  name,
  className,
  value,
  onChange,
  onBlur,
  inputStatus,
  errorMessage,
  disabled,
  required,
}: TextAreaProps) => {
  return (
    <TextAreaView
      className={className}
      icon={icon}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      textAreaStatus={inputStatus}
      errorMessage={errorMessage}
      disabled={disabled}
      required={required}
    />
  )
}

TextArea.propTypes = {
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

TextArea.defaultProps = {
  icon: undefined,
  placeholder: undefined,
  name: undefined,
  value: undefined,
  inputStatus: undefined,
  type: 'text',
}
