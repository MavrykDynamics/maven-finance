import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { State } from 'reducers'

import { MainNavigationRoute } from '../../../utils/TypesAndInterfaces/Navigation'
import { toggleSidebarCollapsing } from './Menu.actions'
import { MenuFooter, MenuGrid, MenuSidebarContent, MenuSidebarStyled } from './Menu.style'
import { MenuTopBar } from './MenuTopBar/MenuTopBar.controller'
import { mainNavigationLinks } from './NavigationLink/MainNavigationLinks'
import { NavigationLink } from './NavigationLink/NavigationLink.controller'

type MenuViewProps = {
  loading: boolean
  accountPkh?: string
  ready: boolean
  openChangeNodePopupHandler: () => void
}

export const MenuView = ({ accountPkh, ready, openChangeNodePopupHandler }: MenuViewProps) => {
  const location = useLocation()
  const dispatch = useDispatch()
  const [isExpanded, setExpanded] = useState<number>(0)
  const { sidebarOpened } = useSelector((state: State) => state.preferences)

  const handleToggle = (id: number) => {
    dispatch(toggleSidebarCollapsing(true))
    setExpanded(id === isExpanded ? 0 : id)
  }

  const burgerClickHandler = useCallback(() => {
    setExpanded(0)
    dispatch(toggleSidebarCollapsing())
  }, [])

  const sidebarBackdropClickHandler = useCallback(() => {
    setExpanded(0)
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
                  isExpanded={navigationLink.id === isExpanded}
                  isMobMenuExpanded={sidebarOpened}
                  location={location}
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
