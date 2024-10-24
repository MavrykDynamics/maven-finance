from maven.utils.error_reporting import save_error_report
from maven.utils.persisters import persist_lambda
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.m_farm.tezos_parameters.set_lambda import SetLambdaParameter
from maven.types.m_farm.tezos_storage import MFarmStorage
import maven.models as models

async def set_lambda(
    ctx: HandlerContext,
    set_lambda: TezosTransaction[SetLambdaParameter, MFarmStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.Farm, models.FarmLambda, set_lambda)

    except BaseException as e:
        await save_error_report(e)
