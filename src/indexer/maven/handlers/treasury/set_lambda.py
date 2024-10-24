from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosTransaction
from maven.utils.persisters import persist_lambda
from maven.types.treasury.tezos_storage import TreasuryStorage
from maven.types.treasury.tezos_parameters.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
import maven.models as models

async def set_lambda(
    ctx: HandlerContext,
    set_lambda: TezosTransaction[SetLambdaParameter, TreasuryStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.Treasury, models.TreasuryLambda, set_lambda)

    except BaseException as e:
        await save_error_report(e)

