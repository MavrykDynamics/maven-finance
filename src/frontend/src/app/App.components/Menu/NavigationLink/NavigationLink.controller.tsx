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
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

type NavigationLinkProps = {
  title: string
  id: number
  path: string
  icon?: string
  subPages?: SubNavigationRoute[]
  handleToggle: (id: number) => void
  isExpanded: boolean
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
  isExpanded,
  isMobMenuExpanded,
  accountPkh,
}: NavigationLinkProps) => {
  const key = `${path.substring(1)}-${id}`

  const location = useLocation()

  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const satelliteLedger = delegationStorage?.satelliteLedger
  const mainPagePaths = [path].concat(subPages ? subPages.map(({ subPath }) => subPath) : [])

  const splittedPathname = location.pathname.split('/').slice(1)

  const mainLinkSelected = mainPagePaths.some((path) => splittedPathname.includes(path))

  const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded })

  const handleClick = () => handleToggle(id)

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
            <Link to={`/${path}`}>
              {icon && (
                <NavigationLinkIcon selected={mainLinkSelected} className="navLinkIcon">
                  <Icon id={icon} />
                </NavigationLinkIcon>
              )}
              <div className="navLinkTitle">{title}</div>
            </Link>
          </NavigationLinkItem>
          <div {...getCollapseProps()}>
            <NavigationSubLinks className="content">
              {subPages.map((subNavLink: SubNavigationRoute) => {
                const key = String(subNavLink.id)
                const selectedSubLink = location.pathname === `/${subNavLink.subPath}`
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
                          <div />
                          <SubLinkText className="navLinkSubTitle" selected={selectedSubLink}>
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
                      <Link to={`/${subNavLink.subPath}`}>
                        <div />
                        <SubLinkText className="navLinkSubTitle" selected={selectedSubLink}>
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
            <Link to={`/${path}`}>
              {icon && (
                <NavigationLinkIcon selected={mainLinkSelected} className="navLinkIcon">
                  <Icon id={icon} />
                </NavigationLinkIcon>
              )}
              <div className="navLinkTitle">{title}</div>
            </Link>
          </NavigationLinkItem>
        </NavigationLinkContainer>
      )}
    </>
  )
}
