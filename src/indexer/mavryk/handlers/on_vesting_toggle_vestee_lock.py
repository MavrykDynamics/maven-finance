
from dipdup.models import Transaction
from mavryk.types.vesting.storage import VestingStorage
from dipdup.context import HandlerContext
from mavryk.types.vesting.parameter.toggle_vestee_lock import ToggleVesteeLockParameter
import mavryk.models as models

async def on_vesting_toggle_vestee_lock(
    ctx: HandlerContext,
    toggle_vestee_lock: Transaction[ToggleVesteeLockParameter, VestingStorage],
) -> None:

    # Get operation values
    vesting_address = toggle_vestee_lock.data.target_address
    vestee_address  = toggle_vestee_lock.parameter.__root__
    status          = toggle_vestee_lock.storage.vesteeLedger[vestee_address].status
    locked          = False
    if status == 'LOCKED':
        locked    = True

    # Update record
    vesting = await models.Vesting.get(
        address=vesting_address
    )
    vestee = await models.MavrykUser.get(
        address=vestee_address
    )
    vesteeRecord    = await models.VestingVestee.get(
        vestee  = vestee,
        vesting = vesting
    )
    vesteeRecord.locked = locked
    await vesteeRecord.save()
