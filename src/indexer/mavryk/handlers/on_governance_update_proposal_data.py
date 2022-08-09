
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.update_proposal_data import UpdateProposalDataParameter
import mavryk.models as models

async def on_governance_update_proposal_data(
    ctx: HandlerContext,
    update_proposal_data: Transaction[UpdateProposalDataParameter, GovernanceStorage],
) -> None:

    # Get operation info
    governance_address  = update_proposal_data.data.target_address
    proposal_id         = int(update_proposal_data.parameter.proposalId)
    storage_proposal    = update_proposal_data.storage.proposalLedger[update_proposal_data.parameter.proposalId]
    proposal_metadata   = storage_proposal.proposalMetadata
    title               = update_proposal_data.parameter.title
    bytes               = update_proposal_data.parameter.proposalBytes

    # Update or create record
    governance      = await models.Governance.get(address   = governance_address)
    proposal        = await models.GovernanceProposalRecord.get(
        id                  = proposal_id,
        governance          = governance
    )
    bytes_record     = await models.GovernanceProposalRecordData.get_or_none(
        governance_proposal_record  = proposal,
        title                       = title,
        bytes                       = bytes
    )
    # Delete record if it already exists, else update or add it
    if bytes_record:
        await bytes_record.delete()
    else:
        # Get internal data id
        internal_id = 0
        for key in proposal_metadata:
            if proposal_metadata[key] and proposal_metadata[key].title == title:
                int(key)
        bytes_record, _     = await models.GovernanceProposalRecordData.get_or_create(
            governance_proposal_record  = proposal,
            record_internal_id          = internal_id,
            title                       = title,
        )
        bytes_record.bytes   = bytes
        await bytes_record.save()
