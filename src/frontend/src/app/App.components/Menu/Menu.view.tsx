import { Link, useLocation } from 'react-router-dom'
import Toggle from 'react-toggle'
// prettier-ignore
import {
  MenuBanner, MenuBottomSection,
  MenuFooter,
  MenuGrid,
  MenuLogo,
  MenuStyled, MenuTopSection,
  ThemeToggleIcon,
} from './Menu.style'
import * as React from 'react'
import { mainNavigationLinks } from './NavigationLink/MainNavigationLinks'
import { MainNavigationLink } from '../../../styles/interfaces'
import { NavigationLink } from './NavigationLink/NavigationLink.controller'
import { useState } from 'react'
import { ConnectWallet } from '../ConnectWallet/ConnectWallet.controller'

type MenuViewProps = {
  loading: boolean
  myMvkTokenBalance?: string
  accountPkh?: string
  handleNewConnect: () => void
  wallet: any
  ready: boolean
  handleConnect: () => void
  darkThemeEnabled: boolean
  handleToggleTheme: () => void
}

export const MenuView = ({
  loading,
  myMvkTokenBalance,
  accountPkh,
  handleNewConnect,
  wallet,
  ready,
  handleConnect,
  darkThemeEnabled,
  handleToggleTheme,
}: MenuViewProps) => {
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
          type={'main-menu'}
          loading={loading}
          wallet={wallet}
          ready={ready}
          accountPkh={accountPkh}
          myMvkTokenBalance={myMvkTokenBalance}
          handleConnect={handleConnect}
          handleNewConnect={handleNewConnect}
        />
        <MenuGrid>
          {mainNavigationLinks.map((navigationLink: MainNavigationLink, index: number) => {
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
        <label>
          <Toggle
            defaultChecked={darkThemeEnabled}
            icons={{
              checked: (
                <ThemeToggleIcon>
                  <use xlinkHref="/icons/sprites.svg#moon" />
                </ThemeToggleIcon>
              ),
              unchecked: (
                <ThemeToggleIcon>
                  <use xlinkHref="/icons/sprites.svg#sun" />
                </ThemeToggleIcon>
              ),
            }}
            aria-label="Dark mode toggle"
            onChange={handleToggleTheme}
          />
        </label>
        <MenuFooter>
          MAVRYK App <p>v1.0</p>
        </MenuFooter>
      </MenuBottomSection>
    </MenuStyled>
  )
}
