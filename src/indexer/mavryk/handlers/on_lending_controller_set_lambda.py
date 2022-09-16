
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_lambda
from mavryk.types.lending_controller.parameter.set_lambda import SetLambdaParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage
import mavryk.models as models

async def on_lending_controller_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, LendingControllerStorage],
) -> None:

    # Persist lambda
    await persist_lambda(models.LendingController, models.LendingControllerLambda, set_lambda)
