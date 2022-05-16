
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from mavryk.types.delegation.parameter.undelegate_from_satellite import UndelegateFromSatelliteParameter
import mavryk.models as models

async def on_delegation_undelegate_from_satellite(
    ctx: HandlerContext,
    undelegate_from_satellite: Transaction[UndelegateFromSatelliteParameter, DelegationStorage],
) -> None:
    ...
    # Get operation values
    # userAddress = undelegate_from_satellite_complete.data.initiator_address

    # # Delete record
    # user, _ = await models.MavrykUser.get_or_create(
    #     address = userAddress
    # )
    # delegationRecord = await models.DelegationRecord.get(
    #     user = user
    # )
    # delegationRecord.satellite_record   = None
    # await user.save()
    # await delegationRecord.save()
