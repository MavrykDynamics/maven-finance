import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link'

// prettier-ignore
import { MenuGrid, MenuLogo, MenuStyled } from "./Menu.style";

export const MenuView = () => {
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
    <MenuStyled showBg={scrollPosition > 10}>
      <MenuGrid>
        <Link to="/">
          <MenuLogo alt="logo" src="/logo.svg" />
        </Link>

        <div />

        <Link to="/litepaper">Litepaper</Link>

        <HashLink
          to="/#calculator"
          scroll={(el) =>
            window.scrollTo({
              behavior: 'smooth',
              top: el.getBoundingClientRect().top + window.pageYOffset - 100,
            })
          }
        >
          Calculator
        </HashLink>
        <HashLink
          to="/#satellites"
          scroll={(el) =>
            window.scrollTo({
              behavior: 'smooth',
              top: el.getBoundingClientRect().top + window.pageYOffset,
            })
          }
        >
          Satellites
        </HashLink>
        <HashLink
          to="/#highlights"
          scroll={(el) =>
            window.scrollTo({
              behavior: 'smooth',
              top: el.getBoundingClientRect().top + window.pageYOffset,
            })
          }
        >
          Highlights
        </HashLink>
        <HashLink
          to="/#tokenomics"
          scroll={(el) =>
            window.scrollTo({
              behavior: 'smooth',
              top: el.getBoundingClientRect().top + window.pageYOffset - 100,
            })
          }
        >
          Tokenomics
        </HashLink>
      </MenuGrid>
    </MenuStyled>
  )
}
