from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.contracts import get_contract_metadata
from maven.types.emergency_governance.tezos_storage import EmergencyGovernanceStorage
from dipdup.models.tezos import TezosOrigination
import maven.models as models

async def origination(
    ctx: HandlerContext,
    emergency_governance_origination: TezosOrigination[EmergencyGovernanceStorage],
) -> None:

    try:
        # Get operation values
        address                         = emergency_governance_origination.data.originated_contract_address
        admin                           = emergency_governance_origination.storage.admin
        decimals                        = int(emergency_governance_origination.storage.config.decimals)
        required_fee                    = int(emergency_governance_origination.storage.config.requiredFeeMumav)
        min_smvn_required_to_trigger    = float(emergency_governance_origination.storage.config.minStakedMvnRequiredToTrigger)
        min_smvn_required_to_vote       = float(emergency_governance_origination.storage.config.minStakedMvnRequiredToVote)
        proposal_desc_max_length        = int(emergency_governance_origination.storage.config.proposalDescMaxLength)
        proposal_title_max_length       = int(emergency_governance_origination.storage.config.proposalTitleMaxLength)
        smvn_percentage_required        = int(emergency_governance_origination.storage.config.stakedMvnPercentageRequired)
        duration_in_minutes             = int(emergency_governance_origination.storage.config.durationInMinutes)
        current_emergency_record_id     = int(emergency_governance_origination.storage.currentEmergencyGovernanceId)
        next_emergency_record_id        = int(emergency_governance_origination.storage.nextEmergencyGovernanceId)
        timestamp                       = emergency_governance_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
        
        # Get governance record
        governance                  = await models.Governance.get(network = 'atlasnet')
    
        # Create record
        emergencyGovernance = models.EmergencyGovernance(
            address                         = address,
            network                         = 'atlasnet',
            metadata                        = contract_metadata,
            admin                           = admin,
            last_updated_at                 = timestamp,
            governance                      = governance,
            decimals                        = decimals,
            min_smvn_required_to_trigger    = min_smvn_required_to_trigger,
            min_smvn_required_to_vote       = min_smvn_required_to_vote,
            proposal_desc_max_length        = proposal_desc_max_length,
            proposal_title_max_length       = proposal_title_max_length,
            required_fee_mumav              = required_fee,
            smvn_percentage_required        = smvn_percentage_required,
            duration_in_minutes             = duration_in_minutes,
            current_emergency_record_id     = current_emergency_record_id,
            next_emergency_record_id        = next_emergency_record_id
        )
        await emergencyGovernance.save()

    except BaseException as e:
        await save_error_report(e)

