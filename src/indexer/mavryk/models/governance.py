from dipdup.models import Model, fields
from mavryk.models.parents import LinkedContract, ContractLambda, MavrykContract
from mavryk.models.enums import GovernanceRoundType, GovernanceActionStatus, GovernanceVoteType

###
# Governance Tables
###

class Governance(MavrykContract, Model):
    governance_proxy_address                = fields.CharField(max_length=36, default="")
    success_reward                          = fields.FloatField(default=0)
    cycle_voters_reward                     = fields.FloatField(default=0)
    proposal_round_vote_percentage          = fields.SmallIntField(default=0)
    min_quorum_percentage                   = fields.SmallIntField(default=0)
    min_yay_vote_percentage                 = fields.SmallIntField(default=0)
    proposal_submission_fee_mutez           = fields.BigIntField(default=0)
    max_proposal_per_satellite              = fields.SmallIntField(default=0)
    blocks_per_proposal_round               = fields.BigIntField(default=0)
    blocks_per_voting_round                 = fields.BigIntField(default=0)
    blocks_per_timelock_round               = fields.BigIntField(default=0)
    proposal_metadata_title_max_length      = fields.BigIntField(default=0)
    proposal_title_max_length               = fields.BigIntField(default=0)
    proposal_description_max_length         = fields.BigIntField(default=0)
    proposal_invoice_max_length             = fields.BigIntField(default=0)
    proposal_source_code_max_length         = fields.BigIntField(default=0)
    current_round                           = fields.IntEnumField(enum_type=GovernanceRoundType, default=GovernanceRoundType.PROPOSAL)
    current_blocks_per_proposal_round       = fields.BigIntField(default=0)
    current_blocks_per_voting_round         = fields.BigIntField(default=0)
    current_blocks_per_timelock_round       = fields.BigIntField(default=0)
    current_round_start_level               = fields.BigIntField(default=0)
    current_round_end_level                 = fields.BigIntField(default=0)
    current_cycle_end_level                 = fields.BigIntField(default=0)
    current_cycle_total_voters_reward       = fields.FloatField(default=0)
    next_proposal_id                        = fields.BigIntField(default=0)
    cycle_id                                = fields.BigIntField(default=0)
    cycle_highest_voted_proposal_id         = fields.BigIntField(default=0)
    timelock_proposal_id                    = fields.BigIntField(default=0)

    class Meta:
        table = 'governance'

class GovernanceLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.Governance', related_name='lambdas')

    class Meta:
        table = 'governance_lambda'

class GovernanceGeneralContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.Governance', related_name='general_contracts')
    contract_name                           = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'governance_general_contract'

class GovernanceWhitelistContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.Governance', related_name='whitelist_contracts')

    class Meta:
        table = 'governance_whitelist_contract'

class WhitelistDeveloper(Model):
    id                                      = fields.BigIntField(pk=True)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='whitelist_developers')
    developer                               = fields.ForeignKeyField('models.MavrykUser', related_name='whitelist_developers')

    class Meta:
        table = 'whitelist_developer'

