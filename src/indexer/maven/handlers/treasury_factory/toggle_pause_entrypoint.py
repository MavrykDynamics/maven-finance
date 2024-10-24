from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosTransaction
from maven.types.treasury_factory.tezos_storage import TreasuryFactoryStorage
from maven.types.treasury_factory.tezos_parameters.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.context import HandlerContext
import maven.models as models

async def toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: TezosTransaction[TogglePauseEntrypointParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Get operation info
        treasury_factory_address    = toggle_pause_entrypoint.data.target_address
    
        # Update record
        await models.TreasuryFactory.filter(network='atlasnet', address=treasury_factory_address).update(
            create_treasury_paused     = toggle_pause_entrypoint.storage.breakGlassConfig.createTreasuryIsPaused,
            track_treasury_paused      = toggle_pause_entrypoint.storage.breakGlassConfig.trackTreasuryIsPaused,
            untrack_treasury_paused    = toggle_pause_entrypoint.storage.breakGlassConfig.untrackTreasuryIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

