import * as React from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'

import { MainNavigationRoute } from '../../../utils/TypesAndInterfaces/Navigation'
import { ConnectWallet } from '../ConnectWallet/ConnectWallet.controller'
import {
  MenuFooter,
  MenuGrid,
  MenuLogo,
  MenuMobileBurger,
  MenuStyled,
  MenuTopSection,
  MenuTopStyled,
} from './Menu.style'
import { mainNavigationLinks } from './NavigationLink/MainNavigationLinks'
import { NavigationLink } from './NavigationLink/NavigationLink.controller'
import { TopBarLinks } from './TopBarLinks/TopBarLinks.controller'

type MenuViewProps = {
  loading: boolean
  accountPkh?: string
  ready: boolean
}

export const MenuView = ({ accountPkh, ready }: MenuViewProps) => {
  const location = useLocation()
  const [isExpanded, setExpanded] = useState<number>(0)
  const [isExpandedMenuMob, setExpandedMenuMob] = useState<boolean>(true)
  const { darkThemeEnabled } = useSelector((state: any) => state.preferences)

  const logoImg = darkThemeEnabled ? '/logo-dark.svg' : '/logo-light.svg'
  const logoMobile = '/logo-mobile.svg'

  const handleToggle = (id: number) => {
    setExpandedMenuMob(true)
    setExpanded(id === isExpanded ? 0 : id)
  }

  return (
    <>
      <MenuTopStyled>
        <div className="left-side">
          <MenuMobileBurger
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(0)
              setExpandedMenuMob(!isExpandedMenuMob)
            }}
            className={isExpandedMenuMob ? 'expanded' : ''}
          >
            <svg>
              <use xlinkHref="/icons/sprites.svg#menuOpen" />
            </svg>
          </MenuMobileBurger>

          <Link to="/">
            <MenuLogo alt="logo" className={'desctop-logo'} src={logoImg} />
            {/* <MenuLogo alt="logo" className={'mobile-logo'} src={logoMobile} /> */}
          </Link>
        </div>
        <div className="grouped-links">
          <TopBarLinks
            groupName={'Products'}
            groupLinks={[
              { name: 'link 9', href: 'gdfgd' },
              { name: 'link 6', href: 'gdfgd' },
            ]}
          />
          <TopBarLinks
            groupName={'About'}
            groupLinks={[
              { name: 'link 1', href: 'gdfgd' },
              { name: 'link 7', href: 'gdfgd' },
            ]}
          />
          <TopBarLinks groupName={'Blog 🔥'} groupLinks={[]} />
          <TopBarLinks
            groupName={'Docs'}
            groupLinks={[
              { name: 'link 1', href: 'gdfgd' },
              { name: 'link 2', href: 'gdfgd' },
              { name: 'link 4', href: 'gdfgd' },
            ]}
          />
        </div>
        <div className="right-side">
          <div className="social-wrapper">
            <a href="https://discord.com/invite/7VXPR4gkT6" target="_blank" rel="noreferrer">
              <svg>
                <use xlinkHref="/icons/sprites.svg#socialDiscord" />
              </svg>
            </a>
            <a href="https://github.com/mavrykfinance/" target="_blank" rel="noreferrer">
              <svg>
                <use xlinkHref="/icons/sprites.svg#socialGitHub" />
              </svg>
            </a>
            <a href="https://medium.com/@Mavryk_Finance" target="_blank" rel="noreferrer">
              <svg>
                <use xlinkHref="/icons/sprites.svg#socialMedium" />
              </svg>
            </a>
            <a href="https://t.me/Mavryk_Finance" target="_blank" rel="noreferrer">
              <svg>
                <use xlinkHref="/icons/sprites.svg#socialTelegram" />
              </svg>
            </a>
            <a href="https://twitter.com/Mavryk_Finance" target="_blank" rel="noreferrer">
              <svg>
                <use xlinkHref="/icons/sprites.svg#socialTwitter" />
              </svg>
            </a>
          </div>
          <ConnectWallet type={'main-menu'} />

          <div className="settingsIcon">
            <svg>
              <use xlinkHref="/icons/sprites.svg#gear" />
            </svg>
          </div>
        </div>
      </MenuTopStyled>
      <MenuStyled
        className={`navbar-sticky ${isExpandedMenuMob ? 'menu-expanded' : 'menu-collapsed'}`}
        onClick={() => {
          setExpanded(0)
          setExpandedMenuMob(false)
        }}
      >
        <MenuTopSection onClick={(e) => e.stopPropagation()}>
          <MenuGrid>
            {mainNavigationLinks.map((navigationLink: MainNavigationRoute, index: number) => {
              const key = `${index}-${navigationLink.path.substring(1)}-${navigationLink.id}`
              return (
                <NavigationLink
                  key={key}
                  handleToggle={handleToggle}
                  isExpanded={navigationLink.id === isExpanded}
                  isMobMenuExpanded={isExpandedMenuMob}
                  location={location}
                  walletReady={ready}
                  accountPkh={accountPkh}
                  {...navigationLink}
                />
              )
            })}
          </MenuGrid>
          <MenuFooter>
            MAVRYK App <p>v1.0</p>
          </MenuFooter>
        </MenuTopSection>
      </MenuStyled>
    </>
  )
}
