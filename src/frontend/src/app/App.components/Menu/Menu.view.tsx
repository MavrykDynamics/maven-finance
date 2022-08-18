import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import { MainNavigationRoute } from '../../../utils/TypesAndInterfaces/Navigation'
import { MenuFooter, MenuGrid, MenuSidebarContent, MenuSidebarStyled } from './Menu.style'
import { MenuTopBar } from './MenuTopBar/MenuTopBar.controller'
import { mainNavigationLinks } from './NavigationLink/MainNavigationLinks'
import { NavigationLink } from './NavigationLink/NavigationLink.controller'

type MenuViewProps = {
  loading: boolean
  accountPkh?: string
  ready: boolean
  isExpandedMenu: boolean
  setisExpandedMenu: (value: boolean) => void
  openChangeNodePopupHandler: () => void
}

export const MenuView = ({
  accountPkh,
  ready,
  isExpandedMenu,
  setisExpandedMenu,
  openChangeNodePopupHandler,
}: MenuViewProps) => {
  const location = useLocation()
  const [isExpanded, setExpanded] = useState<number>(0)

  const handleToggle = (id: number) => {
    setisExpandedMenu(true)
    setExpanded(id === isExpanded ? 0 : id)
  }

  return (
    <>
      <MenuTopBar
        setExpanded={setExpanded}
        setisExpandedMenu={setisExpandedMenu}
        openChangeNodePopupHandler={openChangeNodePopupHandler}
        isExpandedMenu={isExpandedMenu}
      />

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
