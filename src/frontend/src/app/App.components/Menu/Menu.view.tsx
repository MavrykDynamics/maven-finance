import { Link, useLocation } from 'react-router-dom'
// prettier-ignore
import {
  MenuBanner,
  MenuBottomSection,
  MenuFooter,
  MenuGrid,
  MenuLogo,
  MenuStyled,
  MenuTopSection,
} from './Menu.style'
import * as React from 'react'
import { mainNavigationLinks } from './NavigationLink/MainNavigationLinks'
import { MainNavigationRoute } from '../../../styles/interfaces'
import { NavigationLink } from './NavigationLink/NavigationLink.controller'
import { useState } from 'react'
import { ConnectWallet } from '../ConnectWallet/ConnectWallet.controller'

type MenuViewProps = {
  loading: boolean
  accountPkh?: string
  ready: boolean
}

export const MenuView = ({ accountPkh, ready }: MenuViewProps) => {
  const location = useLocation()
  const [isExpanded, setExpanded] = useState<number>(0)

  const handleToggle = (id: number) => {
    setExpanded(id === isExpanded ? 0 : id)
  }
  return (
    <MenuStyled className={'navbar-sticky'}>
      <MenuTopSection>
        <Link to="/">
          <MenuLogo alt="logo" src="/logo.svg" />
        </Link>
        <ConnectWallet
          // ref={connectWalletRef}
          type={'main-menu'}
        />
        <MenuGrid>
          {mainNavigationLinks.map((navigationLink: MainNavigationRoute, index: number) => {
            return (
              <NavigationLink
                key={index}
                handleToggle={handleToggle}
                isExpanded={navigationLink.id === isExpanded}
                location={location}
                walletReady={ready}
                accountPkh={accountPkh}
                {...navigationLink}
              />
            )
          })}
        </MenuGrid>
      </MenuTopSection>
      <MenuBottomSection>
        <MenuBanner src="/images/buy-mvk.svg" alt="buy" />
        <MenuFooter>
          MAVRYK App <p>v1.0</p>
        </MenuFooter>
      </MenuBottomSection>
    </MenuStyled>
  )
}
