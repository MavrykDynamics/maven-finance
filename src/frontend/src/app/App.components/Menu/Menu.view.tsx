import { Link, useLocation } from 'react-router-dom'

// prettier-ignore
import { MenuBanner, MenuButton, MenuConnected, MenuFooter, MenuGrid, MenuIcon, MenuLogo, MenuStyled } from "./Menu.style";

type MenuViewProps = {
  loading: boolean
  myMvkBalance?: number | null
  accountPkhPreview?: string
  handleNewConnect: () => void
  wallet: any
  ready: boolean
  handleConnect: () => void
}

export const MenuView = ({
  loading,
  myMvkBalance,
  accountPkhPreview,
  handleNewConnect,
  wallet,
  ready,
  handleConnect,
}: MenuViewProps) => {
  const location = useLocation()

  return (
    <MenuStyled>
      <Link to="/">
        <MenuLogo alt="logo" src="/logo.svg" />
      </Link>

      {wallet ? (
        <div>
          {ready ? (
            <MenuConnected>
              <p>
                {accountPkhPreview}
                <svg onClick={() => handleNewConnect()}>
                  <use xlinkHref="/icons/sprites.svg#switch" />
                </svg>
              </p>
              <div>{myMvkBalance?.toFixed(2)} MVK</div>
            </MenuConnected>
          ) : (
            <MenuButton onClick={handleConnect}>
              <svg>
                <use xlinkHref="/icons/sprites.svg#wallet" />
              </svg>
              <div>Connect wallet</div>
            </MenuButton>
          )}
        </div>
      ) : (
        <MenuButton onClick={() => window.open('https://templewallet.com/', '_blank')!.focus()}>
          Install wallet
        </MenuButton>
      )}

      <MenuGrid>
        <Link to="/dashboard">
          <MenuIcon selected={location.pathname === '/dashboard'}>
            <svg>
              <use xlinkHref="/icons/sprites.svg#grid" />
            </svg>
            <div>Dashboard</div>
          </MenuIcon>
        </Link>

        <Link to="/">
          <MenuIcon selected={location.pathname === '/'}>
            <svg>
              <use xlinkHref="/icons/sprites.svg#coins" />
            </svg>
            <div>Staking</div>
          </MenuIcon>
        </Link>

        <Link to="/governance">
          <MenuIcon selected={location.pathname === '/governance'}>
            <svg>
              <use xlinkHref="/icons/sprites.svg#hammer" />
            </svg>
            <div>Governance</div>
          </MenuIcon>
        </Link>

        <Link to="/yield-farms">
          <MenuIcon selected={location.pathname === '/yield-farms'}>
            <svg>
              <use xlinkHref="/icons/sprites.svg#plant" />
            </svg>
            <div>Farms</div>
          </MenuIcon>
        </Link>

        <Link to="/exchange">
          <MenuIcon selected={location.pathname === '/exchange'}>
            <svg>
              <use xlinkHref="/icons/sprites.svg#swap" />
            </svg>
            <div>Exchange</div>
          </MenuIcon>
        </Link>

        <Link to="/loan">
          <MenuIcon selected={location.pathname === '/loan'}>
            <svg>
              <use xlinkHref="/icons/sprites.svg#bank" />
            </svg>
            <div>Loan</div>
          </MenuIcon>
        </Link>

        <Link to="/auctions">
          <MenuIcon selected={location.pathname === '/auctions'}>
            <svg>
              <use xlinkHref="/icons/sprites.svg#shop" />
            </svg>
            <div>Auctions</div>
          </MenuIcon>
        </Link>

        <Link to="/satellites">
          <MenuIcon selected={location.pathname === '/satellites'}>
            <svg>
              <use xlinkHref="/icons/sprites.svg#satellite" />
            </svg>
            <div>Satellites</div>
          </MenuIcon>
        </Link>
      </MenuGrid>

      <MenuBanner src="/images/buy-mvk.svg" alt="buy" />

      <MenuFooter>
        MAVRYK App <p>v1.0</p>
      </MenuFooter>
    </MenuStyled>
  )
}
