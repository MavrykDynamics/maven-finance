from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktOrigination
from dipdup.context import HandlerContext
from maven.utils.contracts import get_contract_metadata
from maven.types.delegation.tezos_storage import DelegationStorage
import maven.models as models

async def origination(
    ctx: HandlerContext,
    delegation_origination: TzktOrigination[DelegationStorage],
) -> None:

    try:
        # Get operation values
        address                             = delegation_origination.data.originated_contract_address
        admin                               = delegation_origination.storage.admin
        minimum_smvn_balance                = float(delegation_origination.storage.config.minimumStakedMvnBalance)
        delegation_ratio                    = int(delegation_origination.storage.config.delegationRatio)
        max_satellites                      = int(delegation_origination.storage.config.maxSatellites)
        satellite_name_max_length           = int(delegation_origination.storage.config.satelliteNameMaxLength)
        satellite_description_max_length    = int(delegation_origination.storage.config.satelliteDescriptionMaxLength)
        satellite_image_max_length          = int(delegation_origination.storage.config.satelliteImageMaxLength)
        satellite_website_max_length        = int(delegation_origination.storage.config.satelliteWebsiteMaxLength)
        delegate_to_satellite_paused        = delegation_origination.storage.breakGlassConfig.delegateToSatelliteIsPaused
        undelegate_from_satellite_paused    = delegation_origination.storage.breakGlassConfig.undelegateFromSatelliteIsPaused
        register_as_satellite_paused        = delegation_origination.storage.breakGlassConfig.registerAsSatelliteIsPaused
        unregister_as_satellite_paused      = delegation_origination.storage.breakGlassConfig.unregisterAsSatelliteIsPaused
        update_satellite_record_paused      = delegation_origination.storage.breakGlassConfig.updateSatelliteRecordIsPaused
        distribute_reward_paused            = delegation_origination.storage.breakGlassConfig.distributeRewardIsPaused
        take_satellites_snapshot_paused     = delegation_origination.storage.breakGlassConfig.takeSatellitesSnapshotPaused
        timestamp                           = delegation_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
        
        # Get governance record
        governance                  = await models.Governance.get(network = ctx.datasource.name.replace('mvkt_',''))
    
        # Create contract
        delegation = models.Delegation(
            address                             = address,
            network                             = ctx.datasource.name.replace('mvkt_',''),
            metadata                            = contract_metadata,
            admin                               = admin,
            last_updated_at                     = timestamp,
            governance                          = governance,
            minimum_smvn_balance                = minimum_smvn_balance,
            delegation_ratio                    = delegation_ratio,
            max_satellites                      = max_satellites,
            satellite_name_max_length           = satellite_name_max_length,
            satellite_description_max_length    = satellite_description_max_length,
            satellite_image_max_length          = satellite_image_max_length,
            satellite_website_max_length        = satellite_website_max_length,
            delegate_to_satellite_paused        = delegate_to_satellite_paused,
            undelegate_from_satellite_paused    = undelegate_from_satellite_paused,
            register_as_satellite_paused        = register_as_satellite_paused,
            unregister_as_satellite_paused      = unregister_as_satellite_paused,
            update_satellite_record_paused      = update_satellite_record_paused,
            distribute_reward_paused            = distribute_reward_paused,
            take_satellites_snapshot_paused     = take_satellites_snapshot_paused
        )
        await delegation.save()
    except BaseException as e:
        await save_error_report(e)

