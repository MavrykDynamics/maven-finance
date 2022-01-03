import * as React from 'react'

export const CommaNumber = ({
  value,
  endingText,
  beginningText,
  showDecimal = true,
}: {
  value: number
  endingText?: string
  beginningText?: string
  showDecimal?: boolean
}) => {
  const numberWithCommas = value.toLocaleString('en-US', { maximumFractionDigits: showDecimal ? 2 : 0 })
  return (
    <>
      {beginningText || endingText ? (
        <div>
          <p>
            {beginningText ? beginningText + ' ' : ''}
            {numberWithCommas}
            {endingText ? ' ' + endingText : ''}
          </p>
        </div>
      ) : (
        <div>{numberWithCommas}</div>
      )}
    </>
  )
}
