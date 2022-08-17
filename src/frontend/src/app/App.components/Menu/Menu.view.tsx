import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'

import { MainNavigationRoute } from '../../../utils/TypesAndInterfaces/Navigation'
import { toggleRPCNodePopup } from '../ChangeNodePopup/ChangeNode.actions'
import { ConnectWallet } from '../ConnectWallet/ConnectWallet.controller'
import Icon from '../Icon/Icon.view'
import {
  MenuFooter,
  MenuGrid,
  MenuLogo,
  MenuMobileBurger,
  MenuSidebarContent,
  MenuSidebarStyled,
  MenuTopStyled,
} from './Menu.style'
import { mainNavigationLinks } from './NavigationLink/MainNavigationLinks'
import { NavigationLink } from './NavigationLink/NavigationLink.controller'
import { TopBarLinks } from './TopBarLinks/TopBarLinks.controller'

type MenuViewProps = {
  loading: boolean
  accountPkh?: string
  ready: boolean
  isExpandedMenu: boolean
  setisExpandedMenu: (value: boolean) => void
  openChangeNodePopupHandler: () => void
}

const SocialIcons = () => (
  <div className="social-wrapper">
    <a href="https://discord.com/invite/7VXPR4gkT6" target="_blank" rel="noreferrer">
      <Icon id="socialDiscord" />
    </a>
    <a href="https://github.com/mavrykfinance/" target="_blank" rel="noreferrer">
      <Icon id="socialGitHub" />
    </a>
    <a href="https://medium.com/@Mavryk_Finance" target="_blank" rel="noreferrer">
      <Icon id="socialMedium" />
    </a>
    <a href="https://t.me/Mavryk_Finance" target="_blank" rel="noreferrer">
      <Icon id="socialTelegram" />
    </a>
    <a href="https://twitter.com/Mavryk_Finance" target="_blank" rel="noreferrer">
      <Icon id="socialTwitter" />
    </a>
  </div>
)

export const MenuView = ({
  accountPkh,
  ready,
  isExpandedMenu,
  setisExpandedMenu,
  openChangeNodePopupHandler,
}: MenuViewProps) => {
  const location = useLocation()
  const [isExpanded, setExpanded] = useState<number>(0)

  const { darkThemeEnabled } = useSelector((state: any) => state.preferences)

  const logoImg = darkThemeEnabled ? '/logo-dark.svg' : '/logo-light.svg'
  // const logoMobile = '/logo-mobile.svg'

  const handleToggle = (id: number) => {
    setisExpandedMenu(true)
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
              setisExpandedMenu(!isExpandedMenu)
            }}
            className={isExpandedMenu ? 'expanded' : ''}
          >
            <Icon id="menuOpen" />
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
          <SocialIcons />
          <ConnectWallet type={'main-menu'} />
          <div className="settingsIcon" onClick={openChangeNodePopupHandler}>
            <Icon id="gear" />
          </div>
        </div>
      </MenuTopStyled>

      <MenuSidebarStyled
        className={`navbar-sticky ${isExpandedMenu ? 'menu-expanded' : 'menu-collapsed'}`}
        onClick={() => {
          setExpanded(0)
          setisExpandedMenu(false)
        }}
      >
        <MenuSidebarContent onClick={(e) => e.stopPropagation()}>
          <MenuGrid>
            {mainNavigationLinks.map((navigationLink: MainNavigationRoute, index: number) => {
              const key = `${index}-${navigationLink.path.substring(1)}-${navigationLink.id}`
              return (
                <NavigationLink
                  key={key}
                  handleToggle={handleToggle}
                  isExpanded={navigationLink.id === isExpanded}
                  isMobMenuExpanded={isExpandedMenu}
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
        </MenuSidebarContent>
      </MenuSidebarStyled>
    </>
  )
}
