import Icon from 'app/App.components/Icon/Icon.view'

import { TopBarLinksStyled } from './TopBarLinks.style'

type TopBarLinksProps = {
  groupName: string | JSX.Element
  groupLinks: Array<{ name: string; href: string, disabled: boolean }>
  useClickOpening?: boolean
  selectedLinksBlock?: null | string
  setSelectedLinksBlock?: () => void
  groupNameLink?: string
}

export const TopBarLinks = ({
  groupName,
  groupLinks,
  useClickOpening,
  selectedLinksBlock,
  setSelectedLinksBlock,
  groupNameLink,
}: TopBarLinksProps) => {
  return (
    <TopBarLinksStyled useClickOpening={useClickOpening} selected={selectedLinksBlock === groupName}>
      <div
        className={`group-name ${selectedLinksBlock === groupName ? 'selected' : ''}`}
        onClick={setSelectedLinksBlock}
      >
        {groupNameLink ? (
          <a target="_blank" href={groupNameLink} rel="noreferrer">
            {groupName}
          </a>
        ) : (
          groupName
        )}
        {groupLinks.length ? <Icon id="paginationArrowLeft" /> : null}
      </div>

      {groupLinks.length ? (
        <div className={`group-links ${selectedLinksBlock === groupName ? 'selected' : ''}`}>
          {groupLinks.map(({ name, href, disabled }) => (
            <div className={`link-wrapper ${disabled ? 'disabled' : ''}`} key={name + href}>
              <a className={`${disabled ? 'disabled' : ''}`} href={href} target="_blank" rel="noreferrer">
                {name}
              </a>
            </div>
          ))}
        </div>
      ) : null}
    </TopBarLinksStyled>
  )
}
