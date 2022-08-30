import { TextAreaStyled, TextAreaComponent, TextAreaStatus, TextAreaIcon, TextAreaErrorMessage } from './TextArea.style'
import { TextAreaStatusType } from './TextArea.controller'

type TextAreaViewProps = {
  icon?: string
  placeholder: string
  name?: string
  className?: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  textAreaStatus?: TextAreaStatusType
  errorMessage?: string
  disabled?: boolean
  required?: boolean
}

export const TextAreaView = ({
  icon,
  placeholder,
  className,
  name,
  value,
  onChange,
  onBlur,
  textAreaStatus,
  errorMessage,
  disabled,
  required,
}: TextAreaViewProps) => {
  let status = textAreaStatus !== undefined ? textAreaStatus : 'none'
  return (
    <TextAreaStyled className={className} id={'textAreaContainer'}>
      {icon && (
        <TextAreaIcon>
          <use xlinkHref={`/icons/sprites.svg#${icon}`} />
        </TextAreaIcon>
      )}
      <TextAreaComponent
        name={name}
        className={`scroll-block ${status}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={name}
        disabled={disabled}
        required={required}
      />
      <TextAreaStatus className={status} />
      {errorMessage && <TextAreaErrorMessage>{errorMessage}</TextAreaErrorMessage>}
    </TextAreaStyled>
  )
}
