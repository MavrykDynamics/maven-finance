
from typing import Optional
from mavryk.types.governance.parameter.update_satellite_snapshot import UpdateSatelliteSnapshotParameter
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.governance_financial.parameter.vote_for_request import VoteForRequestParameter, VoteItem as nay, VoteItem1 as pass_, VoteItem2 as yay
import mavryk.models as models

async def on_governance_financial_vote_for_request(
    ctx: HandlerContext,
    vote_for_request: Transaction[VoteForRequestParameter, GovernanceFinancialStorage],
    update_satellite_snapshot: Optional[Transaction[UpdateSatelliteSnapshotParameter, GovernanceStorage]] = None,
) -> None:
    
    # Get operation info
    financial_address   = vote_for_request.data.target_address
    governance_address  = vote_for_request.storage.governanceAddress
    voter_address       = vote_for_request.data.sender_address
    vote                = vote_for_request.parameter.vote
    request_id          = int(vote_for_request.parameter.requestId)
    request_storage     = vote_for_request.storage.financialRequestLedger[vote_for_request.parameter.requestId]
    voter_storage       = request_storage.voters[voter_address]
    timestamp           = vote_for_request.data.timestamp
    yay_smvk_total      = float(request_storage.yayVoteStakedMvkTotal)
    nay_smvk_total      = float(request_storage.nayVoteStakedMvkTotal)
    pass_smvk_total     = float(request_storage.nayVoteStakedMvkTotal)
    executed            = request_storage.executed

    # Process vote
    vote_type           = models.GovernanceVoteType.YAY
    if type(vote) == nay:
        vote_type       = models.GovernanceVoteType.NAY
    if type(vote) == pass_:
        vote_type       = models.GovernanceVoteType.PASS

    # Create and update records
    governance              = await models.Governance.get(address   = governance_address)
    governance_financial    = await models.GovernanceFinancial.get(address  = financial_address)
    financial_request       = await models.GovernanceFinancialRequestRecord.get(
        governance_financial    = governance_financial,
        id                      = request_id
    )
    financial_request.executed              = executed
    financial_request.yay_vote_smvk_total   = yay_smvk_total
    financial_request.nay_vote_smvk_total   = nay_smvk_total
    financial_request.pass_vote_smvk_total  = pass_smvk_total
    await financial_request.save()
    
    voter, _                = await models.MavrykUser.get_or_create(
        address = voter_address
    )
    await voter.save()
    
    # Create or update the satellite snapshot
    if update_satellite_snapshot:
        breakpoint()
        satellite_snapshots = update_satellite_snapshot.storage.snapshotLedger
        governance_snapshot = await models.GovernanceSatelliteSnapshotRecord.get_or_none(
            governance  = governance,
            user        = voter,
            cycle       = int(update_satellite_snapshot.storage.cycleCounter)
        )
        if not governance_snapshot and voter_address in satellite_snapshots:
            satellite_snapshot   = satellite_snapshots[voter_address]
            governance_snapshot  = models.GovernanceSatelliteSnapshotRecord(
                governance              = governance,
                user                    = voter,
                cycle                   = int(update_satellite_snapshot.storage.cycleCounter),
                ready                   = satellite_snapshot.ready,
                total_smvk_balance      = float(satellite_snapshot.totalStakedMvkBalance),
                total_delegated_amount  = float(satellite_snapshot.totalDelegatedAmount),
                total_voting_power      = float(satellite_snapshot.totalVotingPower)
            )
            await governance_snapshot.save()

    # Register vote
    vote_record, _          = await models.GovernanceFinancialRequestRecordVote.get_or_create(
        governance_financial_request    = financial_request,
        voter                           = voter
    )
    vote_record.timestamp       = timestamp
    vote_record.vote            = vote_type
    vote_record.voting_power    = float(voter_storage.totalVotingPower)
    await vote_record.save()