class GovernanceProposal(Model):
    id                                      = fields.BigIntField(pk=True)
    internal_id                             = fields.BigIntField(default=0)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='proposals')
    proposer                                = fields.ForeignKeyField('models.MavrykUser', related_name='governance_proposals_proposer', index=True)
    status                                  = fields.IntEnumField(enum_type=GovernanceActionStatus)
    execution_counter                       = fields.SmallIntField(default=0)
    title                                   = fields.TextField(default="")
    description                             = fields.TextField(default="")
    invoice                                 = fields.TextField(default="")
    source_code                             = fields.TextField(default="")
    executed                                = fields.BooleanField(default=False)
    locked                                  = fields.BooleanField(default=False)
    payment_processed                       = fields.BooleanField(default=False)
    reward_claim_ready                      = fields.BooleanField(default=False, index=True)
    execution_ready                         = fields.BooleanField(default=False)
    success_reward                          = fields.FloatField(default=0)
    total_voters_reward                     = fields.FloatField(default=0)
    proposal_vote_count                     = fields.BigIntField(default=0)
    proposal_vote_smvk_total                = fields.FloatField(default=0)
    min_proposal_round_vote_pct             = fields.BigIntField(default=0)
    min_proposal_round_vote_req             = fields.BigIntField(default=0)
    yay_vote_count                          = fields.BigIntField(default=0)
    yay_vote_smvk_total                     = fields.FloatField(default=0)
    nay_vote_count                          = fields.BigIntField(default=0)
    nay_vote_smvk_total                     = fields.FloatField(default=0)
    pass_vote_count                         = fields.BigIntField(default=0)
    pass_vote_smvk_total                    = fields.FloatField(default=0)
    min_quorum_percentage                   = fields.BigIntField(default=0)
    min_yay_vote_percentage                 = fields.FloatField(default=0)
    quorum_count                            = fields.BigIntField(default=0)
    quorum_smvk_total                       = fields.FloatField(default=0)
    start_datetime                          = fields.DatetimeField()
    execution_datetime                      = fields.DatetimeField(null=True)
    dropped_datetime                        = fields.DatetimeField(null=True)
    defeated_datetime                       = fields.DatetimeField(null=True)
    cycle                                   = fields.BigIntField(default=0)
    current_cycle_start_level               = fields.BigIntField(default=0)
    current_cycle_end_level                 = fields.BigIntField(default=0)
    current_round_proposal                  = fields.BooleanField(default=True)

    class Meta:
        table = 'governance_proposal'

class GovernanceProposalData(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_proposal                     = fields.ForeignKeyField('models.GovernanceProposal', related_name='data')
    internal_id                             = fields.SmallIntField(default=0)
    title                                   = fields.TextField(default="", null=True)
    code_description                        = fields.TextField(default="", null=True)
    encoded_code                            = fields.TextField(default="", null=True)

    class Meta:
        table = 'governance_proposal_data'

class GovernanceProposalPayment(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_proposal                     = fields.ForeignKeyField('models.GovernanceProposal', related_name='payments')
    internal_id                             = fields.SmallIntField(default=0)
    token                                   = fields.ForeignKeyField('models.Token', related_name='governance_proposals_payments', null=True)
    title                                   = fields.TextField(default="", null=True)
    to_                                     = fields.ForeignKeyField('models.MavrykUser', related_name='governance_proposals_payments', null=True)
    token_amount                            = fields.FloatField(default=0.0, null=True)

    class Meta:
        table = 'governance_proposal_payment'

class GovernanceProposalVote(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_proposal                     = fields.ForeignKeyField('models.GovernanceProposal', related_name='votes')
    voter                                   = fields.ForeignKeyField('models.MavrykUser', related_name='governance_proposals_votes')
    timestamp                               = fields.DatetimeField(auto_now=True)
    round                                   = fields.IntEnumField(enum_type=GovernanceRoundType, index=True)
    vote                                    = fields.IntEnumField(enum_type=GovernanceVoteType, default=GovernanceVoteType.YAY)
    voting_power                            = fields.FloatField(default=0.0)
    current_round_vote                      = fields.BooleanField(default=True)
    voting_reward_claimed                   = fields.BooleanField(default=False)

    class Meta:
        table = 'governance_proposal_vote'

class GovernanceSatelliteSnapshot(Model):
    id                                      = fields.BigIntField(pk=True)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='satellite_snapshots')
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_snapshots')
    ready                                   = fields.BooleanField(default=True, index=True)
    accumulated_rewards_per_share           = fields.FloatField(default=0.0)
    total_smvk_balance                      = fields.FloatField(default=0.0)
    total_delegated_amount                  = fields.FloatField(default=0.0)
    total_voting_power                      = fields.FloatField(default=0.0)
    next_snapshot_cycle_id                  = fields.BigIntField(null=True)
    latest                                  = fields.BooleanField(default=True, index=True)
    cycle                                   = fields.BigIntField(default=0)

    class Meta:
        table = 'governance_satellite_snapshot'

class GovernanceSMVKSnapshot(Model):
    id                                      = fields.BigIntField(pk=True)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='smvk_snapshots')
    smvk_total_supply                       = fields.FloatField(default=0.0)
    cycle                                   = fields.BigIntField(default=0, index=True)

    class Meta:
        table = 'governance_smvk_snapshot'
