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
  let navigationLinkClasses = kind
  const iconHref = `/icons/sprites.svg#${icon}`
  const selected = location.pathname === path

  const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded })

  const handleClick = () => {
    handleToggle(id)
  }
  return (
    <>
      {subPages ? (
        <NavigationLinkContainer className="collapsible" key={id}>
          <NavigationLinkItem selected={selected} className="header" {...getToggleProps({ onClick: handleClick })}>
            <Link to={path}>
              <NavigationLinkIcon selected={selected} id="navLinkIcon">
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
                  <Link to={subNavLink.subPath}>
                    <SubNavLink selected={location.pathname === subNavLink.subPath}>
                      <div />
                      <SubLinkText>{subNavLink.subTitle}</SubLinkText>
                    </SubNavLink>
                  </Link>
                )
              })}
            </NavigationSubLinks>
          </div>
        </NavigationLinkContainer>
      ) : (
        <NavigationLinkItem selected={selected}>
          <Link to={path}>
            <NavigationLinkIcon selected={selected} id="navLinkIcon">
              <svg>
                <use xlinkHref={iconHref} />
              </svg>
            </NavigationLinkIcon>
            <div id="navLinkTitle">{title}</div>
          </Link>
        </NavigationLinkItem>
      )}
    </>
  )
}
