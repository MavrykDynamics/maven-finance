from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosTransaction
from maven.types.vesting.tezos_storage import VestingStorage
from maven.types.vesting.tezos_parameters.remove_vestee import RemoveVesteeParameter
from dipdup.context import HandlerContext
from maven import models as models

async def remove_vestee(
    ctx: HandlerContext,
    remove_vestee: TezosTransaction[RemoveVesteeParameter, VestingStorage],
) -> None:

    try:
        # Get operation values
        vesting_address = remove_vestee.data.target_address
        vestee_address  = remove_vestee.parameter.root
    
        # Delete record
        vesting = await models.Vesting.get(
            network = 'atlasnet',
            address=vesting_address
        )
        vestee  = await models.get_user(network='atlasnet', address=vestee_address)
        await models.VestingVestee.filter(
            vestee  = vestee,
            vesting = vesting
        ).delete()
    except BaseException as e:
        await save_error_report(e)

