import { ButtonStyled, ButtonText, SlidingTabButtonsStyled } from './SlidingTabButtons.style'
import { TabItem } from './SlidingTabButtons.controller'

type SlidingTabButtonViewProps = {
  onClick: (tabId: number) => void
  activeTab: number
  tabValues: TabItem[]
  className?: string
}

export const SlidingTabButtonsView = ({ onClick, activeTab, tabValues, className = '' }: SlidingTabButtonViewProps) => {
  return (
    <SlidingTabButtonsStyled className={className}>
      {tabValues.map((tabItem) => (
        <TabButton
          key={tabItem.id}
          text={tabItem.text}
          onClick={() => onClick(tabItem.id)}
          buttonActiveStatus={activeTab === tabItem.id}
        />
      ))}
    </SlidingTabButtonsStyled>
  )
}

type TabButtonProps = {
  text: string
  onClick: () => void
  buttonActiveStatus: boolean
}
const TabButton = ({ text, buttonActiveStatus, onClick }: TabButtonProps) => {
  return (
    <ButtonStyled buttonActive={buttonActiveStatus} onClick={onClick}>
      <ButtonText>
        <div>{text}</div>
      </ButtonText>
    </ButtonStyled>
  )
}
