from mavryk.utils.error_reporting import save_error_report
from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.drop_proposal import DropProposalParameter
import mavryk.models as models

async def on_governance_drop_proposal(
    ctx: HandlerContext,
    drop_proposal: Transaction[DropProposalParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        proposal_id         = int(drop_proposal.parameter.__root__)
        timestamp           = drop_proposal.data.timestamp
    
        # Update record
        governance  = await models.Governance.get(
            network     = ctx.datasource.network
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

