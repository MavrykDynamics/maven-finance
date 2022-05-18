
from dipdup.models import Transaction
from mavryk.types.doorman.parameter.update_min_mvk_amount import UpdateMinMvkAmountParameter
from dipdup.context import HandlerContext
from mavryk.types.doorman.storage import DoormanStorage
import mavryk.models as models

async def on_doorman_update_min_mvk_amount(
    ctx: HandlerContext,
    update_min_mvk_amount: Transaction[UpdateMinMvkAmountParameter, DoormanStorage],
) -> None:
    # Get doorman contract
    doorman_address = update_min_mvk_amount.data.target_address
    doorman         = await models.Doorman.get(address=doorman_address)

    # Get new minimum value
    new_min_amount  = float(update_min_mvk_amount.parameter.__root__)
    
    # Save the new value
    doorman.min_mvk_amount = new_min_amount
    await doorman.save()
