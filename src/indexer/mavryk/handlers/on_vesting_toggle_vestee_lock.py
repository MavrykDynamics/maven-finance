
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
    vestingAddress  = toggle_vestee_lock.data.target_address
    vesteeAddress   = toggle_vestee_lock.parameter.__root__
    vesteeStatus    = toggle_vestee_lock.storage.vesteeLedger[vesteeAddress].status
    vesteeLocked = False
    if vesteeStatus == 'LOCKED':
        vesteeLocked    = True

    # Update record
    vesting = await models.Vesting.get(
        address=vestingAddress
    )
    vestee = await models.MavrykUser.get(
        address=vesteeAddress
    )
    vesteeRecord    = await models.VestingVesteeRecord.get(
        vestee=vestee,
        vesting=vesting
    )
    vesteeRecord.locked = vesteeLocked
    await vesteeRecord.save()
