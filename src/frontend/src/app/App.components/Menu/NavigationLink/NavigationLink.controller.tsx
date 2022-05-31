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
import useCollapse from 'react-collapsed'
import { useSelector } from 'react-redux'
import { State } from '../../../../reducers'
import { SubNavigationRoute } from '../../../../utils/TypesAndInterfaces/Navigation'
import { SatelliteRecord } from '../../../../utils/TypesAndInterfaces/Delegation'

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
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const satelliteLedger = delegationStorage?.satelliteLedger
  let navigationLinkClasses = `collapsible .${kind}`
  const iconHref = `/icons/sprites.svg#${icon}`
  const subPagesPaths = [path]
  subPages?.forEach((subPage: SubNavigationRoute, index) => subPagesPaths.push(subPage.subPath))
  let mainLinkSelected = location.pathname === path
  if (subPages) mainLinkSelected = subPagesPaths.includes(location.pathname)

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
