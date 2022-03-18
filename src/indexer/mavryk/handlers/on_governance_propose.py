
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.propose import ProposeParameter
from dipdup.context import HandlerContext

async def on_governance_propose(
    ctx: HandlerContext,
    propose: Transaction[ProposeParameter, GovernanceStorage],
) -> None:
    # Get operation values
    governanceAddress   = propose.data.target_address
    breakpoint()