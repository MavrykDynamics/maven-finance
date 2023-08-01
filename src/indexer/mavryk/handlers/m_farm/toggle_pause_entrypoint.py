from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.m_farm.tezos_parameters.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from mavryk.types.m_farm.tezos_storage import MFarmStorage
import mavryk.models as models

async def toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: TzktTransaction[TogglePauseEntrypointParameter, MFarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address    = toggle_pause_entrypoint.data.target_address
    
        # Update record
        await models.Farm.filter(network=ctx.datasource.network, address=farm_address).update(
            deposit_paused     = toggle_pause_entrypoint.storage.breakGlassConfig.depositIsPaused,
            withdraw_paused    = toggle_pause_entrypoint.storage.breakGlassConfig.withdrawIsPaused,
            claim_paused       = toggle_pause_entrypoint.storage.breakGlassConfig.claimIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

