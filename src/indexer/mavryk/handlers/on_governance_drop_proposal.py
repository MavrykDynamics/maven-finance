from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.drop_proposal import DropProposalParameter
import mavryk.models as models

async def on_governance_drop_proposal(
    ctx: HandlerContext,
    drop_proposal: Transaction[DropProposalParameter, GovernanceStorage],
) -> None:

    # Get operation values
    proposal_id = int(drop_proposal.parameter.__root__)

    # Update record
    proposal    = await models.GovernanceProposal.get(
        id      = proposal_id
    )
    proposal.status = models.GovernanceActionStatus.DROPPED
    await proposal.save()
