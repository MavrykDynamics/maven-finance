import * as React from 'react'
import { NavigationLinkStyle } from './NavigationLink.constants'
import { Link } from 'react-router-dom'
import {
  NavigationLinkContainer,
  NavigationLinkIcon,
  NavigationLinkItem,
  NavigationSubLinks,
  SubLinkText,
  SubNavLink,
} from './NavigationLink.style'
import { SubNavigationRoute } from '../../../../styles/interfaces'
import useCollapse from 'react-collapsed'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from '../../../../reducers'
import { SatelliteRecord } from '../../../../reducers/delegation'

type NavigationLinkProps = {
  title: string
  id: number
  path: string
  icon?: string
  subPages?: SubNavigationRoute[]
  kind?: NavigationLinkStyle
  location: any
  handleToggle: (id: number) => void
  isExpanded: boolean
  walletReady: any
  accountPkh: string | undefined
}

export const NavigationLink = ({
  title,
  id,
  path,
  icon,
  subPages,
  kind,
  location,
  handleToggle,
  isExpanded,
  walletReady,
  accountPkh,
}: NavigationLinkProps) => {
  const key = `${path.substring(1)}-${id}`
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { satelliteLedger } = delegationStorage
  const iconHref = `/icons/sprites.svg#${icon}`
  const subPagesPaths = [path]
  subPages?.forEach((subPage: SubNavigationRoute, index) => subPagesPaths.push(subPage.subPath))
  let mainLinkSelected = location.pathname === path
  if (subPages) mainLinkSelected = subPagesPaths.includes(location.pathname)

  if (path === '/satellites' && location.pathname.startsWith('/satellite-details')) {
    mainLinkSelected = true
  }
  const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded })

  const handleClick = () => {
    handleToggle(id)
  }
  return (
    <>
      {subPages ? (
        <NavigationLinkContainer className={'collapsible'} selected={mainLinkSelected} key={key}>
          <NavigationLinkItem
            selected={mainLinkSelected}
            className="header"
            {...getToggleProps({ onClick: handleClick })}
          >
            <Link to={path}>
              <NavigationLinkIcon selected={mainLinkSelected} id="navLinkIcon">
                <svg>
                  <use xlinkHref={iconHref} />
                </svg>
              </NavigationLinkIcon>
              <div id="navLinkTitle">{title}</div>
            </Link>
          </NavigationLinkItem>
          <div {...getCollapseProps()}>
            <NavigationSubLinks className="content">
              {subPages.map((subNavLink: SubNavigationRoute, index: number) => {
                const key = String(subNavLink.id)
                if (subNavLink.requires) {
                  const { isSatellite, isVestee } = subNavLink.requires
                  let accountIsAuthorized = false

                  if (isSatellite) {
                    const accountPkhIsSatellite = satelliteLedger?.filter(
                      (satellite: SatelliteRecord) => satellite.address === accountPkh,
                    )[0]
                    accountIsAuthorized = accountPkhIsSatellite !== undefined
                  } else if (isVestee) {
                    const accountPkhIsSatellite = satelliteLedger?.filter(
                      (satellite: SatelliteRecord) => satellite.address === accountPkh,
                    )[0]
                    accountIsAuthorized = accountPkhIsSatellite !== undefined
                  }
                  if (accountIsAuthorized) {
                    return (
                      <SubNavLink key={key}>
                        <Link to={subNavLink.subPath}>
                          <div />
                          <SubLinkText id="navLinkSubTitle" selected={location.pathname === subNavLink.subPath}>
                            {subNavLink.subTitle}
                          </SubLinkText>
                        </Link>
                      </SubNavLink>
                    )
                  } else {
                    return <div key={key} />
                  }
                } else {
                  return (
                    <SubNavLink key={key}>
                      <Link to={subNavLink.subPath}>
                        <div />
                        <SubLinkText id="navLinkSubTitle" selected={location.pathname === subNavLink.subPath}>
                          {subNavLink.subTitle}
                        </SubLinkText>
                      </Link>
                    </SubNavLink>
                  )
                }
              })}
            </NavigationSubLinks>
          </div>
        </NavigationLinkContainer>
      ) : (
        <NavigationLinkContainer key={key} selected={mainLinkSelected} onClick={handleClick}>
          <NavigationLinkItem selected={mainLinkSelected}>
            <Link to={path}>
              <NavigationLinkIcon selected={mainLinkSelected} id="navLinkIcon">
                <svg>
                  <use xlinkHref={iconHref} />
                </svg>
              </NavigationLinkIcon>
              <div id="navLinkTitle">{title}</div>
            </Link>
          </NavigationLinkItem>
        </NavigationLinkContainer>
      )}
    </>
  )
}
