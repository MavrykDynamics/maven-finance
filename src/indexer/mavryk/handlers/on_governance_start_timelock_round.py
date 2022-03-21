
from mavryk.types.governance.parameter.start_timelock_round import StartTimelockRoundParameter
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_start_timelock_round(
    ctx: HandlerContext,
    start_timelock_round: Transaction[StartTimelockRoundParameter, GovernanceStorage],
) -> None:
    # Get operation values
    governanceAddress                       = start_timelock_round.data.target_address
    governanceCurrentRound                  = start_timelock_round.storage.currentRound
    governanceCurrentRoundStartLevel        = int(start_timelock_round.storage.currentRoundStartLevel)
    governanceCurrentRoundEndLevel          = int(start_timelock_round.storage.currentRoundEndLevel)
    governanceTimelockProposalID            = int(start_timelock_round.storage.currentRoundHighestVotedProposalId)

    # Current round
    governanceRoundType = models.GovernanceRoundType.NONE
    if governanceCurrentRound == "proposal":
        governanceRoundType = models.GovernanceRoundType.PROPOSAL
    elif governanceCurrentRound == "timelock":
        governanceRoundType = models.GovernanceRoundType.TIMELOCK
    elif governanceCurrentRound == "voting":
        governanceRoundType = models.GovernanceRoundType.VOTING

    # Update record
    governance  = await models.Governance.get(
        address = governanceAddress
    )
    governance.current_round                = governanceRoundType
    governance.current_round_start_level    = governanceCurrentRoundStartLevel
    governance.current_round_end_level      = governanceCurrentRoundEndLevel
    await governance.save()

    proposalRecord  = await models.GovernanceProposalRecord.get(
        id  = governanceTimelockProposalID
    )
    proposalRecord.timelock_proposal = True
    await proposalRecord.save()
