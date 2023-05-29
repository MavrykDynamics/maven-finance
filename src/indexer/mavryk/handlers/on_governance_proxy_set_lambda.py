from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.governance_proxy.storage import GovernanceProxyStorage
from mavryk.types.governance_proxy.parameter.set_lambda import SetLambdaParameter
import mavryk.models as models

async def on_governance_proxy_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, GovernanceProxyStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.GovernanceProxy, models.GovernanceProxyLambda, set_lambda)

    except BaseException as e:
         await save_error_report(e)

