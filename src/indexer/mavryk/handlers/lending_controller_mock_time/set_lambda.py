from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_lambda
from mavryk.types.lending_controller_mock_time.storage import LendingControllerMockTimeStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.lending_controller_mock_time.parameter.set_lambda import SetLambdaParameter
import mavryk.models as models

async def set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, LendingControllerMockTimeStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.LendingController, models.LendingControllerLambda, set_lambda)

    except BaseException as e:
        await save_error_report(e)

