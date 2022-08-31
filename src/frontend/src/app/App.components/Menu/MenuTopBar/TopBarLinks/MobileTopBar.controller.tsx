import { ConnectWallet } from 'app/App.components/ConnectWallet/ConnectWallet.controller'
import React, { useState } from 'react'
import { ABOUT_LINKS, BLOG_LINKS, DOCS_LINKS, PRODUCTS_LINKS, SocialIcons } from '../MenuTopBar.controller'
import { MobileTopBarStyled } from '../MenuTopBar.style'
import { TopBarLinks } from './TopBarLinks.controller'

export const MobileTopBar = ({
  show,
  closeMobileMenu,
}: {
  show: boolean
  closeMobileMenu: (e: React.MouseEvent<HTMLElement>) => void
}) => {
  const [selectedLinksBlock, setSelectedLinksBlock] = useState<null | string>(null)
  return (
    <MobileTopBarStyled show={show}>
      <ConnectWallet closeMobileMenu={closeMobileMenu} />

      <div className="container">
        <TopBarLinks
          groupName={'Products'}
          groupLinks={PRODUCTS_LINKS}
          useClickOpening
          selectedLinksBlock={selectedLinksBlock}
          setSelectedLinksBlock={() => {
            setSelectedLinksBlock(selectedLinksBlock === 'Products' ? null : 'Products')
          }}
        />
        <TopBarLinks
          groupName={'About'}
          groupLinks={ABOUT_LINKS}
          useClickOpening
          selectedLinksBlock={selectedLinksBlock}
          setSelectedLinksBlock={() => {
            setSelectedLinksBlock(selectedLinksBlock === 'About' ? null : 'About')
          }}
        />
        <TopBarLinks groupName={'Blog 🔥'} groupLinks={BLOG_LINKS} useClickOpening />
        <TopBarLinks
          groupName={'Docs'}
          groupLinks={DOCS_LINKS}
          useClickOpening
          selectedLinksBlock={selectedLinksBlock}
          setSelectedLinksBlock={() => {
            setSelectedLinksBlock(selectedLinksBlock === 'Docs' ? null : 'Docs')
          }}
        />

        <SocialIcons />
      </div>
    </MobileTopBarStyled>
  )
}
