
from dipdup.models import Transaction
from mavryk.types.vesting.storage import VestingStorage
from mavryk.types.vesting.parameter.remove_vestee import RemoveVesteeParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_vesting_remove_vestee(
    ctx: HandlerContext,
    remove_vestee: Transaction[RemoveVesteeParameter, VestingStorage],
) -> None:

    # Get operation values
    vesting_address = remove_vestee.data.target_address
    vestee_address  = remove_vestee.parameter.__root__

    # Delete record
    vesting = await models.Vesting.get(
        address=vesting_address
    )
    vestee  = await models.mavryk_user_cache.get(address=vestee_address)
    vesteeRecord    = await models.VestingVestee.get(
        vestee  = vestee,
        vesting = vesting
    )
    await vesteeRecord.delete()