
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.vote_for_request import VoteForRequestParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_vote_for_request(
    ctx: HandlerContext,
    vote_for_request: Transaction[VoteForRequestParameter, GovernanceStorage],
) -> None:
    # Get operation values
    requestID           = int(vote_for_request.parameter.requestId)
    timestamp           = vote_for_request.data.timestamp
    voterAddress        = vote_for_request.data.sender_address
    requestStorage      = vote_for_request.storage.financialRequestLedger[vote_for_request.parameter.requestId]
    approveTotal        = float(requestStorage.approveVoteTotal)
    disapproveTotal     = float(requestStorage.disapproveVoteTotal)
    executed            = requestStorage.executed
    voteRecord          = requestStorage.voters[voterAddress]
    voteRecordPower     = float(voteRecord.totalVotingPower)
    voteRecordVote      = voteRecord.vote
    voteRecordVoteType  = models.GovernanceVoteType.YAY
    if hasattr(voteRecordVote, 'disapprove'):
        voteRecordVoteType  = models.GovernanceVoteType.NAY

    # Create and update record
    request = await models.GovernanceFinancialRequestRecord.get(
        id  = requestID
    )
    request.approve_vote_total      = approveTotal
    request.disapprove_vote_total   = disapproveTotal
    request.executed                = executed
    await request.save()

    voter, _    = await models.MavrykUser.get_or_create(
        address = voterAddress
    )
    await voter.save()
    satellite   = await models.SatelliteRecord.get(
        user    = voter
    )
    vote, _     = await models.GovernanceFinancialRequestRecordVote.get_or_create(
        governance_financial_request    = request,
        voter                           = satellite
    )
    vote.timestamp      = timestamp
    vote.vote           = voteRecordVoteType
    vote.voting_power   = voteRecordPower
    await vote.save()