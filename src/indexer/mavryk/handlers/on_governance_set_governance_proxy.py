
from mavryk.types.governance.parameter.set_governance_proxy import SetGovernanceProxyParameter
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction

async def on_governance_set_governance_proxy(
    ctx: HandlerContext,
    set_governance_proxy: Transaction[SetGovernanceProxyParameter, GovernanceStorage],
) -> None:
    ...