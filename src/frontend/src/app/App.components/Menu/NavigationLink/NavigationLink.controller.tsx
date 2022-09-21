import React, { useEffect, useMemo, useState } from 'react'
import useCollapse from 'react-collapsed'
import { useSelector } from 'react-redux'
import { Link, matchPath } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

// types
import { State } from '../../../../reducers'
import { SubNavigationRoute } from '../../../../utils/TypesAndInterfaces/Navigation'

// styles
import {
  NavigationLinkContainer,
  NavigationLinkIcon,
  NavigationLinkItem,
  NavigationSubLinks,
  SubLinkText,
  SubNavLink,
} from './NavigationLink.style'

// costants
import { isSubLinkShown } from './NavigationLink.constants'

// view
import Icon from 'app/App.components/Icon/Icon.view'

const Sublink = ({ subNavLink, isSelected }: { subNavLink: SubNavigationRoute; isSelected: boolean }) => (
  <SubNavLink>
    <Link to={`/${subNavLink.subPath}`}>
      <SubLinkText selected={isSelected}>{subNavLink.subTitle}</SubLinkText>
    </Link>
  </SubNavLink>
)

type NavigationLinkProps = {
  title: string
  id: number
  path: string
  icon?: string
  subPages?: SubNavigationRoute[]
  selectedMainLink: number
  isMobMenuExpanded: boolean
  accountPkh?: string
}

export const NavigationLink = ({
  title,
  id,
  path,
  icon,
  subPages,
  selectedMainLink,
  isMobMenuExpanded,
  accountPkh,
}: NavigationLinkProps) => {
  const location = useLocation()
  const {
    delegationStorage: { satelliteLedger },
  } = useSelector((state: State) => state.delegation)

  const [showSubPages, setShowSubPages] = useState<boolean>(false)

  const isMainLinkDisabled = useMemo(() => {
    const paths = [path].concat(subPages?.map(({ subPath }) => subPath) || [])
    return paths.find((path) => Boolean(matchPath(location.pathname, { path: `/${path}`, exact: true, strict: true })))
  }, [location.pathname])

  useEffect(() => {
    setShowSubPages(id === selectedMainLink)
  }, [selectedMainLink])

  const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded: showSubPages })

  const mainLink = (
    <Link
      to={`/${path}`}
      onClick={(e: React.MouseEvent | React.TouchEvent) => isMainLinkDisabled && e.preventDefault()}
    >
      {icon && (
        <NavigationLinkIcon selected={selectedMainLink === id} className="navLinkIcon">
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
        selected={selectedMainLink === id}
        isMobMenuExpanded={isMobMenuExpanded}
        key={id}
      >
        <NavigationLinkItem
          selected={selectedMainLink === id}
          isMobMenuExpanded={isMobMenuExpanded}
          className="header"
          {...getToggleProps({ onClick: () => setShowSubPages(!showSubPages) })}
        >
          {mainLink}
        </NavigationLinkItem>
        {showSubPages && (
          <div {...getCollapseProps()}>
            <NavigationSubLinks className="content">
              {subPages.map((subNavLink: SubNavigationRoute) => {
                const selectedSubLink = Boolean(
                  matchPath(location.pathname, { path: subNavLink.routeSubPath, exact: true, strict: true }),
                )
                const showSublink = isSubLinkShown(subNavLink, satelliteLedger, accountPkh)

                return showSublink ? (
                  <Sublink key={subNavLink.id} subNavLink={subNavLink} isSelected={selectedSubLink} />
                ) : null
              })}
            </NavigationSubLinks>
          </div>
        )}
      </NavigationLinkContainer>
    )
  }

  return (
    <NavigationLinkContainer key={id} selected={selectedMainLink === id} isMobMenuExpanded={isMobMenuExpanded}>
      <NavigationLinkItem selected={selectedMainLink === id} isMobMenuExpanded={isMobMenuExpanded}>
        {mainLink}
      </NavigationLinkItem>
    </NavigationLinkContainer>
  )
}
