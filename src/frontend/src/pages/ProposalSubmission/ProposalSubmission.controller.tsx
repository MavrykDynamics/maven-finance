import { useCallback, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { CurrentRoundProposalsStorageType } from 'utils/TypesAndInterfaces/Governance'
import { ProposalSubmissionView } from './ProposalSubmission.view'

export const ProposalSubmission = () => {
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { currentRoundProposals } = useSelector((state: State) => state.governance)
  const [activeTab, setActiveTab] = useState<number>(1)
  const [selectedUserProposal, setSeletedUserProposal] = useState<
    undefined | CurrentRoundProposalsStorageType[number]
  >()

  const userCreatedProposals = useMemo(() => {
    const userProposals = currentRoundProposals.filter((item) => item.proposerId === accountPkh)
    setSeletedUserProposal(userProposals?.[0])
    return userProposals
  }, [accountPkh, currentRoundProposals])

  const usersProposalsToSwitch = useMemo(
    () =>
      (userCreatedProposals || []).map(({ id, title, locked }) => ({
        text: title,
        id,
        active: id === selectedUserProposal?.id,
        isDisabled: locked,
      })),
    [selectedUserProposal?.id, userCreatedProposals],
  )

  const handleChangeTab = (tabId?: number) => {
    setActiveTab(tabId ?? 0)
  }

  const createNewProposalHander = useCallback(() => {
    setSeletedUserProposal(undefined)
  }, [])

  const changeActiveProposal = useCallback(
    (proposalId: number) => {
      setSeletedUserProposal(currentRoundProposals.find(({ id }) => id === proposalId))
    },
    [currentRoundProposals],
  )

  return (
    <ProposalSubmissionView
      activeTab={activeTab}
      handleChangeTab={handleChangeTab}
      multyProposalsItems={usersProposalsToSwitch}
      createNewProposalHander={createNewProposalHander}
      changeActiveProposal={changeActiveProposal}
      userCreatedProposals={userCreatedProposals}
      currentProposal={selectedUserProposal}
    />
  )
}
