import { ConnectWallet } from 'app/App.components/ConnectWallet/ConnectWallet.controller'
import React, { useState } from 'react'
import { MobileTopBarStyled } from '../MenuTopBar.style'
import { TopBarLinks } from './TopBarLinks.controller'

export const MobileTopBar = ({ show }: { show: boolean }) => {
  const [selectedLinksBlock, setSelectedLinksBlock] = useState<null | string>(null)
  return (
    <MobileTopBarStyled show={show}>
      <ConnectWallet />

      <div className="container">
        <TopBarLinks
          groupName={'Products'}
          groupLinks={[
            { name: 'Dapp', href: '/' },
            { name: 'Liquidity Baking', href: '/' },
            { name: 'Mavryk Bakery', href: '/' },
            { name: 'DAO Bakery', href: '/' },
          ]}
          useClickOpening
          selectedLinksBlock={selectedLinksBlock}
          setSelectedLinksBlock={() => {
            setSelectedLinksBlock(selectedLinksBlock === 'Products' ? null : 'Products')
          }}
        />
        <TopBarLinks
          groupName={'About'}
          groupLinks={[
            { name: 'Who we are', href: 'https://mavryk.finance/' },
            { name: 'MVK Token', href: '/' },
            { name: 'Team', href: '/' },
            { name: 'Roadmap', href: '/' },
          ]}
          useClickOpening
          selectedLinksBlock={selectedLinksBlock}
          setSelectedLinksBlock={() => {
            setSelectedLinksBlock(selectedLinksBlock === 'About' ? null : 'About')
          }}
        />
        <TopBarLinks
          groupName={'Blog 🔥'}
          groupLinks={[]}
          useClickOpening
          selectedLinksBlock={selectedLinksBlock}
          setSelectedLinksBlock={() => {
            setSelectedLinksBlock(selectedLinksBlock === 'products' ? null : 'products')
          }}
        />
        <TopBarLinks
          groupName={'Docs'}
          groupLinks={[
            { name: 'Litepaper', href: 'https://mavryk.finance/litepaper' },
            { name: 'DAO docs', href: '/' },
            { name: 'Security Audits', href: '/' },
            { name: 'Github', href: 'https://github.com/mavrykfinance/' },
          ]}
          useClickOpening
          selectedLinksBlock={selectedLinksBlock}
          setSelectedLinksBlock={() => {
            setSelectedLinksBlock(selectedLinksBlock === 'Docs' ? null : 'Docs')
          }}
          isLast
        />
      </div>
    </MobileTopBarStyled>
  )
}
