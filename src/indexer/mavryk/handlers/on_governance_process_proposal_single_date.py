
from mavryk.types.governance.parameter.process_proposal_single_data import ProcessProposalSingleDataParameter
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction

async def on_governance_process_proposal_single_date(
    ctx: HandlerContext,
    process_proposal_single_data: Transaction[ProcessProposalSingleDataParameter, GovernanceStorage],
) -> None:
    ...