from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.m_farm.tezos_parameters.unpause_all import UnpauseAllParameter
from maven.types.m_farm.tezos_storage import MFarmStorage
from maven import models as models

async def unpause_all(
    ctx: HandlerContext,
    unpause_all: TezosTransaction[UnpauseAllParameter, MFarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address    = unpause_all.data.target_address
        farm            = await models.Farm.get(network='atlasnet', address=farm_address)
    
        # Update record
        await models.Farm.filter(network='atlasnet', address=farm_address).update(
            deposit_paused     = unpause_all.storage.breakGlassConfig.depositIsPaused,
            withdraw_paused    = unpause_all.storage.breakGlassConfig.withdrawIsPaused,
            claim_paused       = unpause_all.storage.breakGlassConfig.claimIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

