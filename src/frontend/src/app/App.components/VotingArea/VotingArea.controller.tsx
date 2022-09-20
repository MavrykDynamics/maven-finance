import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'

// types
import { State } from 'reducers'
import { calcWithoutPrecision } from 'utils/calcFunctions'
import { PRECISION_NUMBER } from 'utils/constants'
import { SUBMIT } from '../Button/Button.constants'
import { Button } from '../Button/Button.controller'
import { ConnectWallet } from '../ConnectWallet/ConnectWallet.controller'
import { VotingProps } from './helpers/voting'
import { VotingAreaStyled, VotingButtonsContainer } from './VotingArea.style'
import { VotingBar } from './VotingBar.controller'

// styles

export const VotingArea = ({
  selectedProposal,
  showVotingButtons = true,
  handleVote,
  isVotingActive,
  voteStatistics,
}: VotingProps) => {
  const { governancePhase } = useSelector((state: State) => state.governance)
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)
  const { mvkTokenStorage } = useSelector((state: State) => state.mvkToken)
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const isUserSatellite = useMemo(
    () => Boolean(satelliteLedger.find(({ address }) => address === accountPkh)),
    [accountPkh, satelliteLedger],
  )

  const votingButtons = true ? (
    <VotingButtonsContainer>
      <Button text={'Vote YES'} onClick={() => handleVote('FOR')} type={SUBMIT} kind={'votingFor'} />
      <Button text={'Vote PASS'} onClick={() => handleVote('ABSTAIN')} type={SUBMIT} kind={'votingAbstain'} />
      <Button text={'Vote NO'} onClick={() => handleVote('AGAINST')} type={SUBMIT} kind={'votingAgainst'} />
    </VotingButtonsContainer>
  ) : (
    <ConnectWallet />
  )

  return (
    <VotingAreaStyled>
      <VotingBar voteStatistics={voteStatistics} />
      {true ? votingButtons : null}
    </VotingAreaStyled>
  )
}
