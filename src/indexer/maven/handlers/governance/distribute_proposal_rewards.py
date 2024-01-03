from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.governance.tezos_parameters.distribute_proposal_rewards import DistributeProposalRewardsParameter
from maven.types.governance.tezos_storage import GovernanceStorage
import maven.models as models

async def distribute_proposal_rewards(
    ctx: HandlerContext,
    distribute_proposal_rewards: TzktTransaction[DistributeProposalRewardsParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation info
        satellite_address   = distribute_proposal_rewards.parameter.satelliteAddress
        proposal_ids        = distribute_proposal_rewards.parameter.proposalIds
    
        # Update records
        governance          = await models.Governance.get(
            network     = ctx.datasource.name.replace('tzkt_','')
        )
        for proposal_id in proposal_ids:
            satellite                           = await models.maven_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=satellite_address)
            proposal                            = await models.GovernanceProposal.get(
                governance  = governance,
                internal_id = int(proposal_id)
            )
            await models.GovernanceProposalVote.filter(
                governance_proposal = proposal,
                voter               = satellite,
                round               = models.GovernanceRoundType.VOTING
            ).update(
                voting_reward_claimed = True
            )

    except BaseException as e:
        await save_error_report(e)

