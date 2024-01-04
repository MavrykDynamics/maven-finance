from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktOrigination
from maven.utils.contracts import get_contract_metadata
from maven.types.doorman.tezos_storage import DoormanStorage
from dipdup.context import HandlerContext
import maven.models as models

async def origination(
    ctx: HandlerContext,
    doorman_origination: TzktOrigination[DoormanStorage],
) -> None:

    try:
        # Get operation values
        doorman_address                 = doorman_origination.data.originated_contract_address
        admin                           = doorman_origination.storage.admin
        min_mvn_amount                  = int(doorman_origination.storage.config.minMvnAmount)
        unclaimed_rewards               = int(doorman_origination.storage.unclaimedRewards)
        accumulated_fees_per_share      = int(doorman_origination.storage.accumulatedFeesPerShare)
        stake_mvn_paused                    = doorman_origination.storage.breakGlassConfig.stakeMvnIsPaused
        unstake_mvn_paused                  = doorman_origination.storage.breakGlassConfig.unstakeMvnIsPaused
        compound_paused                 = doorman_origination.storage.breakGlassConfig.compoundIsPaused
        timestamp                       = doorman_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=doorman_address
        )
        
        # Get governance record
        governance                  = await models.Governance.get(network = ctx.datasource.name.replace('tzkt_',''))
    
        # Save Doorman in DB
        doorman = models.Doorman(
            address                     = doorman_address,
            network                     = ctx.datasource.name.replace('tzkt_',''),
            metadata                    = contract_metadata,
            admin                       = admin,
            last_updated_at             = timestamp,
            governance                  = governance,
            min_mvn_amount              = min_mvn_amount,
            unclaimed_rewards           = unclaimed_rewards,
            accumulated_fees_per_share  = accumulated_fees_per_share,
            stake_mvn_paused                = stake_mvn_paused,
            unstake_mvn_paused              = unstake_mvn_paused,
            compound_paused             = compound_paused
        )
        await doorman.save()

    except BaseException as e:
        await save_error_report(e)

