from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.vesting.tezos_storage import VestingStorage
from dipdup.context import HandlerContext
from maven.types.vesting.tezos_parameters.toggle_vestee_lock import ToggleVesteeLockParameter
import maven.models as models

async def toggle_vestee_lock(
    ctx: HandlerContext,
    toggle_vestee_lock: TzktTransaction[ToggleVesteeLockParameter, VestingStorage],
) -> None:

    try:
        # Get operation values
        vesting_address = toggle_vestee_lock.data.target_address
        vestee_address  = toggle_vestee_lock.parameter.__root__
        status          = toggle_vestee_lock.storage.vesteeLedger[vestee_address].status
        locked          = False
        if status == 'LOCKED':
            locked    = True
    
        # Update record
        vesting = await models.Vesting.get(
            network = ctx.datasource.name.replace('mvkt_',''),
            address=vesting_address
        )
        vestee  = await models.maven_user_cache.get(network=ctx.datasource.name.replace('mvkt_',''), address=vestee_address)
        await models.VestingVestee.filter(
            vestee  = vestee,
            vesting = vesting
        ).update(
            locked = locked
        )

    except BaseException as e:
        await save_error_report(e)

