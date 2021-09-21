import { Link } from 'react-router-dom'

// prettier-ignore
import { HeaderButton, HeaderLogo, HeaderStyled } from "./Header.style";

type HeaderViewProps = {
  balance?: number | null
  accountPkhPreview?: string
  handleNewConnect: () => void
  wallet: any
  ready: boolean
  handleConnect: () => void
}

export const HeaderView = ({
  balance,
  accountPkhPreview,
  handleNewConnect,
  wallet,
  ready,
  handleConnect,
}: HeaderViewProps) => {
  return (
    <HeaderStyled>
      <Link to="/">
        <HeaderLogo alt="logo" src="/logo.svg" />
      </Link>

      <div />

      <Link to="/marketplace">Marketplace</Link>

      <Link to="/create">New canvas</Link>

      {wallet ? (
        <div>
          {ready ? (
            <HeaderButton onClick={handleNewConnect}>{accountPkhPreview}</HeaderButton>
          ) : (
            <HeaderButton onClick={handleConnect}>Connect wallet</HeaderButton>
          )}
        </div>
      ) : (
        <HeaderButton onClick={() => window.open('https://templewallet.com/', '_blank')!.focus()}>
          Install wallet
        </HeaderButton>
      )}
    </HeaderStyled>
  )
}
