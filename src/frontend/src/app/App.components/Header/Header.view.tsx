import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// prettier-ignore
import { HeaderGrid, HeaderLogo, HeaderStyled } from "./Header.style";

export const HeaderView = () => {
  const [scrollPosition, setScrollPosition] = useState(0)
  const handleScroll = () => {
    const position = window.pageYOffset
    setScrollPosition(position)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <HeaderStyled showBg={scrollPosition > 10}>
      <HeaderGrid>
        <Link to="/">
          <HeaderLogo alt="logo" src="/logo.svg" />
        </Link>

        <div />

        <Link to="/litepaper">Litepaper</Link>
        <Link to="/#calculator" onClick={() => document.getElementById('calculator')?.scrollIntoView()}>
          Calculator
        </Link>
        <Link to="/#satellites" onClick={() => document.getElementById('satellites')?.scrollIntoView()}>
          Satellites
        </Link>
        <Link to="/#highlights" onClick={() => document.getElementById('highlights')?.scrollIntoView()}>
          Highlights
        </Link>
        <Link to="/#tokenomics" onClick={() => document.getElementById('tokenomics')?.scrollIntoView()}>
          Tokenomics
        </Link>
      </HeaderGrid>
    </HeaderStyled>
  )
}
