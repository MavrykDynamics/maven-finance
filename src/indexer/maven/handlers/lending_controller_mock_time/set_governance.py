from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_governance
from maven.types.lending_controller_mock_time.tezos_storage import LendingControllerMockTimeStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.lending_controller_mock_time.tezos_parameters.set_governance import SetGovernanceParameter
import maven.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, LendingControllerMockTimeStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.LendingController, set_governance)

    except BaseException as e:
        await save_error_report(e)

