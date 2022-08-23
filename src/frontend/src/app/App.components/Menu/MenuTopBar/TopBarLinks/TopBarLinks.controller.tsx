import Icon from 'app/App.components/Icon/Icon.view'

import { TopBarLinksStyled } from './TopBarLinks.style'

type TopBarLinksProps = {
  groupName: string | JSX.Element
  groupLinks: Array<{ name: string; href: string }>
  useClickOpening?: boolean
  selectedLinksBlock?: null | string
  setSelectedLinksBlock?: () => void
}

export const TopBarLinks = ({
  groupName,
  groupLinks,
  useClickOpening,
  selectedLinksBlock,
  setSelectedLinksBlock,
}: TopBarLinksProps) => {
  return (
    <TopBarLinksStyled useClickOpening={useClickOpening} selected={selectedLinksBlock === groupName}>
      <div
        className={`group-name ${selectedLinksBlock === groupName ? 'selected' : ''}`}
        onClick={setSelectedLinksBlock}
      >
        {groupName} {groupLinks.length ? <Icon id="paginationArrowLeft" /> : null}
      </div>

      {groupLinks.length ? (
        <div className={`group-links ${selectedLinksBlock === groupName ? 'selected' : ''}`}>
          {groupLinks.map(({ name, href }) => (
            <a href={href} key={name + href}>
              {name}
            </a>
          ))}
        </div>
      ) : null}
    </TopBarLinksStyled>
  )
}
