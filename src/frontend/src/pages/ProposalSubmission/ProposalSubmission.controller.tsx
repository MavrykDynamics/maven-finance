import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

// view
import { MultyProposalItem } from './MultyProposals/MultyProposals.controller'
import { ProposalSubmissionView } from './ProposalSubmission.view'

// types
import { State } from 'reducers'
import { CurrentRoundProposalsStorageType } from 'utils/TypesAndInterfaces/Governance'

// helpers
import { DEFAULT_PROPOSAL } from './ProposalSubmition.helpers'

export type SubmittedProposalsMapper = {
  keys: number[]
  mapper: Record<number, CurrentRoundProposalsStorageType[number]>
}

export type ChangeProposalFnType = (
  newProposalData: Partial<CurrentRoundProposalsStorageType[number]>,
  proposalId: number,
) => void

export const ProposalSubmission = () => {
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { currentRoundProposals } = useSelector((state: State) => state.governance)
  const [activeTab, setActiveTab] = useState<number>(1)
  const [selectedUserProposalId, setSeletedUserProposalId] = useState<number>(-1)

  // proposals that user has submitted, reduced to object mapper and arr of keys for this object
  const [proposalKeys, mappedProposals] = useMemo(() => {
    const { keys, mapper } = currentRoundProposals
      .filter((item) => item.proposerId === accountPkh)
      .reduce<SubmittedProposalsMapper>(
        (acc, proposal) => {
          acc.mapper[proposal.id] = proposal
          acc.keys.push(proposal.id)
          return acc
        },
        { keys: [], mapper: {} },
      )
    setSeletedUserProposalId(keys?.[0])
    return [keys, mapper]
  }, [accountPkh, currentRoundProposals])

  // mapping user created proposals to buttons data
  const usersProposalsToSwitch = useMemo(
    () =>
      (proposalKeys || [])
        .map<MultyProposalItem>((id) => ({
          text: mappedProposals[id].title,
          active: id === selectedUserProposalId,
          value: id,
        }))
        .concat(
          proposalKeys.length < 2
            ? [{ text: 'Create new Proposal', active: selectedUserProposalId === -1, value: -1 }]
            : [],
        ),
    [selectedUserProposalId, proposalKeys, mappedProposals],
  )

  const [proposalState, setProposalsState] = useState(mappedProposals)

  const handleChangeTab = useCallback((tabId?: number) => {
    setActiveTab(tabId ?? 0)
  }, [])

  const changeActiveProposal = useCallback(
    (proposalId: number) => {
      setSeletedUserProposalId(proposalId)

      // it means that we choose create new proposal
      if (proposalId === -1 && !proposalState[-1]) {
        setProposalsState({
          ...proposalState,
          [DEFAULT_PROPOSAL.id]: DEFAULT_PROPOSAL,
        })
      }
    },
    [proposalState],
  )

  const changeProposalData = useCallback(
    (newProposalData: Partial<CurrentRoundProposalsStorageType[number]>, proposalId: number) => {
      setProposalsState({
        ...proposalState,
        [proposalId]: {
          ...proposalState[proposalId],
          ...newProposalData,
        },
      })
    },
    [proposalState],
  )

  useEffect(() => {
    setProposalsState(mappedProposals)
  }, [mappedProposals])

  console.log('proposalState parent el:', proposalState)

  return (
    <ProposalSubmissionView
      activeTab={activeTab}
      handleChangeTab={handleChangeTab}
      multyProposalsItems={usersProposalsToSwitch}
      changeActiveProposal={changeActiveProposal}
      currentProposalId={selectedUserProposalId}
      userSubmittedProposalsData={proposalState}
      updateLocalProposalData={changeProposalData}
    />
  )
}
