from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Origination
from mavryk.utils.contracts import get_contract_metadata
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_satellite_origination(
    ctx: HandlerContext,
    governance_satellite_origination: Origination[GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        address                     = governance_satellite_origination.data.originated_contract_address
        admin                       = governance_satellite_origination.storage.admin
        gov_sat_approval_pct        = int(governance_satellite_origination.storage.config.governanceSatelliteApprovalPercentage)
        gov_sat_duration_in_days    = int(governance_satellite_origination.storage.config.governanceSatelliteDurationInDays)
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
        governance                  = await models.Governance.get(network = ctx.datasource.network)
    
        # Create record
        governance_satellite        = models.GovernanceSatellite(
            address                         = address,
            network                         = ctx.datasource.network,
            metadata                        = contract_metadata,
            admin                           = admin,
            last_updated_at                 = timestamp,
            governance                      = governance,
            gov_sat_approval_percentage     = gov_sat_approval_pct,
            gov_sat_duration_in_days        = gov_sat_duration_in_days,
            gov_purpose_max_length          = gov_purpose_max_length,
            max_actions_per_satellite       = max_actions_per_satellite,
            governance_satellite_counter    = gov_sat_counter
        )
    
        await governance_satellite.save()

    except BaseException as e:
         await save_error_report(e)

