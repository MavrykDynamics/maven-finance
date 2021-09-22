import { Link } from 'react-router-dom'

// prettier-ignore
import { HeaderLogo, HeaderStyled } from "./Header.style";

export const HeaderView = () => {
  return (
    <HeaderStyled>
      <Link to="/">
        <HeaderLogo alt="logo" src="/logo.svg" />
      </Link>

      <div />

      <Link to="/litepaper">Litepaper</Link>
      <Link to="/#calculator">Calculator</Link>
      <Link to="/#satellites">Satellites</Link>
      <Link to="/#highlights">Highlights</Link>
      <Link to="/#tokenomics">Tokenomics</Link>
    </HeaderStyled>
  )
}
