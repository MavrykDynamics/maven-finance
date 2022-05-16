
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.start_next_round import StartNextRoundParameter

async def on_governance_start_next_round(
    ctx: HandlerContext,
    start_next_round: Transaction[StartNextRoundParameter, GovernanceStorage],
) -> None:
    ...