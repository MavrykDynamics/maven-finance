from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_lambda
from maven.types.lending_controller_mock_time.tezos_storage import LendingControllerMockTimeStorage
from dipdup.models.tezos import TezosTransaction
from dipdup.context import HandlerContext
from maven.types.lending_controller_mock_time.tezos_parameters.set_lambda import SetLambdaParameter
import maven.models as models

async def set_lambda(
    ctx: HandlerContext,
    set_lambda: TezosTransaction[SetLambdaParameter, LendingControllerMockTimeStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.LendingController, models.LendingControllerLambda, set_lambda)

    except BaseException as e:
        await save_error_report(e)

