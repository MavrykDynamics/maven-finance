from mavryk.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktOrigination
from mavryk.utils.contracts import get_contract_metadata
from mavryk.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def origination(
    ctx: HandlerContext,
    governance_satellite_origination: TzktOrigination[GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        address                     = governance_satellite_origination.data.originated_contract_address
        admin                       = governance_satellite_origination.storage.admin
        approval_pct                = int(governance_satellite_origination.storage.config.approvalPercentage)
        sat_action_duration_in_days = int(governance_satellite_origination.storage.config.satelliteActionDurationInDays)
        gov_purpose_max_length      = int(governance_satellite_origination.storage.config.governancePurposeMaxLength)
        max_actions_per_satellite   = int(governance_satellite_origination.storage.config.maxActionsPerSatellite)
        gov_sat_counter             = int(governance_satellite_origination.storage.governanceSatelliteCounter)
        timestamp                   = governance_satellite_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
        
        # Get governance record
        governance                  = await models.Governance.get(network = ctx.datasource.name.replace('tzkt_',''))
    
        # Create record
        governance_satellite        = models.GovernanceSatellite(
            address                         = address,
            network                         = ctx.datasource.name.replace('tzkt_',''),
            metadata                        = contract_metadata,
            admin                           = admin,
            last_updated_at                 = timestamp,
            governance                      = governance,
            approval_percentage             = approval_pct,
            sat_action_duration_in_days     = sat_action_duration_in_days,
            gov_purpose_max_length          = gov_purpose_max_length,
            max_actions_per_satellite       = max_actions_per_satellite,
            governance_satellite_counter    = gov_sat_counter
        )
    
        await governance_satellite.save()

    except BaseException as e:
        await save_error_report(e)

