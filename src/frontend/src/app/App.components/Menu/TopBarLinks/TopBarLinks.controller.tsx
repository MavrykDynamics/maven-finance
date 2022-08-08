import Icon from 'app/App.components/Icon/Icon.view'
import React from 'react'

import { TopBarLinksStyled } from './TopBarLinks.style'

type TopBarLinksProps = {
  groupName: string | JSX.Element
  groupLinks: Array<{ name: string; href: string }>
}

export const TopBarLinks = ({ groupName, groupLinks }: TopBarLinksProps) => {
  return (
    <TopBarLinksStyled>
      <div className="group-name">
        {groupName}{' '}
        {groupLinks.length ? (
          <Icon id="paginationArrowLeft" />
        ) : null}
      </div>

      {groupLinks.length ? (
        <div className="group-links">
          {groupLinks.map(({ name, href }) => (
            <a href={href} key={name + href}>{name}</a>
          ))}
        </div>
      ) : null}
    </TopBarLinksStyled>
  )
}
