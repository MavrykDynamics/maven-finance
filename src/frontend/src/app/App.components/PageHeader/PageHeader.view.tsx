// view
import ConnectWalletInfo from '../../../app/App.components/ConnectWallet/ConnectWalletInfo.view'

// style
import {
  PageHeaderForegroundImage,
  PageHeaderForegroundImageContainer,
  PageHeaderStyled,
  PageHeaderTextArea,
} from './PageHeader.style'

type PageHeaderViewProps = {
  page: string
  title: string
  subText: string
  backgroundImageSrc?: string
  foregroundImageSrc?: string
}

export const PageHeaderView = ({
  page,
  title,
  subText,
  foregroundImageSrc,
  backgroundImageSrc,
}: PageHeaderViewProps) => {
  return (
    <>
      <PageHeaderStyled backgroundImageSrc={backgroundImageSrc || ''}>
        <PageHeaderTextArea>
          <h1>{title}</h1>
          <p>{subText}</p>
        </PageHeaderTextArea>
        <PageHeaderForegroundImageContainer>
          <PageHeaderForegroundImage page={page} src={foregroundImageSrc || '/images/portal.svg'} alt="portal" />
        </PageHeaderForegroundImageContainer>
      </PageHeaderStyled>
      <ConnectWalletInfo />
    </>
  )
}
