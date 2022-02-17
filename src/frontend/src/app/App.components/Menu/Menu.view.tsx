import { Link, useLocation } from 'react-router-dom'

import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
// prettier-ignore
import { MenuBanner, MenuButton, MenuConnected, MenuFooter, MenuGrid, MenuIcon, MenuLogo, MenuStyled } from "./Menu.style";

type MenuViewProps = {
  loading: boolean
  myMvkTokenBalance?: string
  accountPkh?: string
  handleNewConnect: () => void
  wallet: any
  ready: boolean
  handleConnect: () => void
}

export const MenuView = ({
  loading,
  myMvkTokenBalance,
  accountPkh,
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
      {/* For use of Beacon wallet, comment out below line and remove false section of this conditional */}
      {wallet ? (
        <div>
          {ready ? (
            <MenuConnected>
              <p>
                {accountPkh
                  ? `${accountPkh.slice(0, 7)}...${accountPkh.slice(accountPkh.length - 4, accountPkh.length)}`
                  : 'undefined'}
                <svg onClick={() => handleNewConnect()}>
                  <use xlinkHref="/icons/sprites.svg#switch" />
                </svg>
              </p>
              <CommaNumber value={Number(myMvkTokenBalance || 0)} loading={loading} endingText={'MVK'} />
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

        <Link to="/treasury">
          <MenuIcon selected={location.pathname === '/treasury'}>
            <svg>
              <use xlinkHref="/icons/sprites.svg#treasury" />
            </svg>
            <div>Treasury</div>
          </MenuIcon>
        </Link>

        <Link to="/loans">
          <MenuIcon selected={location.pathname === '/loans'}>
            <svg>
              <use xlinkHref="/icons/sprites.svg#bank" />
            </svg>
            <div>Loans</div>
          </MenuIcon>
        </Link>

        <Link to="/vaults">
          <MenuIcon selected={location.pathname === '/vaults'}>
            <svg>
              <use xlinkHref="/icons/sprites.svg#shop" />
            </svg>
            <div>Vaults</div>
          </MenuIcon>
        </Link>

        <Link to="/satellites">
          <MenuIcon
            selected={
              location.pathname === '/satellites' ||
              location.pathname.startsWith('/satellite-details') ||
              location.pathname === '/become-satellite'
            }
          >
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
