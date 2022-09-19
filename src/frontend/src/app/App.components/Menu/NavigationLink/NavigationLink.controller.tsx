import { State } from '../../../../reducers'
import { SatelliteRecord } from '../../../../utils/TypesAndInterfaces/Delegation'
import { SubNavigationRoute } from '../../../../utils/TypesAndInterfaces/Navigation'
import {
  NavigationLinkContainer,
  NavigationLinkIcon,
  NavigationLinkItem,
  NavigationSubLinks,
  SubLinkText,
  SubNavLink,
} from './NavigationLink.style'
import Icon from 'app/App.components/Icon/Icon.view'
import useCollapse from 'react-collapsed'
import { useSelector } from 'react-redux'
import { Link, matchPath } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

type NavigationLinkProps = {
  title: string
  id: number
  path: string
  icon?: string
  subPages?: SubNavigationRoute[]
  handleToggle: () => void
  selectedMainLink: boolean
  showSubPages: boolean
  isMobMenuExpanded: boolean
  accountPkh: string | undefined
}

export const NavigationLink = ({
  title,
  id,
  path,
  icon,
  subPages,
  handleToggle,
  selectedMainLink,
  showSubPages,
  isMobMenuExpanded,
  accountPkh,
}: NavigationLinkProps) => {
  const location = useLocation()

  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const satelliteLedger = delegationStorage?.satelliteLedger

  // TODO: clarify it with Sam
  const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded: selectedMainLink })
  const handleClick = () => handleToggle()

  const mainLink = (
    <Link to={`/${path}`}>
      {icon && (
        <NavigationLinkIcon selected={selectedMainLink} className="navLinkIcon">
          <Icon id={icon} />
        </NavigationLinkIcon>
      )}
      <div className="navLinkTitle">{title}</div>
    </Link>
  )

  if (subPages) {
    return (
      <NavigationLinkContainer
        className={'collapsible'}
        selected={selectedMainLink}
        isMobMenuExpanded={isMobMenuExpanded}
        key={id}
      >
        <NavigationLinkItem
          selected={selectedMainLink}
          isMobMenuExpanded={isMobMenuExpanded}
          className="header"
          {...getToggleProps({ onClick: handleClick })}
        >
          {mainLink}
        </NavigationLinkItem>
        {showSubPages && (
          <div {...getCollapseProps()}>
            <NavigationSubLinks className="content">
              {subPages.map((subNavLink: SubNavigationRoute) => {
                const key = String(subNavLink.id)
                const selectedSubLink = Boolean(
                  matchPath(location.pathname, { path: subNavLink.routeSubPath, exact: true, strict: true }),
                )

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
                        <Link to={`/${subNavLink.subPath}`}>
                          <SubLinkText selected={selectedSubLink}>{subNavLink.subTitle}</SubLinkText>
                        </Link>
                      </SubNavLink>
                    )
                  }

                  return null
                } else {
                  return (
                    <SubNavLink key={key}>
                      <Link to={`/${subNavLink.subPath}`}>
                        <SubLinkText selected={selectedSubLink}>{subNavLink.subTitle}</SubLinkText>
                      </Link>
                    </SubNavLink>
                  )
                }
              })}
            </NavigationSubLinks>
          </div>
        )}
      </NavigationLinkContainer>
    )
  }

  return (
    <NavigationLinkContainer
      key={id}
      selected={selectedMainLink}
      isMobMenuExpanded={isMobMenuExpanded}
      onClick={handleClick}
    >
      <NavigationLinkItem selected={selectedMainLink} isMobMenuExpanded={isMobMenuExpanded}>
        {mainLink}
      </NavigationLinkItem>
    </NavigationLinkContainer>
  )
}
