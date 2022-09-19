import { ACCURATE_DECIMALS_TO_SHOW, DECIMALS_TO_SHOW } from '../../../utils/constants'
import { CommaNumberSvgKind, SECONDARY_COMMA_NUMBER } from './CommaNumber.constants'
import { LoadingIcon } from './CommaNumber.style'

const roundNumber = (number: string, symbolsCount: number): string => {
  let formatterNumber = parseFloat(`0.${number}`)
  return formatterNumber.toFixed(symbolsCount).split('.')[1]
}

export const CommaNumber = ({
  value,
  loading,
  endingText,
  beginningText,
  className = '',
  showDecimal = true,
  svgKind = SECONDARY_COMMA_NUMBER,
  useAccurateParsing = false,
}: {
  value: number
  loading?: boolean
  endingText?: string
  beginningText?: string
  className?: string
  showDecimal?: boolean
  useAccurateParsing?: boolean
  svgKind?: CommaNumberSvgKind
}) => {
  let numberWithCommas = value?.toLocaleString('en-US', { maximumFractionDigits: showDecimal ? DECIMALS_TO_SHOW : 0 })
  let titleForNumber = undefined

  // it's exponential number if e-7 it will scientific notation, every that are < -7 normal notation
  if (value.toString().includes('e') && useAccurateParsing) {
    const [number, tenGrade] = value.toString().split('e')
    const [integer, decimals] = number.split('.')

    // extra low number
    if (+tenGrade < 0) {
      // how much zeroes we will have
      const newTenGrade = Number(tenGrade) + integer.length

      // generate title that represent full leght of the extra small number
      titleForNumber = `0.${''.padEnd(Math.abs(+newTenGrade), '0')}${integer}${decimals}`

      // if after multipling decimals we will
      if (Math.abs(+newTenGrade) + integer.length + decimals.length > ACCURATE_DECIMALS_TO_SHOW) {
        // if we have legnth of future decimal part > 5, it means that numberWithCommas will be > 9 symbols and we need to round decimal part
        if (integer.length + decimals.length > 5) {
          numberWithCommas = `0.0...0${roundNumber(integer + decimals, 5)}`
        } else {
          numberWithCommas = `0.0...0${integer}${decimals}`
        }
      } else {
        numberWithCommas = `0.${''.padEnd(Math.abs(+newTenGrade), '0')}${integer}${decimals}`
      }
    }

    //TODO: if need add case for large numbers
  }

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
            <div className={className} title={titleForNumber}>
              <p>
                {beginningText ? beginningText + ' ' : ''}
                {numberWithCommas}
                {endingText ? ' ' + endingText : ''}
              </p>
            </div>
          ) : (
            <div className={className} title={titleForNumber}>
              {numberWithCommas}
            </div>
          )}
        </>
      )}
    </>
  )
}
