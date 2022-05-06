import * as React from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'

import { MainNavigationRoute } from '../../../utils/TypesAndInterfaces/Navigation'
import { ConnectWallet } from '../ConnectWallet/ConnectWallet.controller'
import { MenuBanner, MenuBottomSection, MenuFooter, MenuGrid, MenuLogo, MenuStyled, MenuTopSection } from './Menu.style'
import { mainNavigationLinks } from './NavigationLink/MainNavigationLinks'
import { NavigationLink } from './NavigationLink/NavigationLink.controller'

type MenuViewProps = {
  loading: boolean
  accountPkh?: string
  ready: boolean
}

export const MenuView = ({ accountPkh, ready }: MenuViewProps) => {
  const location = useLocation()
  const [isExpanded, setExpanded] = useState<number>(0)
  const { darkThemeEnabled } = useSelector((state: any) => state.preferences)

  const logoImg = darkThemeEnabled ? '/logo-dark.svg' : '/logo-light.svg'

  const handleToggle = (id: number) => {
    setExpanded(id === isExpanded ? 0 : id)
  }
  return (
    <MenuStyled className={'navbar-sticky'}>
      <MenuTopSection>
        <Link to="/">
          <MenuLogo alt="logo" src={logoImg} />
        </Link>
        <ConnectWallet
          // ref={connectWalletRef}
          type={'main-menu'}
        />
        <MenuGrid>
          {mainNavigationLinks.map((navigationLink: MainNavigationRoute, index: number) => {
            const key = `${index}-${navigationLink.path.substring(1)}-${navigationLink.id}`
            return (
              <NavigationLink
                key={key}
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
        <MenuFooter>
          MAVRYK App <p>v1.0</p>
        </MenuFooter>
      </MenuBottomSection>
    </MenuStyled>
  )
}
