
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.add_update_proposal_data import AddUpdateProposalDataParameter
import mavryk.models as models

async def on_governance_add_update_proposal_data(
    ctx: HandlerContext,
    add_update_proposal_data: Transaction[AddUpdateProposalDataParameter, GovernanceStorage],
) -> None:
    # Get operation values
    proposalID      = int(add_update_proposal_data.parameter.nat)
    metadataName    = add_update_proposal_data.parameter.string
    metadataBytes   = add_update_proposal_data.parameter.bytes

    # Create or update record
    proposalRecord  = await models.GovernanceProposalRecord.get(
        id          = proposalID
    )
    proposalRecordMetadata, _ = await models.GovernanceProposalRecordMetadata.get_or_create(
        governance_proposal_record  = proposalRecord,
        name                        = metadataName
    )
    proposalRecordMetadata.metadata = metadataBytes
    await proposalRecordMetadata.save()
