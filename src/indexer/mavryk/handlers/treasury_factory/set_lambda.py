from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from mavryk.types.treasury_factory.parameter.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.TreasuryFactory, models.TreasuryFactoryLambda, set_lambda)

    except BaseException as e:
        await save_error_report(e)

