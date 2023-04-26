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
        governance_address  = lock_proposal.data.target_address
        proposalID          = int(lock_proposal.parameter.__root__)
    
        # Update record
        governance          = await models.Governance.get(
            address = governance_address
        )
        proposal    = await models.GovernanceProposal.filter(
            governance  = governance,
            internal_id = proposalID
        ).first()
        proposal.locked = True
        await proposal.save()

    except BaseException:
         await save_error_report()

