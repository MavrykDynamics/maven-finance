import * as React from 'react'
import { useDispatch } from 'react-redux'
import { showToaster } from '../Toaster/Toaster.actions'
import { TzAddressStyles } from './TzAddress.constants'
import { TzAddressContainer, TzAddressIcon, TzAddressStyled } from './TzAddress.style'

type TzAddressProps = {
  tzAddress: string
  type?: TzAddressStyles
  hasIcon: boolean
  iconToLeft?: boolean | undefined
  isBold?: boolean
}
export const TzAddress = ({ tzAddress = '', type, hasIcon, iconToLeft, isBold }: TzAddressProps) => {
  let addrClasses = type
  if (isBold) addrClasses += ' bold'
  const dispatch = useDispatch()

  const _handleCopyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address)
    dispatch(showToaster('SUCCESS', 'Copied to Clipboard', `${address}`))
  }

  if (!tzAddress) {
    return null
  }

  if (hasIcon) {
    return (
      <TzAddressContainer
        className={'tzAddressToClick'}
        onClick={() => {
          _handleCopyToClipboard(tzAddress)
        }}
      >
        {iconToLeft && (
          <TzAddressIcon className={addrClasses}>
            {' '}
            <use xlinkHref="/icons/sprites.svg#copyToClipboard" />
          </TzAddressIcon>
        )}
        <TzAddressStyled className={addrClasses}>
          {`${tzAddress.slice(0, 7)}...${tzAddress.slice(tzAddress.length - 4, tzAddress.length)}`}
        </TzAddressStyled>
        {!iconToLeft && (
          <TzAddressIcon className={addrClasses}>
            <use xlinkHref="/icons/sprites.svg#copyToClipboard" />
          </TzAddressIcon>
        )}
      </TzAddressContainer>
    )
  } else
    return (
      <TzAddressContainer
        className={'tzAddressToClick'}
        onClick={() => {
          _handleCopyToClipboard(tzAddress)
        }}
      >
        <TzAddressStyled className={addrClasses}>
          {`${tzAddress.slice(0, 7)}...${tzAddress.slice(tzAddress.length - 4, tzAddress.length)}`}
        </TzAddressStyled>
      </TzAddressContainer>
    )
}
