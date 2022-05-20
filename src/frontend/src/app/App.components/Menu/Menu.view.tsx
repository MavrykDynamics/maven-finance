import * as React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import { MainNavigationRoute } from '../../../utils/TypesAndInterfaces/Navigation';
import { ConnectWallet } from '../ConnectWallet/ConnectWallet.controller';
import {
  MenuMobileBurger,
  MenuFooter,
  MenuGrid,
  MenuLogo,
  MenuStyled,
  MenuTopSection,
} from './Menu.style';
import { mainNavigationLinks } from './NavigationLink/MainNavigationLinks';
import { NavigationLink } from './NavigationLink/NavigationLink.controller';

type MenuViewProps = {
  loading: boolean;
  accountPkh?: string;
  ready: boolean;
};

export const MenuView = ({ accountPkh, ready }: MenuViewProps) => {
  const location = useLocation();
  const [isExpanded, setExpanded] = useState<number>(0);
  const [isExpandedMenuMob, setExpandedMenuMob] = useState<boolean>(false);
  const { darkThemeEnabled } = useSelector((state: any) => state.preferences);

  const logoImg = darkThemeEnabled ? '/logo-dark.svg' : '/logo-light.svg';
  const logoMobile = '/logo-mobile.svg';

  const handleToggle = (id: number) => {
    setExpandedMenuMob(true);
    setExpanded(id === isExpanded ? 0 : id);
  };

  return (
    <MenuStyled
      className={`navbar-sticky ${isExpandedMenuMob ? 'menu-expanded' : ''}`}
      onClick={() => {
        setExpanded(0);
        setExpandedMenuMob(false);
      }}
    >
      <MenuTopSection onClick={e => e.stopPropagation()}>
        <MenuMobileBurger
          onClick={e => {
            e.stopPropagation();
            setExpanded(0);
            setExpandedMenuMob(!isExpandedMenuMob);
          }}
          className={'burger-menu'}
        >
          <div></div>
          <div></div>
          <div></div>
        </MenuMobileBurger>
        <Link to="/">
          <MenuLogo alt="logo" className={'desctop-logo'} src={logoImg} />
          <MenuLogo alt="logo" className={'mobile-logo'} src={logoMobile} />
        </Link>
        <ConnectWallet
          // ref={connectWalletRef}
          type={'main-menu'}
        />
        <MenuGrid>
          {mainNavigationLinks.map((navigationLink: MainNavigationRoute, index: number) => {
            const key = `${index}-${navigationLink.path.substring(1)}-${navigationLink.id}`;
            return (
              <NavigationLink
                key={key}
                handleToggle={handleToggle}
                isExpanded={navigationLink.id === isExpanded}
                isMobMenuExpanded={isExpandedMenuMob}
                location={location}
                walletReady={ready}
                accountPkh={accountPkh}
                {...navigationLink}
              />
            );
          })}
        </MenuGrid>

        <MenuFooter>
          MAVRYK App <p>v1.0</p>
        </MenuFooter>
      </MenuTopSection>
    </MenuStyled>
  );
};
