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
import { checkIfLinkSelected, isSubLinkShown } from './NavigationLink.constants'

// view
import Icon from 'app/App.components/Icon/Icon.view'

const Sublink = ({ subNavLink, isSelected }: { subNavLink: SubNavigationRoute; isSelected: boolean }) => (
  <SubNavLink disabled={subNavLink.disabled}>
    <Link to={`/${subNavLink.subPath}`} className={subNavLink.disabled ? 'disabled' : ''}>
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
  disabled?: boolean
}

export const NavigationLink = ({
  title,
  id,
  path,
  icon,
  subPages = [],
  selectedMainLink,
  isMobMenuExpanded,
  accountPkh,
  disabled,
}: NavigationLinkProps) => {
  const { pathname } = useLocation()
  const {
    delegationStorage: { satelliteLedger },
  } = useSelector((state: State) => state.delegation)
  const [showSubPages, setShowSubPages] = useState<boolean>(false)

  const isMainLinkDisabled = useMemo(() => {
    const paths = subPages.reduce((acc, { routeSubPath }) => acc.concat(routeSubPath), [`/${path}`])
    return paths.find((path) => matchPath(pathname, { path, exact: true, strict: true }))
  }, [pathname])

  useEffect(() => {
    setShowSubPages(id === selectedMainLink)
  }, [selectedMainLink])

  const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded: showSubPages })

  const mainLink = (
    <Link
      className={`${disabled ? 'disabled' : ''}`}
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
        className={`collapsible`}
        selected={selectedMainLink === id}
        isMobMenuExpanded={isMobMenuExpanded}
        key={id}
      >
        <NavigationLinkItem
          selected={selectedMainLink === id}
          isMobMenuExpanded={isMobMenuExpanded}
          className="header"
          {...getToggleProps({ onClick: () => (!disabled ? setShowSubPages(!showSubPages) : null) })}
          disabled={disabled}
        >
          {mainLink}
        </NavigationLinkItem>
        {showSubPages && (
          <div {...getCollapseProps()}>
            <NavigationSubLinks className="content">
              {subPages.map((subNavLink: SubNavigationRoute) => {
                const selectedSubLink = checkIfLinkSelected(pathname, subNavLink.routeSubPath)
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
      <NavigationLinkItem selected={selectedMainLink === id} isMobMenuExpanded={isMobMenuExpanded} disabled={disabled}>
        {mainLink}
      </NavigationLinkItem>
    </NavigationLinkContainer>
  )
}
