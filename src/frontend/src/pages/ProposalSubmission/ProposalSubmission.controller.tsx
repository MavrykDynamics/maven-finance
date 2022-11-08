import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PropSubmissionTopBar } from './PropSubmissionTopBar/PropSubmissionTopBar.controller'
import { StageOneForm } from './StageOneForm/StageOneForm.controller'
import { StageThreeForm } from './StageThreeForm/StageThreeForm.controller'
import { StageTwoForm } from './StageTwoForm/StageTwoForm.controller'
import { MultyProposalItem, MultyProposals } from './MultyProposals/MultyProposals.controller'
import { ProposalSubmissionForm } from './ProposalSubmission.style'
import { Page } from 'styles'

// types
import { State } from 'reducers'
import { CurrentRoundProposalsStorageType } from 'utils/TypesAndInterfaces/Governance'
import { ProposalChangesStateType, SubmittedProposalsMapper } from './ProposalSybmittion.types'

// helpers
import { DEFAULT_PROPOSAL } from './ProposalSubmition.helpers'
import { dropProposal, lockProposal } from './ProposalSubmission.actions'

export const ProposalSubmission = () => {
  const dispatch = useDispatch()

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
  const [proposalHasChange, setProposalHasChange] = useState(false)
  const currentOriginalProposal = useMemo(
    () => currentRoundProposals.find(({ id }) => selectedUserProposalId === id),
    [selectedUserProposalId],
  )

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
          ...(proposalState[DEFAULT_PROPOSAL.id]
            ? { [DEFAULT_PROPOSAL.id - 1]: DEFAULT_PROPOSAL }
            : { [DEFAULT_PROPOSAL.id]: DEFAULT_PROPOSAL }),
        })
      }
    },
    [proposalState],
  )

  const updateLocalProposalData = useCallback(
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

  const handleLockProposal = (proposalId: number) => {
    dispatch(lockProposal(proposalId))
  }

  const handleDropProposal = async (proposalId: number) => {
    if (proposalId && proposalId !== -1) await dispatch(dropProposal(proposalId))
  }

  // if user removed all his submitted proposals, show him create proposal tab with empty proposal form to fill up
  useEffect(() => {
    setProposalsState(
      proposalKeys.length
        ? mappedProposals
        : {
            [DEFAULT_PROPOSAL.id]: DEFAULT_PROPOSAL,
          },
    )
    setSeletedUserProposalId(proposalKeys?.[0] ?? DEFAULT_PROPOSAL.id)
  }, [mappedProposals, proposalKeys])

  const currentProposal = useMemo(
    () => proposalState[selectedUserProposalId] ?? {},
    [proposalState, selectedUserProposalId],
  )

  // TODO: for testing purposes, remove after
  console.log('proposalState:', proposalState)

  return (
    <Page>
      <PageHeader page={'proposal submission'} />
      <MultyProposals switchItems={usersProposalsToSwitch} switchProposal={changeActiveProposal} />
      <PropSubmissionTopBar value={activeTab} valueCallback={handleChangeTab} />

      <ProposalSubmissionForm>
        {activeTab === 1 && (
          <StageOneForm
            proposalId={selectedUserProposalId}
            currentProposal={currentProposal}
            updateLocalProposalData={updateLocalProposalData}
            handleDropProposal={handleDropProposal}
          />
        )}
        {activeTab === 2 && (
          <StageTwoForm
            proposalId={selectedUserProposalId}
            currentProposal={currentProposal}
            updateLocalProposalData={updateLocalProposalData}
            handleDropProposal={handleDropProposal}
            proposalHasChange={proposalHasChange}
            setProposalHasChange={setProposalHasChange}
            currentOriginalProposal={currentOriginalProposal}
          />
        )}
        {activeTab === 3 && (
          <StageThreeForm
            proposalId={selectedUserProposalId}
            currentProposal={currentProposal}
            updateLocalProposalData={updateLocalProposalData}
            handleDropProposal={handleDropProposal}
            handleLockProposal={handleLockProposal}
          />
        )}
      </ProposalSubmissionForm>
    </Page>
  )
}
