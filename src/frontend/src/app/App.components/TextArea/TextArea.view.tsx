import * as React from 'react'
import * as PropTypes from 'prop-types'

import { TextAreaStyled, TextAreaComponent, TextAreaStatus, TextAreaIcon, TextAreaErrorMessage } from './TextArea.style'
import { TextAreaStatusType } from './TextArea.controller'

type TextAreaViewProps = {
  icon?: string
  placeholder: string
  name?: string
  value?: string | number
  onChange: any
  onBlur: any
  textAreaStatus?: TextAreaStatusType
  errorMessage?: string
  disabled?: boolean
}

export const TextAreaView = ({
  icon,
  placeholder,
  name,
  value,
  onChange,
  onBlur,
  textAreaStatus,
  errorMessage,
  disabled,
}: TextAreaViewProps) => {
  let status = textAreaStatus !== undefined ? textAreaStatus : 'none'
  return (
    <TextAreaStyled id={'textAreaContainer'}>
      {icon && (
        <TextAreaIcon>
          <use xlinkHref={`/icons/sprites.svg#${icon}`} />
        </TextAreaIcon>
      )}
      <TextAreaComponent
        name={name}
        className={status}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={name}
        disabled={disabled}
      />
      <TextAreaStatus className={status} />
      {errorMessage && <TextAreaErrorMessage>{errorMessage}</TextAreaErrorMessage>}
    </TextAreaStyled>
  )
}

TextAreaView.propTypes = {
  icon: PropTypes.string,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  inputStatus: PropTypes.string,
  errorMessage: PropTypes.string,
  disabled: PropTypes.bool,
}

TextAreaView.defaultProps = {
  icon: undefined,
  placeholder: undefined,
  name: undefined,
  value: undefined,
  inputStatus: undefined,
}
