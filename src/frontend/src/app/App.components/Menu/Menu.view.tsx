import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { useMedia } from 'react-use'
import { State } from 'reducers'

import { MainNavigationRoute } from '../../../utils/TypesAndInterfaces/Navigation'
import Icon from '../Icon/Icon.view'
import { toggleSidebarCollapsing } from './Menu.actions'
import { MenuFooter, MenuGrid, MenuSidebarContent, MenuSidebarStyled } from './Menu.style'
import { MenuTopBar } from './MenuTopBar/MenuTopBar.controller'
import { mainNavigationLinks } from './NavigationLink/MainNavigationLinks'
import { NavigationLink } from './NavigationLink/NavigationLink.controller'

import { matchPath } from 'react-router'

type MenuViewProps = {
  loading: boolean
  accountPkh?: string
  ready: boolean
  openChangeNodePopupHandler: () => void
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
    <a href="https://mavryk.finance/litepaper" target="_blank" rel="noreferrer">
      <Icon id="faqIcon" />
    </a>
    <a href="https://github.com/mavrykfinance/" target="_blank" rel="noreferrer">
      <Icon id="socialGitHub" />
    </a>
  </div>
)

export const MenuView = ({ accountPkh, openChangeNodePopupHandler }: MenuViewProps) => {
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const showSidebarOpened = useMedia('(min-width: 1400px)')
  const { sidebarOpened } = useSelector((state: State) => state.preferences)

  useEffect(() => {
    if (showSidebarOpened || sidebarOpened) {
      const selectedMainRoute = mainNavigationLinks.find(({ routePath = '', subPages = null }) => {
        if (subPages) {
          return subPages.find(({ routeSubPath = '' }) =>
            matchPath(pathname, { path: routeSubPath, exact: true, strict: true }),
          )
        }

        return matchPath(pathname, { path: routePath, exact: true, strict: true })
      })

      setSelectedMainLink(selectedMainRoute?.id || 0)
      setShowSubPages(Boolean(selectedMainRoute?.subPages))
    } else {
      setSelectedMainLink(0)
    }
  }, [pathname, showSidebarOpened, sidebarOpened])

  const [selectedMainLink, setSelectedMainLink] = useState<number>(0)
  const [showSubPages, setShowSubPages] = useState<boolean>(false)

  const handleToggle = () => {
    setShowSubPages(!showSubPages)
  }

  const burgerClickHandler = useCallback(() => {
    setSelectedMainLink(0)
    dispatch(toggleSidebarCollapsing())
  }, [])

  const sidebarBackdropClickHandler = useCallback(() => {
    setSelectedMainLink(0)
    dispatch(toggleSidebarCollapsing(false))
  }, [])

  return (
    <>
      <MenuTopBar
        burgerClickHandler={burgerClickHandler}
        openChangeNodePopupHandler={openChangeNodePopupHandler}
        isExpandedMenu={sidebarOpened}
      />

      <MenuSidebarStyled
        className={`navbar-sticky ${sidebarOpened ? 'menu-expanded' : 'menu-collapsed'}`}
        onClick={sidebarBackdropClickHandler}
      >
        <MenuSidebarContent onClick={(e) => e.stopPropagation()}>
          <MenuGrid>
            {mainNavigationLinks.map((navigationLink: MainNavigationRoute) => {
              return (
                <NavigationLink
                  key={navigationLink.id}
                  handleToggle={handleToggle}
                  selectedMainLink={navigationLink.id === selectedMainLink}
                  isMobMenuExpanded={sidebarOpened}
                  showSubPages={showSubPages}
                  accountPkh={accountPkh}
                  {...navigationLink}
                />
              )
            })}
          </MenuGrid>
          <MenuFooter className={`${sidebarOpened ? '' : 'menu-collapsed'}`}>
            <SocialIcons />
            MAVRYK App <p>v1.0</p>
          </MenuFooter>
        </MenuSidebarContent>
      </MenuSidebarStyled>
    </>
  )
}
