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

type MenuTopBarProps = {
  burgerClickHandler: () => void
  openChangeNodePopupHandler: () => void
  isExpandedMenu: boolean
}

export const SocialIcons = () => (
  <div className="social-wrapper">
    <a href="https://twitter.com/Mavryk_Finance" target="_blank" rel="noreferrer">
      <Icon id="socialTwitter" />
    </a>
    <a href="https://discord.com/invite/7VXPR4gkT6" target="_blank" rel="noreferrer">
      <Icon id="socialDiscord" />
    </a>
    <a href="https://t.me/Mavryk_Finance" target="_blank" rel="noreferrer">
      <Icon id="socialTelegram" />
    </a>
    <a href="https://medium.com/@Mavryk_Finance" target="_blank" rel="noreferrer">
      <Icon id="socialMedium" />
    </a>
    <a href="https://github.com/mavrykfinance/" target="_blank" rel="noreferrer">
      <Icon id="socialGitHub" />
    </a>
  </div>
)

export const PRODUCTS_LINKS = [
  { name: 'Dapp', href: 'https://front-dev.mavryk-dapp.pages.dev/' },
  { name: 'Liquidity Baking', href: 'mavryk.finance/liquidity-baking' },
  { name: 'Mavryk Bakery', href: '/' },
  { name: 'DAO Bakery', href: '/' },
]

export const ABOUT_LINKS = [
  { name: 'Who we are', href: 'https://mavryk.finance/' },
  { name: 'MVK Token', href: '/' },
  { name: 'Team', href: 'https://mavryk.finance/#team' },
  { name: 'Roadmap', href: 'https://mavryk.finance/#roadmap' },
]

export const BLOG_LINKS = []

export const DOCS_LINKS = [
  { name: 'Litepaper', href: 'https://mavryk.finance/litepaper' },
  { name: 'DAO docs', href: '/' },
  { name: 'Security Audits', href: '/' },
  { name: 'Github', href: 'https://github.com/mavrykfinance/' },
]

export const MenuTopBar = ({ burgerClickHandler, isExpandedMenu, openChangeNodePopupHandler }: MenuTopBarProps) => {
  const { darkThemeEnabled } = useSelector((state: State) => state.preferences)
  const [showMobileTopBar, setShowMobileTopBar] = useState(false)

  const logoImg = darkThemeEnabled ? '/logo-dark.svg' : '/logo-light.svg'
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
        <SocialIcons />
        <ConnectWallet />
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

      <MobileTopBar show={showMobileTopBar} />
    </MenuTopStyled>
  )
}
