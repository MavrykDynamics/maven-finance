
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.update_whitelist_developers import UpdateWhitelistDevelopersParameter

async def on_governance_update_whitelist_developers(
    ctx: HandlerContext,
    update_whitelist_developers: Transaction[UpdateWhitelistDevelopersParameter, GovernanceStorage],
) -> None:
    ...