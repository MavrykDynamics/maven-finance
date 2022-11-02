import { ConnectWallet } from 'app/App.components/ConnectWallet/ConnectWallet.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { MenuLogo } from '../Menu.style'
import { TopBarLinks } from './TopBarLinks/TopBarLinks.controller'
import { MenuMobileBurger, MenuTopStyled } from './MenuTopBar.style'
import { State } from 'reducers'
import { MobileTopBar } from './TopBarLinks/MobileTopBar.controller'
import { useCallback, useState } from 'react'
import { useMedia } from 'react-use'
import { LIGHT_THEME } from 'app/App.components/DarkThemeProvider/DarkThemeProvider.actions'

type MenuTopBarProps = {
  burgerClickHandler: () => void
  openChangeNodePopupHandler: () => void
  isExpandedMenu: boolean
}

export const PRODUCTS_LINKS = [
  { name: 'Dapp', href: 'https://front-dev.mavryk-dapp.pages.dev', disabled: false, path: '/' },
  { name: 'Liquidity Baking (Soon)', href: 'mavryk.finance/liquidity-baking', disabled: true, path: '/liquidity-baking' },
  { name: 'Mavryk Bakery (Soon)', href: '/', disabled: true },
  { name: 'DAO Bakery (Soon)', href: '/', disabled: true },
]

export const ABOUT_LINKS = [
  { name: 'MVK Token (Soon)', href: '/', disabled: true },
  { name: 'Team', href: 'https://mavryk.finance/#team', disabled: false, path: 'https://mavryk.finance/#team' },
  // TODO: [MAV-501]
  // { name: 'Who we are', href: 'https://mavryk.finance/', disabled: false },
  // { name: 'Roadmap', href: 'https://mavryk.finance/#roadmap', disabled: false },
]

export const BLOG_LINKS = []

export const DOCS_LINKS = [
  { name: 'Litepaper', href: 'https://mavryk.finance/litepaper', disabled: false, path: 'https://mavryk.finance/litepaper' },
  { name: 'DAO docs (Soon)', href: '/', disabled: true },
  { name: 'Security Audits (Soon)', href: '/', disabled: true },
  { name: 'Github (Soon)', href: 'https://github.com/mavrykfinance/', disabled: true },
]

export const MenuTopBar = ({ burgerClickHandler, isExpandedMenu, openChangeNodePopupHandler }: MenuTopBarProps) => {
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const [showMobileTopBar, setShowMobileTopBar] = useState(false)
  const isMobileView = useMedia('(max-width: 870px)')

  const logoImg = themeSelected === LIGHT_THEME ? '/logo-light.svg' : '/logo-dark.svg'
  const logoMobile = '/logo-mobile.svg'

  const burgerClickHandlerWrapped = useCallback((e) => {
    e.stopPropagation()
    setShowMobileTopBar(false)
    burgerClickHandler()
  }, [])

  return (
    <MenuTopStyled>
      <div className="left-side">
        <MenuMobileBurger onClick={burgerClickHandlerWrapped} className={isExpandedMenu ? 'expanded' : ''}>
          <Icon id="menuOpen" />
        </MenuMobileBurger>

        <Link to="/">
          <MenuLogo alt="logo" className={'desktop-logo'} src={logoImg} />
          <MenuLogo alt="logo" className={'mobile-logo'} src={logoMobile} />
        </Link>
      </div>
      <div className="grouped-links">
        <TopBarLinks groupName={'Products'} groupLinks={PRODUCTS_LINKS} />
        <TopBarLinks groupName={'About'} groupLinks={ABOUT_LINKS} />
        <TopBarLinks groupName={'Blog 🔥'} groupLinks={BLOG_LINKS} groupNameLink="https://blogs.mavryk.finance/" />
        <TopBarLinks groupName={'Docs'} groupLinks={DOCS_LINKS} />
      </div>
      <div className="right-side">
        {/* Need this condition cuz of wert io container, technically without it will be 2 containers, and wert will take this container on mobile, not the mobile one */}
        {!isMobileView ? <ConnectWallet /> : null}
        <div className="settingsIcon" onClick={openChangeNodePopupHandler}>
          <Icon id="gear" />
        </div>
      </div>

      <div className="mobile-menu">
        {showMobileTopBar ? (
          <div className="settingsIcon" onClick={openChangeNodePopupHandler}>
            <Icon id="gear" />
          </div>
        ) : (
          <MenuMobileBurger onClick={burgerClickHandlerWrapped} className={isExpandedMenu ? 'expanded' : ''}>
            <Icon id="menuOpen" />
          </MenuMobileBurger>
        )}

        <Link to="/">
          <MenuLogo alt="logo" className={'mobile-logo'} src={logoMobile} />
        </Link>

        <div className="top-bar-toggler" onClick={() => setShowMobileTopBar(!showMobileTopBar)}>
          {showMobileTopBar ? <Icon id="close-stroke" /> : <Icon id="mobileTopBarToggler" />}
        </div>
      </div>

      <MobileTopBar show={showMobileTopBar} closeMobileMenu={burgerClickHandlerWrapped} />
    </MenuTopStyled>
  )
}
