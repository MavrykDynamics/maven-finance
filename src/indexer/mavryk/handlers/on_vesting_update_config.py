
from mavryk.types.vesting.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configBlocksPerMinute, UpdateConfigActionItem1 as configBlocksPerMonth, UpdateConfigActionItem2 as configDefaultCliffPeriod, UpdateConfigActionItem3 as configDefaultCooldownPeriod, UpdateConfigActionItem4 as configNewBlockTimeLevel, UpdateConfigActionItem5 as configNewBlocksPerMinute
from mavryk.types.vesting.storage import VestingStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_vesting_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, VestingStorage],
) -> None:
    # Get operation values
    vestingAddress          = update_config.data.target_address
    updatedValue            = int(update_config.parameter.updateConfigNewValue)
    updateConfigAction      = type(update_config.parameter.updateConfigAction)

    # Update contract
    vesting = await models.Vesting.get(
        address = vestingAddress
    )
    if updateConfigAction == configDefaultCliffPeriod:
        vesting.default_cliff_period        = updatedValue
    elif updateConfigAction == configDefaultCooldownPeriod:
        vesting.default_cooldown_period     = updatedValue     = updatedValue

    await vesting.save()