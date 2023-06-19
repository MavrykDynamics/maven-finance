from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.lock_proposal import LockProposalParameter
from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
import mavryk.models as models

async def on_governance_lock_proposal(
    ctx: HandlerContext,
    lock_proposal: Transaction[LockProposalParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        proposalID          = int(lock_proposal.parameter.__root__)
    
        # Update record
        governance          = await models.Governance.get(
            network = ctx.datasource.network
        )
        await models.GovernanceProposal.filter(
            governance  = governance,
            internal_id = proposalID
        ).update(
            locked = True
        )

    except BaseException as e:
         await save_error_report(e)

