import * as PropTypes from 'prop-types'
import * as React from 'react'

import { InputKind, InputStatusType } from './Input.controller'
// prettier-ignore
import { InputComponent, InputComponentContainer, InputErrorMessage, InputIcon, InputLabel, InputStatus, InputStyled } from './Input.style'

type InputViewProps = {
  icon?: string
  placeholder: string
  name?: string
  value?: string | number
  onChange: any
  onBlur: any
  onFocus: any
  inputStatus?: InputStatusType
  type: string
  errorMessage?: string
  disabled?: boolean
  pinnedText?: string
  required?: boolean
  kind?: InputKind
}

export const InputView = ({
  icon,
  placeholder,
  name,
  value,
  onChange,
  onBlur,
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
          id={'inputComponent'}
          type={type}
          name={name}
          required={required}
          className={classNames}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          autoComplete={name}
          disabled={disabled}
        />
        <InputStatus className={classNames} />
        {pinnedText && <InputLabel className={classNames}>{pinnedText}</InputLabel>}
      </InputComponentContainer>
      {errorMessage && <InputErrorMessage>{errorMessage}</InputErrorMessage>}
    </InputStyled>
  )
}

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
