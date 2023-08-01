from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.vesting.storage import VestingStorage
from mavryk.types.vesting.parameter.remove_vestee import RemoveVesteeParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def remove_vestee(
    ctx: HandlerContext,
    remove_vestee: Transaction[RemoveVesteeParameter, VestingStorage],
) -> None:

    try:
        # Get operation values
        vesting_address = remove_vestee.data.target_address
        vestee_address  = remove_vestee.parameter.__root__
    
        # Delete record
        vesting = await models.Vesting.get(
            network = ctx.datasource.network,
            address=vesting_address
        )
        vestee  = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=vestee_address)
        await models.VestingVestee.filter(
            vestee  = vestee,
            vesting = vesting
        ).delete()
    except BaseException as e:
        await save_error_report(e)

