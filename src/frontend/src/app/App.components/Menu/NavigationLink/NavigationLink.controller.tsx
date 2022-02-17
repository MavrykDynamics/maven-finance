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
import { SubNavigationLink } from '../../../../styles/interfaces'
import useCollapse from 'react-collapsed'
import { useState } from 'react'

type NavigationLinkProps = {
  title: string
  id: number
  path: string
  icon?: string
  subPages?: SubNavigationLink[]
  kind?: NavigationLinkStyle
  location: any
  handleToggle: (id: number) => void
  isExpanded: boolean
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
}: NavigationLinkProps) => {
  let navigationLinkClasses = `collapsible .${kind}`
  const iconHref = `/icons/sprites.svg#${icon}`
  const subPagesPaths = [path]
  subPages?.forEach((subPage: SubNavigationLink, index) => subPagesPaths.push(subPage.subPath))
  let mainLinkSelected = location.pathname === path
  if (subPages) mainLinkSelected = subPagesPaths.includes(location.pathname)

  const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded })

  const handleClick = () => {
    handleToggle(id)
  }
  return (
    <>
      {subPages ? (
        <NavigationLinkContainer className={'collapsible'} key={id} selected={mainLinkSelected}>
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
              {subPages.map((subNavLink: SubNavigationLink, index: number) => {
                return (
                  <SubNavLink>
                    <Link to={subNavLink.subPath}>
                      <div />
                      <SubLinkText selected={location.pathname === subNavLink.subPath}>
                        {subNavLink.subTitle}
                      </SubLinkText>
                    </Link>
                  </SubNavLink>
                )
              })}
            </NavigationSubLinks>
          </div>
        </NavigationLinkContainer>
      ) : (
        <NavigationLinkContainer key={id} selected={mainLinkSelected}>
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
