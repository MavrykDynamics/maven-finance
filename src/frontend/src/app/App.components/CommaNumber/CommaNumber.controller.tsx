import * as React from 'react'

import { DECIMALS_TO_SHOW } from '../../../utils/constants'
import { LoadingIcon } from './CommaNumber.style'

export const CommaNumber = ({
  value,
  loading,
  endingText,
  beginningText,
  className = '',
  showDecimal = true,
}: {
  value: number
  loading?: boolean
  endingText?: string
  beginningText?: string
  className?: string
  showDecimal?: boolean
}) => {
  const numberWithCommas = value.toLocaleString('en-US', { maximumFractionDigits: showDecimal ? DECIMALS_TO_SHOW : 0 })
  return (
    <>
      {loading ? (
        <div className={className}>
          <LoadingIcon className={'secondary'}>
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
