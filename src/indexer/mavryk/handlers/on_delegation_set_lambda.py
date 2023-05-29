from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.delegation.storage import DelegationStorage
from mavryk.types.delegation.parameter.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_delegation_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, DelegationStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.Delegation, models.DelegationLambda, set_lambda)

    except BaseException as e:
         await save_error_report(e)

