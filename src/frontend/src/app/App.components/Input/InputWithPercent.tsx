import * as React from 'react'
import { InputStatusType } from './Input.constants'
import { Input } from './Input.controller'

type InputProps = {
  placeholder: string
  value: string | number
  name?: string
  onChange: (arg: number) => void
  onBlur?: React.ChangeEventHandler<HTMLInputElement>
  inputStatus: InputStatusType
  type: string
  disabled: boolean
}

const InputWithPercent = ({ disabled, type, name, placeholder, value, onChange, onBlur, inputStatus }: InputProps) => {
  return (
    <Input
      type={type}
      name={name}
      placeholder={placeholder}
      disabled={disabled}
      value={`${value}%`}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        // if adding number just replace '%' and set parsed number
        if (/([%])/g.test(e.target.value)) {
          onChange(Number(e.target.value.replace('%', '')) || 0)
        } else {
          // is removed '%' we need to remove last number
          onChange(Number(Math.floor(+e.target.value / 10)) || 0)
        }
      }}
      onBlur={onBlur}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) =>
        !/^\d*\.?\d*$/.test(e.key) && e.key !== 'Backspace' && e.preventDefault()
      }
      inputStatus={inputStatus}
    />
  )
}

export default InputWithPercent
