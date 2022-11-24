import styled from 'styled-components'

export const DashboardPersonalStyled = styled.div`
  margin-top: 30px;
  .top {
    display: flex;
    column-gap: 20px;
  }

  .tabs-switchers {
    display: flex;
    margin: 30px 0 15px 0;
    column-gap: 15px;

    > a {
      font-size: 16px;
      font-weight: 600;
      position: relative;
      transition: 0.3s all;
      color: ${({ theme }) => theme.navTitleColor};

      &.selected,
      &:hover {
        &:before {
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          transition: 0.3s all;
          content: '';
          width: 30px;
          height: 1px;
          background-color: ${({ theme }) => theme.navLinkSubTitleActive};
        }
        color: ${({ theme }) => theme.navLinkSubTitleActive};
      }
    }
  }
`
