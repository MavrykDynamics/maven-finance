from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.lending_controller_mock_time.storage import LendingControllerMockTimeStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.lending_controller_mock_time.parameter.update_whitelist_token_contracts import UpdateWhitelistTokenContractsParameter
import mavryk.models as models

async def on_lending_controller_mock_time_update_whitelist_token_contracts(
    ctx: HandlerContext,
    update_whitelist_token_contracts: Transaction[UpdateWhitelistTokenContractsParameter, LendingControllerMockTimeStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(models.LendingController, models.LendingControllerWhitelistTokenContract, update_whitelist_token_contracts, ctx)

    except BaseException as e:
         await save_error_report(e)

