
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.proposal_round_vote import ProposalRoundVoteParameter
import mavryk.models as models

async def on_governance_proposal_round_vote(
    ctx: HandlerContext,
    proposal_round_vote: Transaction[ProposalRoundVoteParameter, GovernanceStorage],
) -> None:

    # Get operation values
    governance_address      = proposal_round_vote.data.target_address
    proposal_id             = int(proposal_round_vote.parameter.__root__)
    storage_proposal        = proposal_round_vote.storage.proposalLedger[proposal_round_vote.parameter.__root__]
    voter_address           = proposal_round_vote.data.sender_address
    current_round           = models.GovernanceRoundType.PROPOSAL
    vote                    = models.GovernanceVoteType.YAY
    
    # TODO: Remove this quick fix for future contract version (related to opHash: op4JYAsmrrHEvhzTeLTCV93gNEp8feBLoJsmZZviSvQfj69TFX3)
    voting_power            = 0
    if voter_address in storage_proposal.proposalVotersMap:
        storage_voter           = storage_proposal.proposalVotersMap[voter_address]
        voting_power            = float(storage_voter.nat)
    vote_count              = int(storage_proposal.proposalVoteCount)
    vote_smvk_total         = float(storage_proposal.proposalVoteStakedMvkTotal)

    # Create and update records
    governance  = await models.Governance.get(address   = governance_address)
    voter, _    = await models.MavrykUser.get_or_create(address = voter_address)
    await voter.save()

    # Update proposal with vote
    proposal    = await models.GovernanceProposalRecord.get(
        id          = proposal_id,
        governance  = governance
    )
    proposal.proposal_vote_count        = vote_count
    proposal.proposal_vote_smvk_total   = vote_smvk_total
    await proposal.save()

    # Check if user already voted and delete the vote
    proposal_vote = await models.GovernanceProposalRecordVote.get_or_none(
        round                       = current_round,
        voter                       = voter,
        current_round_vote          = True
    )
    if proposal_vote:
        # Get past voted proposal and remove vote from it
        past_proposal_record    = await proposal_vote.governance_proposal_record
        storage_past_proposal   = proposal_round_vote.storage.proposalLedger[str(past_proposal_record.id)]
        past_vote_count         = int(storage_past_proposal.proposalVoteCount)
        past_vote_smvk_total    = float(storage_past_proposal.proposalVoteStakedMvkTotal)
        past_proposal           = await models.GovernanceProposalRecord.get(
            id  = past_proposal_record.id
        )
        past_proposal.pass_vote_count           = past_vote_count
        past_proposal.proposal_vote_smvk_total  = past_vote_smvk_total
        await past_proposal.save()
        await proposal_vote.delete()
    
    # Create a new vote
    proposal_vote = models.GovernanceProposalRecordVote(
        governance_proposal_record  = proposal,
        voter                       = voter,
        round                       = current_round,
        vote                        = vote,
        voting_power                = voting_power,
        current_round_vote          = True
    )
    await proposal_vote.save()
