from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_admin
from maven.types.lending_controller_mock_time.tezos_storage import LendingControllerMockTimeStorage
from dipdup.models.tezos import TezosTransaction
from dipdup.context import HandlerContext
from maven.types.lending_controller_mock_time.tezos_parameters.set_admin import SetAdminParameter
from maven import models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TezosTransaction[SetAdminParameter, LendingControllerMockTimeStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.LendingController, set_admin)

    except BaseException as e:
        await save_error_report(e)

