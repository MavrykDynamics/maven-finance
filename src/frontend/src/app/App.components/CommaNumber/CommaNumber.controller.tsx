import { DECIMALS_TO_SHOW } from '../../../utils/constants'
import { CommaNumberSvgKind, SECONDARY_COMMA_NUMBER } from './CommaNumber.constants'
import { LoadingIcon } from './CommaNumber.style'

export const CommaNumber = ({
  value,
  loading,
  endingText,
  beginningText,
  className = '',
  showDecimal = true,
  svgKind = SECONDARY_COMMA_NUMBER,
}: {
  value: number
  loading?: boolean
  endingText?: string
  beginningText?: string
  className?: string
  showDecimal?: boolean
  svgKind?: CommaNumberSvgKind
}) => {
  const numberWithCommas = value?.toLocaleString('en-US', { maximumFractionDigits: showDecimal ? DECIMALS_TO_SHOW : 0 })

  return (
    <>
      {loading ? (
        <div className={className}>
          <LoadingIcon className={svgKind}>
            <use xlinkHref="/icons/sprites.svg#loading" />
          </LoadingIcon>
        </div>
      ) : (
        <>
          {beginningText || endingText ? (
            <div className={className}>
              <p>
                {beginningText ? beginningText + ' ' : ''}
                {numberWithCommas}
                {endingText ? ' ' + endingText : ''}
              </p>
            </div>
          ) : (
            <div className={className}>{numberWithCommas}</div>
          )}
        </>
      )}
    </>
  )
}
