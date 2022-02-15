import { Link, useLocation } from 'react-router-dom'
import Toggle from 'react-toggle'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
// prettier-ignore
import {
  MenuBanner,
  MenuButton,
  MenuConnected,
  MenuFooter,
  MenuGrid,
  MenuIcon,
  MenuLogo,
  MenuStyled,
  ThemeToggleIcon,
} from './Menu.style'
import * as React from 'react'
import { mainNavigationLinks } from './NavigationLink/MainNavigationLinks'
import { MainNavigationLink } from '../../../styles/interfaces'
import { NavigationLink } from './NavigationLink/NavigationLink.controller'
import { useState } from 'react'
import { ConnectWallet } from '../ConnectWallet/ConnectWallet.controller'
import { ConnectWalletView } from '../ConnectWallet/ConnectWallet.view'

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
    <MenuStyled>
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
              handleToggle={handleToggle}
              isExpanded={navigationLink.id === isExpanded}
              location={location}
              {...navigationLink}
            />
          )
        })}
        {/*<Link to="/dashboard">*/}
        {/*  <MenuIcon selected={location.pathname === '/dashboard'}>*/}
        {/*    <svg>*/}
        {/*      <use xlinkHref="/icons/sprites.svg#grid" />*/}
        {/*    </svg>*/}
        {/*    <div>Dashboard</div>*/}
        {/*  </MenuIcon>*/}
        {/*</Link>*/}

        {/*<Link to="/">*/}
        {/*  <MenuIcon selected={location.pathname === '/'}>*/}
        {/*    <svg>*/}
        {/*      <use xlinkHref="/icons/sprites.svg#coins" />*/}
        {/*    </svg>*/}
        {/*    <div>Staking</div>*/}
        {/*  </MenuIcon>*/}
        {/*</Link>*/}

        {/*<Link to="/governance">*/}
        {/*  <MenuIcon selected={location.pathname === '/governance'}>*/}
        {/*    <svg>*/}
        {/*      <use xlinkHref="/icons/sprites.svg#hammer" />*/}
        {/*    </svg>*/}
        {/*    <div>Governance</div>*/}
        {/*  </MenuIcon>*/}
        {/*</Link>*/}

        {/*<Link to="/yield-farms">*/}
        {/*  <MenuIcon selected={location.pathname === '/yield-farms'}>*/}
        {/*    <svg>*/}
        {/*      <use xlinkHref="/icons/sprites.svg#plant" />*/}
        {/*    </svg>*/}
        {/*    <div>Farms</div>*/}
        {/*  </MenuIcon>*/}
        {/*</Link>*/}

        {/*<Link to="/treasury">*/}
        {/*  <MenuIcon selected={location.pathname === '/treasury'}>*/}
        {/*    <svg>*/}
        {/*      <use xlinkHref="/icons/sprites.svg#treasury" />*/}
        {/*    </svg>*/}
        {/*    <div>Treasury</div>*/}
        {/*  </MenuIcon>*/}
        {/*</Link>*/}

        {/*<Link to="/loans">*/}
        {/*  <MenuIcon selected={location.pathname === '/loans'}>*/}
        {/*    <svg>*/}
        {/*      <use xlinkHref="/icons/sprites.svg#bank" />*/}
        {/*    </svg>*/}
        {/*    <div>Loans</div>*/}
        {/*  </MenuIcon>*/}
        {/*</Link>*/}

        {/*<Link to="/vaults">*/}
        {/*  <MenuIcon selected={location.pathname === '/vaults'}>*/}
        {/*    <svg>*/}
        {/*      <use xlinkHref="/icons/sprites.svg#shop" />*/}
        {/*    </svg>*/}
        {/*    <div>Vaults</div>*/}
        {/*  </MenuIcon>*/}
        {/*</Link>*/}

        {/*<Link to="/satellites">*/}
        {/*  <MenuIcon*/}
        {/*    selected={*/}
        {/*      location.pathname === '/satellites' ||*/}
        {/*      location.pathname.startsWith('/satellite-details') ||*/}
        {/*      location.pathname === '/become-satellite'*/}
        {/*    }*/}
        {/*  >*/}
        {/*    <svg>*/}
        {/*      <use xlinkHref="/icons/sprites.svg#satellite" />*/}
        {/*    </svg>*/}
        {/*    <div>Satellites</div>*/}
        {/*  </MenuIcon>*/}
        {/*</Link>*/}
      </MenuGrid>

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
    </MenuStyled>
  )
}
