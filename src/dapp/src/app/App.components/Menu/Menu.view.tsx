import { Link } from 'react-router-dom'

// prettier-ignore
import { MenuButton, MenuLogo, MenuStyled } from "./Menu.style";

type MenuViewProps = {
  balance?: number | null
  accountPkhPreview?: string
  handleNewConnect: () => void
  wallet: any
  ready: boolean
  handleConnect: () => void
}

export const MenuView = ({
  balance,
  accountPkhPreview,
  handleNewConnect,
  wallet,
  ready,
  handleConnect,
}: MenuViewProps) => {
  return (
    <MenuStyled>
      <Link to="/">
        <MenuLogo alt="logo" src="/logo.svg" />
      </Link>

      <div />

      <Link to="/dashboard">Dashboard</Link>
      <Link to="/">Staking</Link>

      {wallet ? (
        <div>
          {ready ? (
            <MenuButton onClick={handleNewConnect}>{accountPkhPreview}</MenuButton>
          ) : (
            <MenuButton onClick={handleConnect}>Connect wallet</MenuButton>
          )}
        </div>
      ) : (
        <MenuButton onClick={() => window.open('https://templewallet.com/', '_blank')!.focus()}>
          Install wallet
        </MenuButton>
      )}
    </MenuStyled>
  )
}
