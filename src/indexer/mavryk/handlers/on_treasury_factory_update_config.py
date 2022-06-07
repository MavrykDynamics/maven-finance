
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from mavryk.types.treasury_factory.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configTreasuryNameMaxLength
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_treasury_factory_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, TreasuryFactoryStorage],
) -> None:

    # Get operation values
    treasury_factory_address    = update_config.data.target_address
    updated_value               = int(update_config.parameter.updateConfigNewValue)
    update_config_action        = type(update_config.parameter.updateConfigAction)

    # Update contract
    treasury_factory = await models.TreasuryFactory.get(
        address = treasury_factory_address
    )
    if update_config_action == configTreasuryNameMaxLength:
        treasury_factory.treasuryNameMaxLength                 = updated_value
    
    await treasury_factory.save()