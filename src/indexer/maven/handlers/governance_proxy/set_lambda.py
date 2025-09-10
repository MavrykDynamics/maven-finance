from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.utils.persisters import persist_lambda
from maven.types.governance_proxy.tezos_storage import GovernanceProxyStorage
from maven.types.governance_proxy.tezos_parameters.set_lambda import SetLambdaParameter
from maven import models as models

async def set_lambda(
    ctx: HandlerContext,
    set_lambda: TezosTransaction[SetLambdaParameter, GovernanceProxyStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.GovernanceProxy, models.GovernanceProxyLambda, set_lambda)

    except BaseException as e:
        await save_error_report(e)

