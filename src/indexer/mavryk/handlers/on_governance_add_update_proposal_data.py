
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.add_update_proposal_data import AddUpdateProposalDataParameter

async def on_governance_add_update_proposal_data(
    ctx: HandlerContext,
    add_update_proposal_data: Transaction[AddUpdateProposalDataParameter, GovernanceStorage],
) -> None:
    # Get operation values
    
    breakpoint()