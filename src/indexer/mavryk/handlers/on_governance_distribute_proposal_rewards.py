from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance.parameter.distribute_proposal_rewards import DistributeProposalRewardsParameter
from mavryk.types.governance.storage import GovernanceStorage
import mavryk.models as models

async def on_governance_distribute_proposal_rewards(
    ctx: HandlerContext,
    distribute_proposal_rewards: Transaction[DistributeProposalRewardsParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation info
        governance_address  = distribute_proposal_rewards.data.target_address
        satellite_address   = distribute_proposal_rewards.parameter.satelliteAddress
        proposal_ids        = distribute_proposal_rewards.parameter.proposalIds
    
        # Update records
        governance          = await models.Governance.get(
            network     = ctx.datasource.network,
            address     = governance_address
        )
        for proposal_id in proposal_ids:
            satellite                           = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=satellite_address)
            proposal                            = await models.GovernanceProposal.get(
                governance  = governance,
                internal_id = int(proposal_id)
            )
            proposal_vote                       = await models.GovernanceProposalVote.get(
                governance_proposal = proposal,
                voter               = satellite,
                round               = models.GovernanceRoundType.VOTING
            )
            proposal_vote.voting_reward_claimed = True
            await proposal_vote.save()

    except BaseException as e:
         await save_error_report(e)

