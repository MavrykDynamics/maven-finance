
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.execute_proposal import ExecuteProposalParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_governance_execute_proposal(
    ctx: HandlerContext,
    execute_proposal: Transaction[ExecuteProposalParameter, GovernanceStorage],
) -> None:
    breakpoint()