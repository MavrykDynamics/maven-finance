
from dipdup.context import HandlerContext
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.models import Origination
import mavryk.models as models

async def on_treasury_factory_origination(
    ctx: HandlerContext,
    treasury_factory_origination: Origination[TreasuryFactoryStorage],
) -> None:

    # Get operation values
    address                         = treasury_factory_origination.data.originated_contract_address
    admin                           = treasury_factory_origination.storage.admin
    governance_address              = treasury_factory_origination.storage.governanceAddress
    create_treasury_paused          = treasury_factory_origination.storage.breakGlassConfig.createTreasuryIsPaused
    track_treasury_paused           = treasury_factory_origination.storage.breakGlassConfig.trackTreasuryIsPaused
    untrack_treasury_paused         = treasury_factory_origination.storage.breakGlassConfig.untrackTreasuryIsPaused
    timestamp                       = treasury_factory_origination.data.timestamp

    # Get or create governance record
    governance, _ = await models.Governance.get_or_create(address=governance_address)
    await governance.save();

    # Create record
    treasury_factory = models.TreasuryFactory(
        address                         = address,
        admin                           = admin,
        last_updated_at                 = timestamp,
        governance                      = governance,
        create_treasury_paused          = create_treasury_paused,
        track_treasury_paused           = track_treasury_paused,
        untrack_treasury_paused         = untrack_treasury_paused
    )
    await treasury_factory.save()