from mavryk.utils.error_reporting import save_error_report
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.governance.tezos_storage import GovernanceStorage
from dipdup.context import HandlerContext
from mavryk.types.governance.tezos_parameters.drop_proposal import DropProposalParameter
import mavryk.models as models

async def drop_proposal(
    ctx: HandlerContext,
    drop_proposal: TzktTransaction[DropProposalParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        proposal_id         = int(drop_proposal.parameter.__root__)
        timestamp           = drop_proposal.data.timestamp
    
        # Update record
        governance  = await models.Governance.get(
            network     = ctx.datasource.name.replace('tzkt_','')
        )
        await models.GovernanceProposal.filter(
            governance  = governance,
            internal_id = proposal_id
        ).update(
            status              = models.GovernanceActionStatus.DROPPED,
            dropped_datetime    = timestamp
        )

    except BaseException as e:
        await save_error_report(e)

