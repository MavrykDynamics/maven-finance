
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.storage import LendingControllerStorage
import mavryk.models as models

async def on_lending_controller_origination(
    ctx: HandlerContext,
    lending_controller_origination: Origination[LendingControllerStorage],
) -> None:
    
    # Get operation info
    lending_controller_address      = lending_controller_origination.data.originated_contract_address
    timestamp                       = lending_controller_origination.data.timestamp
    governance_address              = lending_controller_origination.storage.governanceAddress
    admin                           = lending_controller_origination.storage.admin


    # Create record
    governance, _       = await models.Governance.get_or_create(
        address = governance_address
    )
    await governance.save()
