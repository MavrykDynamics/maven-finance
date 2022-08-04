import * as React from 'react'
import useCollapse from 'react-collapsed'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { State } from '../../../../reducers'
import { SatelliteRecord } from '../../../../utils/TypesAndInterfaces/Delegation'
import { SubNavigationRoute } from '../../../../utils/TypesAndInterfaces/Navigation'
import { NavigationLinkStyle } from './NavigationLink.constants'
import { NavigationLinkContainer, NavigationLinkIcon, NavigationLinkItem, NavigationSubLinks, SubLinkText, SubNavLink } from './NavigationLink.style'

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
  isMobMenuExpanded: boolean
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
  isMobMenuExpanded,
  walletReady,
  accountPkh,
}: NavigationLinkProps) => {
  const key = `${path.substring(1)}-${id}`
  const iconHref = `/icons/sprites.svg#${icon}`

  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const satelliteLedger = delegationStorage?.satelliteLedger

  const subPagesPaths = [path].concat(subPages ? subPages.map(({ subPath }) => subPath) : [])
  const splittedPathname = location.pathname.split(/(?=[/:-?{-~!"^_`\[\]])/gi).filter((path: string) => path !== '/')
  const mainLinkSelected = subPages
    ? Boolean(subPagesPaths.find((subPagePath) => splittedPathname.includes(subPagePath)))
    : splittedPathname.includes(path)

  console.log(path, splittedPathname, mainLinkSelected, subPages)

  const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded })

  const handleClick = () => {
    handleToggle(id)
  }
  return (
    <>
      {subPages ? (
        <NavigationLinkContainer
          className={'collapsible'}
          selected={mainLinkSelected}
          isMobMenuExpanded={isMobMenuExpanded}
          key={key}
        >
          <NavigationLinkItem
            selected={mainLinkSelected}
            isMobMenuExpanded={isMobMenuExpanded}
            className="header"
            {...getToggleProps({ onClick: handleClick })}
          >
            <Link to={path}>
              <NavigationLinkIcon selected={mainLinkSelected} className="navLinkIcon">
                <svg>
                  <use xlinkHref={iconHref} />
                </svg>
              </NavigationLinkIcon>
              <div className="navLinkTitle">{title}</div>
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
                          <SubLinkText className="navLinkSubTitle" selected={location.pathname === subNavLink.subPath}>
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
                        <SubLinkText className="navLinkSubTitle" selected={location.pathname === subNavLink.subPath}>
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
        <NavigationLinkContainer
          key={key}
          selected={mainLinkSelected}
          isMobMenuExpanded={isMobMenuExpanded}
          onClick={handleClick}
        >
          <NavigationLinkItem selected={mainLinkSelected} isMobMenuExpanded={isMobMenuExpanded}>
            <Link to={path}>
              <NavigationLinkIcon selected={mainLinkSelected} className="navLinkIcon">
                <svg>
                  <use xlinkHref={iconHref} />
                </svg>
              </NavigationLinkIcon>
              <div className="navLinkTitle">{title}</div>
            </Link>
          </NavigationLinkItem>
        </NavigationLinkContainer>
      )}
    </>
  )
}
