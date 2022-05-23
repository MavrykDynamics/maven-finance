import styled from 'styled-components/macro';
import { MavrykTheme } from '../../../styles/interfaces';
import { Card, CardHeader } from 'styles';

export const SatelliteSideBarStyled = styled(Card)`
  padding: 24px 0;
  margin-top: 0;

  h2 {
    font-weight: 700;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.headerColor};
  }
`;

export const SideBarSection = styled.aside<{ theme: MavrykTheme }>`
  padding: 0 20px;
  border-bottom: 1px solid ${({ theme }) => theme.cardBorderColor};
  padding-bottom: 31px;

  button {
    margin-bottom: 38px;
  }
`;

export const FAQLink = styled.div<{ theme: MavrykTheme }>`
  font-size: 14px;
  color: ${({ theme }) => theme.headerColor};
  margin: 14px 0;

  &.BG-faq-link {
    margin-top: 10px;
  }

  > a {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.headerColor};
    text-decoration: underline;
  }
`;

export const SideBarItem = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: ${({ theme }) => theme.subTextColor};
  align-items: center;
  margin-top: 10px;
  margin-bottom: 9px;
  height: 14px;

  h3 {
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: ${({ theme }) => theme.headerSkyColor};
  }

  var {
    max-width: 50%;

    * {
      font-style: normal;
      font-weight: 600;
      font-size: 12px;
      line-height: 12px;
      color: ${({ theme }) => theme.valueColor};
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;

      svg {
        stroke: ${({ theme }) => theme.valueColor};
        width: 16px;
        margin-left: 8px;
      }
    }
  }
`;

export const SideBarFaq = styled.div<{ theme: MavrykTheme }>`
  padding: 0 20px;
  padding-top: 26px;
  padding-bottom: 21px;
`;
