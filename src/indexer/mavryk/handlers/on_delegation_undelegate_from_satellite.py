
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.undelegate_from_satellite_complete import UndelegateFromSatelliteCompleteParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_undelegate_from_satellite(
    ctx: HandlerContext,
    undelegate_from_satellite_complete: Transaction[UndelegateFromSatelliteCompleteParameter, DelegationStorage],
) -> None:
    # Get operation values
    userAddress = undelegate_from_satellite_complete.data.initiator_address

    # # Delete record
    # user, _ = await models.User.get_or_create(
    #     address = userAddress
    # )
    # delegationRecord = await models.DelegationRecord.get(
    #     user = user
    # )
    # await user.save()
    # await delegationRecord.delete()
