
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_proxy_lambda
from mavryk.types.governance_proxy.storage import GovernanceProxyStorage
from dipdup.models import Transaction
from mavryk.types.governance_proxy.parameter.set_proxy_lambda import SetProxyLambdaParameter
import mavryk.models as models

async def on_governance_proxy_set_proxy_lambda(
    ctx: HandlerContext,
    set_proxy_lambda: Transaction[SetProxyLambdaParameter, GovernanceProxyStorage],
) -> None:

    # Persist lambda
    await persist_proxy_lambda(models.GovernanceProxy, models.GovernanceProxyProxyLambda, set_proxy_lambda)
