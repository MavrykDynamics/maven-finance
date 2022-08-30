import React from 'react'
import { TextAreaView } from './TextArea.view'

export type TextAreaStatusType = 'success' | 'error' | '' | undefined
type TextAreaProps = {
  icon?: string
  placeholder?: string
  name?: string
  className?: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  inputStatus?: TextAreaStatusType
  errorMessage?: string
  disabled?: boolean
  required?: boolean
}

export const TextArea = ({
  icon,
  placeholder = '',
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
