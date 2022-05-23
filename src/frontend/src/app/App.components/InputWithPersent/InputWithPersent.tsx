import * as React from 'react';

import { Input, InputStatusType } from '../Input/Input.controller';

type InputProps = {
  placeholder: string;
  value: string | number;
  onChange: any;
  onBlur?: any;
  inputStatus: InputStatusType;
  type: string;
  disabled: boolean;
};

const InputWithPersent = ({
  disabled,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  inputStatus,
}: InputProps) => {
  return (
    <Input
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      value={`${value}%`}
      onChange={(e: any) => {
        // if adding number just replace '%' and set parsed number
        if (/([%])/g.test(e.target.value)) {
          onChange(Number(e.target.value.replace('%', '')) || 0);
        } else {
          // is removed '%' we need to remove last number
          onChange(Number(Math.floor(e.target.value / 10)) || 0);
        }
      }}
      onBlur={onBlur}
      onKeyDown={(e: any) =>
        !/^\d*\.?\d*$/.test(e.key) && e.key !== 'Backspace' && e.preventDefault()
      }
      inputStatus={inputStatus}
    />
  );
};

export default InputWithPersent;
