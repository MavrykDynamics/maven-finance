import * as React from 'react'
import { DECIMALS_TO_SHOW } from '../../../utils/constants'
import { ButtonLoadingIcon } from '../Button/Button.style'

export const CommaNumber = ({
  value,
  loading,
  endingText,
  beginningText,
  showDecimal = true,
}: {
  value: number
  loading?: boolean
  endingText?: string
  beginningText?: string
  showDecimal?: boolean
}) => {
  const numberWithCommas = value.toLocaleString('en-US', { maximumFractionDigits: showDecimal ? DECIMALS_TO_SHOW : 0 })
  return (
    <>
      {loading ? (
        <div>
          <ButtonLoadingIcon className={'secondary'}>
            <use xlinkHref="/icons/sprites.svg#loading" />
          </ButtonLoadingIcon>
        </div>
      ) : (
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
      )}
    </>
  )
}
