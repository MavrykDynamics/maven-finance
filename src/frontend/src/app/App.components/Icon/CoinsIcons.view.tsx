import { useState } from 'react'
import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import Icon from './Icon.view'

export const FarmCardTokenLogoContainer = styled.figure<{ theme: MavrykTheme }>`
  height: 50px;
  align-items: center;
  position: relative;
  margin: 0;
  width: 55px;
  > img {
    align-items: center;
    justify-content: center;
    position: absolute;
  }
`
export const FarmCardFirstTokenIcon = styled.img<{ theme: MavrykTheme }>`
  height: 43px;
  width: 43px;
  bottom: 0px;
  right: -5px;
  align-self: flex-end;
  z-index: 1;
`
export const FarmCardSecondTokenIcon = styled.img<{ theme: MavrykTheme }>`
  height: 30px;
  width: 30px;
  top: 0px;
  left: 0;
  align-self: flex-end;
`

export default function CoinsIcons({
  firstAssetLogoSrc = '/images/coin-gold.svg',
  secondAssetLogoSrc = '/images/coin-silver.svg',
}: {
  firstAssetLogoSrc?: string
  secondAssetLogoSrc?: string
}) {
  return (
    <FarmCardTokenLogoContainer>
      <FarmCardFirstTokenIcon
        src={firstAssetLogoSrc}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null
          currentTarget.src = '/images/coin-gold.svg'
        }}
      />
      <FarmCardSecondTokenIcon
        src={secondAssetLogoSrc}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null
          currentTarget.src = '/images/coin-silver.svg'
        }}
      />
    </FarmCardTokenLogoContainer>
  )
}

// General Assets logo component
export const CoinsLogo = ({ assetName, className }: { assetName: string; className?: string }) => {
  return assetName.toLowerCase() === 'mvk' ? (
    <Icon id="mvkTokenGold" className={className} />
  ) : (
    <img
      className={className}
      src={`//logo.chainbit.xyz/${assetName.toLowerCase()}`}
      alt={`${assetName.toLowerCase()} logo`}
      loading="lazy"
    />
  )
}
