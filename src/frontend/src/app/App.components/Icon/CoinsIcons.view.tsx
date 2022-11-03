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
  firstAssetLogoSrc,
  secondAssetLogoSrc,
}: {
  firstAssetLogoSrc?: string
  secondAssetLogoSrc?: string
}) {
  return (
    <FarmCardTokenLogoContainer>
      <FarmCardFirstTokenIcon
        src={firstAssetLogoSrc ? `https://services.tzkt.io/v1/avatars/${firstAssetLogoSrc}` : '/images/coin-gold.svg'}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null
          currentTarget.src = '/images/coin-gold.svg'
        }}
      />
      <FarmCardSecondTokenIcon
        src={
          secondAssetLogoSrc ? `https://services.tzkt.io/v1/avatars/${secondAssetLogoSrc}` : '/images/coin-silver.svg'
        }
        onError={({ currentTarget }) => {
          currentTarget.onerror = null
          currentTarget.src = '/images/coin-silver.svg'
        }}
      />
    </FarmCardTokenLogoContainer>
  )
}

const AssetLogoStyled = styled.div<{ theme: MavrykTheme }>`
  &.no-image {
    fill: ${({ theme }) => theme.lPurple_dPurple_lPuprple};
  }
  height: inherit;
  width: inherit;
  svg,
  img {
    width: 100%;
    height: 100%;
  }
`

// General Assets logo component
export const CoinsLogo = ({ imageLink, assetName }: { imageLink?: string; assetName?: string }) => {
  const [imageExists, setImageExists] = useState(true)
  if (imageLink && imageExists) {
    return (
      <AssetLogoStyled className="icon">
        <img src={imageLink} alt={`logo`} loading="lazy" onError={() => setImageExists(false)} />
      </AssetLogoStyled>
    )
  }

  if (assetName && imageExists) {
    return assetName.toLowerCase() === 'mvk' ? (
      <AssetLogoStyled className="icon">
        <Icon id="mvkTokenGold" />
      </AssetLogoStyled>
    ) : (
      <AssetLogoStyled className="icon">
        <img
          src={`//logo.chainbit.xyz/${assetName.toLowerCase()}`}
          onError={() => setImageExists(false)}
          alt={`logo`}
          loading="lazy"
        />
      </AssetLogoStyled>
    )
  }

  return (
    <AssetLogoStyled className="no-image icon">
      <Icon id="noImage" />
    </AssetLogoStyled>
  )
}
