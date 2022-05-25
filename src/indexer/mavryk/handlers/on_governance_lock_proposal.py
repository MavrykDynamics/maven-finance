
from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.lock_proposal import LockProposalParameter
from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
import mavryk.models as models

async def on_governance_lock_proposal(
    ctx: HandlerContext,
    lock_proposal: Transaction[LockProposalParameter, GovernanceStorage],
) -> None:

    # Get operation values
    proposalID  = int(lock_proposal.parameter.__root__)

    # Update record
    proposal    = await models.GovernanceProposalRecord.get(
        id      = proposalID
    )
    proposal.locked = True
    await proposal.save()
