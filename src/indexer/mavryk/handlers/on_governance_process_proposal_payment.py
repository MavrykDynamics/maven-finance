
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.process_proposal_payment import ProcessProposalPaymentParameter

async def on_governance_process_proposal_payment(
    ctx: HandlerContext,
    process_proposal_payment: Transaction[ProcessProposalPaymentParameter, GovernanceStorage],
) -> None:
    ...