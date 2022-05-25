from pickle import NONE
from xml.etree.ElementInclude import DEFAULT_MAX_INCLUSION_DEPTH
from tortoise import Model, fields
from enum import IntEnum


class ExampleModel(Model):
    id = fields.IntField(pk=True)
    ...

    class Meta:
        table = 'example_models'

class StakeType(IntEnum):
    STAKE       = 0
    UNSTAKE     = 1
    FARM_CLAIM  = 2
    COMPOUND    = 3

class ActionStatus(IntEnum):
    PENDING     = 0
    FLUSHED     = 1
    EXECUTED    = 2

class GovernanceRoundType(IntEnum):
    PROPOSAL    = 0
    VOTING      = 1
    TIMELOCK    = 2

class GovernanceRecordStatus(IntEnum):
    ACTIVE      = 0
    DROPPED     = 1

class GovernanceVoteType(IntEnum):
    NAY         = 0
    YAY         = 1
    ABSTAIN     = 2

class TokenType(IntEnum):
    XTZ         = 0
    FA12        = 1
    FA2         = 2
    OTHER       = 3

class GeneralContract(Model):
    id                              = fields.BigIntField(pk=True)
    target_contract                 = fields.CharField(max_length=36, default="")
    contract_name                   = fields.CharField(max_length=36, default="")
    contract_address                = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'general_contract'

class WhitelistContract(Model):
    id                              = fields.BigIntField(pk=True)
    target_contract                 = fields.CharField(max_length=36, default="")
    contract_name                   = fields.CharField(max_length=36, default="")
    contract_address                = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'whitelist_contract'

class WhitelistTokenContract(Model):
    id                              = fields.BigIntField(pk=True)
    target_contract                 = fields.CharField(max_length=36, default="")
    contract_name                   = fields.CharField(max_length=36, default="")
    contract_address                = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'whitelist_token_contract'

class WhitelistDeveloper(Model):
    id                              = fields.BigIntField(pk=True)
    governance                      = fields.ForeignKeyField('models.Governance', related_name='whitelist_developers')
    developer                       = fields.ForeignKeyField('models.MavrykUser', related_name='whitelist_developers')

    class Meta:
        table = 'whitelist_developer'

class MVKToken(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    admin                           = fields.CharField(max_length=36)
    governance                      = fields.ForeignKeyField('models.Governance', related_name='mvk_token')
    maximum_supply                  = fields.BigIntField(default=0)
    total_supply                    = fields.BigIntField(default=0)
    inflation_rate                  = fields.SmallIntField(default=0)
    next_inflation_timestamp        = fields.DatetimeField()

    class Meta:
        table = 'mvk_token'

class Doorman(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    admin                           = fields.CharField(max_length=36)
    governance                      = fields.ForeignKeyField('models.Governance', related_name='doormans')
    min_mvk_amount                  = fields.FloatField(default=0)
    unclaimed_rewards               = fields.FloatField(default=0)
    accumulated_fees_per_share      = fields.FloatField(default=0)
    stake_paused                    = fields.BooleanField(default=False)
    unstake_paused                  = fields.BooleanField(default=False)
    compound_paused                 = fields.BooleanField(default=False)
    farm_claimed_paused             = fields.BooleanField(default=False)

    class Meta:
        table = 'doorman'

class Farm(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    admin                           = fields.CharField(max_length=36, default='')
    governance                      = fields.ForeignKeyField('models.Governance', related_name='farms', null=True)
    blocks_per_minute               = fields.SmallIntField(default=0)
    force_rewards_from_transfer     = fields.BooleanField(default=False)
    infinite                        = fields.BooleanField(default=False)
    lp_token_address                = fields.CharField(max_length=36, default='')
    lp_token_id                     = fields.SmallIntField(default=0)
    lp_token_standard               = fields.IntEnumField(enum_type=TokenType, default=TokenType.OTHER)
    lp_token_balance                = fields.BigIntField(default=0)
    total_blocks                    = fields.BigIntField(default=0)
    current_reward_per_block        = fields.FloatField(default=0)
    total_rewards                   = fields.FloatField(default=0)
    deposit_paused                  = fields.BooleanField(default=False)
    withdraw_paused                 = fields.BooleanField(default=False)
    claim_paused                    = fields.BooleanField(default=False)
    last_block_update               = fields.BigIntField(default=0)
    open                            = fields.BooleanField(default=False)
    init                            = fields.BooleanField(default=False)
    init_block                      = fields.BigIntField(default=0)
    accumulated_rewards_per_share   = fields.FloatField(default=0)
    unpaid_rewards                  = fields.FloatField(default=0)
    paid_rewards                    = fields.FloatField(default=0)
    farm_factory                    = fields.ForeignKeyField('models.FarmFactory', related_name='farms', null=True)

    class Meta:
        table = 'farm'

class FarmFactory(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    admin                           = fields.CharField(max_length=36)
    governance                      = fields.ForeignKeyField('models.Governance', related_name='farm_factories')
    create_farm_paused              = fields.BooleanField(default=False)
    track_farm_paused               = fields.BooleanField(default=False)
    untrack_farm_paused             = fields.BooleanField(default=False)

    class Meta:
        table = 'farm_factory'

class Delegation(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    admin                           = fields.CharField(max_length=36)
    governance                      = fields.ForeignKeyField('models.Governance', related_name='delegations')
    minimum_smvk_balance            = fields.FloatField(default=0)
    delegation_ratio                = fields.SmallIntField(default=0)
    max_satellites                  = fields.SmallIntField(default=0)
    satellite_name_max_length       = fields.SmallIntField(default=0)
    satellite_description_max_length= fields.SmallIntField(default=0)
    satellite_image_max_length      = fields.SmallIntField(default=0)
    satellite_website_max_length    = fields.SmallIntField(default=0)
    delegate_to_satellite_paused    = fields.BooleanField(default=False)
    undelegate_from_satellite_paused= fields.BooleanField(default=False)
    register_as_satellite_paused    = fields.BooleanField(default=False)
    unregister_as_satellite_paused  = fields.BooleanField(default=False)
    update_satellite_record_paused  = fields.BooleanField(default=False)
    distribute_reward_paused        = fields.BooleanField(default=False)

    class Meta:
        table = 'delegation'

class Council(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    admin                           = fields.CharField(max_length=36)
    governance                      = fields.ForeignKeyField('models.Governance', related_name='councils')
    threshold                       = fields.BigIntField(default=0)
    action_expiry_days              = fields.BigIntField(default=0)
    action_counter                  = fields.BigIntField(default=0)

    class Meta:
        table = 'council'

class Vesting(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    admin                           = fields.CharField(max_length=36)
    governance                      = fields.ForeignKeyField('models.Governance', related_name='vestings')
    total_vested_amount             = fields.BigIntField(default=0)

    class Meta:
        table = 'vesting'

class EmergencyGovernance(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    admin                           = fields.CharField(max_length=36)
    governance                      = fields.ForeignKeyField('models.Governance', related_name='emergency_governances')
    decimals                        = fields.SmallIntField(default=0)
    min_smvk_required_to_trigger    = fields.FloatField(default=0)
    min_smvk_required_to_vote       = fields.FloatField(default=0)
    proposal_desc_max_length        = fields.SmallIntField(default=0)
    proposal_title_max_length       = fields.SmallIntField(default=0)
    required_fee_mutez              = fields.BigIntField(default=0)
    smvk_percentage_required        = fields.SmallIntField(default=0)
    vote_expiry_days                = fields.SmallIntField(default=0)
    current_emergency_record_id     = fields.BigIntField(default=0)
    next_emergency_record_id        = fields.BigIntField(default=0)

    class Meta:
        table = 'emergency_governance'

class BreakGlass(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    admin                           = fields.CharField(max_length=36)
    governance                      = fields.ForeignKeyField('models.Governance', related_name='break_glasses')
    threshold                       = fields.SmallIntField(default=0)
    action_expiry_days              = fields.SmallIntField(default=0)
    council_member_name_max_length  = fields.SmallIntField(default=0)
    council_member_website_max_length= fields.SmallIntField(default=0)
    council_member_image_max_length = fields.SmallIntField(default=0)
    glass_broken                    = fields.BooleanField(default=False)
    action_counter                  = fields.BigIntField(default=0)

    class Meta:
        table = 'break_glass'

class Governance(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    governance_proxy_address        = fields.CharField(max_length=36, default="")
    success_reward                  = fields.FloatField(default=0)
    cycle_voters_reward             = fields.FloatField(default=0)
    proposal_round_vote_percentage  = fields.SmallIntField(default=0)
    proposal_round_vote_required    = fields.BigIntField(default=0)
    quorum_percentage               = fields.SmallIntField(default=0)
    quorum_mvk_total                = fields.BigIntField(default=0)
    voting_power_ratio              = fields.SmallIntField(default=0)
    proposal_submission_fee_mutez   = fields.BigIntField(default=0)
    minimum_stake_req_percentage    = fields.SmallIntField(default=0)
    max_proposal_per_delegate       = fields.SmallIntField(default=0)
    blocks_per_minute               = fields.SmallIntField(default=0)
    blocks_per_proposal_round       = fields.BigIntField(default=0)
    blocks_per_voting_round         = fields.BigIntField(default=0)
    blocks_per_timelock_round       = fields.BigIntField(default=0)
    proposal_metadata_title_max_length= fields.BigIntField(default=0)
    proposal_title_max_length       = fields.BigIntField(default=0)
    proposal_description_max_length = fields.BigIntField(default=0)
    proposal_invoice_max_length     = fields.BigIntField(default=0)
    proposal_source_code_max_length = fields.BigIntField(default=0)
    current_round                   = fields.IntEnumField(enum_type=GovernanceRoundType, default=GovernanceRoundType.PROPOSAL)
    current_blocks_per_proposal_round= fields.BigIntField(default=0)
    current_blocks_per_voting_round = fields.BigIntField(default=0)
    current_blocks_per_timelock_round= fields.BigIntField(default=0)
    current_round_start_level       = fields.BigIntField(default=0)
    current_round_end_level         = fields.BigIntField(default=0)
    current_cycle_end_level         = fields.BigIntField(default=0)
    current_cycle_total_voters_reward= fields.FloatField(default=0)
    next_proposal_id                = fields.BigIntField(default=0)
    cycle_counter                   = fields.BigIntField(default=0)
    current_round_highest_voted_proposal_id = fields.BigIntField(default=0)
    timelock_proposal_id            = fields.BigIntField(default=0)

    class Meta:
        table = 'governance'

class GovernanceFinancial(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    governance                      = fields.CharField(max_length=36)
    voting_power_ratio              = fields.SmallIntField(default=0)
    fin_req_approval_percentage     = fields.SmallIntField(default=0)
    fin_req_duration_in_days        = fields.SmallIntField(default=0)
    fin_req_counter                 = fields.BigIntField(default=0)

    class Meta:
        table = 'governance_financial'

class MavrykUser(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    mvk_balance                     = fields.BigIntField(default=0)
    smvk_balance                    = fields.BigIntField(default=0)
    participation_fees_per_share    = fields.FloatField(default=0)
    doorman                         = fields.ForeignKeyField('models.Doorman', related_name='stake_accounts', null=True)

    class Meta:
        table = 'mavryk_user'

class Treasury(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    admin                           = fields.CharField(max_length=36)
    governance                      = fields.ForeignKeyField('models.Governance', related_name='treasuries')
    transfer_paused                 = fields.BooleanField(default=False)
    mint_mvk_and_transfer_paused    = fields.BooleanField(default=False)
    stake_mvk                       = fields.BooleanField(default=False)
    unstake_mvk                     = fields.BooleanField(default=False)

    class Meta:
        table = 'treasury'

class TreasuryFactory(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    admin                           = fields.CharField(max_length=36)
    governance                      = fields.ForeignKeyField('models.Governance', related_name='treasury_factories')
    create_treasury_paused          = fields.BooleanField(default=False)
    track_treasury_paused           = fields.BooleanField(default=False)
    untrack_treasury_paused         = fields.BooleanField(default=False)

    class Meta:
        table = 'treasury_factory'

class MavrykUserOperator(Model):
    id                              = fields.BigIntField(pk=True, default=0)
    owner                           = fields.ForeignKeyField('models.MavrykUser', related_name='users_owner')
    operator                        = fields.ForeignKeyField('models.MavrykUser', related_name='user_operators')

    class Meta:
        table = 'mavryk_user_operator'

class FarmAccount(Model):
    id                              = fields.BigIntField(pk=True, default=0)
    deposited_amount                = fields.BigIntField(default=0)
    participation_mvk_per_share     = fields.FloatField(default=0)
    user                            = fields.ForeignKeyField('models.MavrykUser', related_name='farm_accounts', index=True)
    farm                            = fields.ForeignKeyField('models.Farm', related_name='farm_accounts', index=True)

    class Meta:
        table = 'farm_account'

class SatelliteRewardsRecord(Model):
    id                              = fields.BigIntField(pk=True, default=0)
    user                            = fields.ForeignKeyField('models.MavrykUser', related_name='satellite_rewards')
    reference                       = fields.ForeignKeyField('models.SatelliteRewardsRecord', related_name='satellite_references', null=True)
    delegation                      = fields.ForeignKeyField('models.Delegation', related_name='satellite_rewards_records')
    unpaid                          = fields.FloatField(default=0)
    paid                            = fields.FloatField(default=0)
    participation_rewards_per_share = fields.FloatField(default=0)
    satellite_accumulated_reward_per_share= fields.FloatField(default=0)

    class Meta:
        table = 'satellite_rewards_record'

class SatelliteRecord(Model):
    id                              = fields.BigIntField(pk=True, default=0)
    user                            = fields.ForeignKeyField('models.MavrykUser', related_name='satellite_record')
    delegation                      = fields.ForeignKeyField('models.Delegation', related_name='satellite_records')
    active                          = fields.BooleanField(default=True)
    fee                             = fields.SmallIntField(default=0)
    name                            = fields.CharField(max_length=255, default="")
    description                     = fields.CharField(max_length=255, default="")
    image                           = fields.CharField(max_length=255, default="")
    website                         = fields.CharField(max_length=255, default="")

    class Meta:
        table = 'satellite_record'

class DelegationRecord(Model):
    id                              = fields.BigIntField(pk=True)
    satellite_record                = fields.ForeignKeyField('models.SatelliteRecord', related_name='delegation_records', null=True)
    user                            = fields.ForeignKeyField('models.MavrykUser', related_name='delegation_records')
    delegation                      = fields.ForeignKeyField('models.Delegation', related_name='delegation_records')

    class Meta:
        table = 'delegation_record'

class TransferRecord(Model):
    id                              = fields.BigIntField(pk=True)
    timestamp                       = fields.DatetimeField()
    token_address                   = fields.ForeignKeyField('models.MVKToken', related_name='transfer_records')
    from_                           = fields.ForeignKeyField('models.MavrykUser', related_name='transfer_sender')
    to_                             = fields.ForeignKeyField('models.MavrykUser', related_name='transfer_receiver')
    amount                          = fields.BigIntField(default=0)

    class Meta:
        table = 'transfer_record'

class StakeRecord(Model):
    id                              = fields.BigIntField(pk=True)
    timestamp                       = fields.DatetimeField()
    type                            = fields.IntEnumField(enum_type=StakeType)
    mvk_loyalty_index               = fields.FloatField(default=0.0)
    from_                           = fields.ForeignKeyField('models.MavrykUser', related_name='stake_records')
    desired_amount                  = fields.BigIntField(default=0)
    final_amount                    = fields.BigIntField(default=0)
    doorman                         = fields.ForeignKeyField('models.Doorman', related_name='stake_records')

    class Meta:
        table = 'stake_record'

class CouncilActionRecord(Model):
    id                              = fields.BigIntField(pk=True)
    council                         = fields.ForeignKeyField('models.Council', related_name='council_action_records')
    initiator                       = fields.ForeignKeyField('models.MavrykUser', related_name='council_actions_initiator')
    start_datetime                  = fields.DatetimeField()
    executed_datetime               = fields.DatetimeField()
    expiration_datetime             = fields.DatetimeField()
    action_type                     = fields.CharField(max_length=48)
    status                          = fields.IntEnumField(enum_type=ActionStatus)
    executed                        = fields.BooleanField(default=False)

    class Meta:
        table = 'council_action_record'

class CouncilActionRecordSigner(Model):
    id                              = fields.BigIntField(pk=True)
    council_action_record           = fields.ForeignKeyField('models.CouncilActionRecord', related_name='signers')
    signer                          = fields.ForeignKeyField('models.MavrykUser', related_name='council_actions_signer')

    class Meta:
        table = 'council_action_record_signer'

class CouncilActionRecordParameter(Model):
    id                              = fields.BigIntField(pk=True)
    council_action_record           = fields.ForeignKeyField('models.CouncilActionRecord', related_name='council_action_record_parameters')
    name                            = fields.CharField(max_length=255)
    value                           = fields.CharField(max_length=255)

    class Meta:
        table = 'council_action_record_parameter'

class VestingVesteeRecord(Model):
    id                              = fields.BigIntField(pk=True)
    vesting                         = fields.ForeignKeyField('models.Vesting', related_name='vesting_vestee_records')
    vestee                          = fields.ForeignKeyField('models.MavrykUser', related_name='vesting_vestee_record')
    total_allocated_amount          = fields.BigIntField(default=0)
    claim_amount_per_month          = fields.BigIntField(default=0)
    start_timestamp                 = fields.DatetimeField()
    vesting_months                  = fields.BigIntField(default=0)
    cliff_months                    = fields.BigIntField(default=0)
    end_cliff_timestamp             = fields.DatetimeField()
    end_vesting_timestamp           = fields.DatetimeField()
    locked                          = fields.BooleanField(default=False)
    total_remainder                 = fields.BigIntField(default=0)
    total_claimed                   = fields.BigIntField(default=0)
    months_claimed                  = fields.BigIntField(default=0)
    months_remaining                = fields.BigIntField(default=0)
    next_redemption_timestamp       = fields.DatetimeField()
    last_claimed_timestamp          = fields.DatetimeField()

    class Meta:
        table = 'vesting_vestee_record'

class VestingClaimRecord(Model):
    id                              = fields.BigIntField(pk=True)
    vesting                         = fields.ForeignKeyField('models.Vesting', related_name='vesting_claim_records')
    user                            = fields.ForeignKeyField('models.MavrykUser', related_name='vesting_claim_record')
    timestamp                       = fields.DatetimeField()
    amount_claimed                  = fields.BigIntField(default=0)
    remainder_vested                = fields.BigIntField(default=0)

    class Meta:
        table = 'vesting_claim_record'

class EmergencyGovernanceRecord(Model):
    id                              = fields.BigIntField(pk=True)
    emergency_governance            = fields.ForeignKeyField('models.EmergencyGovernance', related_name='emergency_governance_records')
    proposer                        = fields.ForeignKeyField('models.MavrykUser', related_name='emergency_governance_proposer')
    executed                        = fields.BooleanField(default=False)
    dropped                         = fields.BooleanField(default=False)
    title                           = fields.CharField(max_length=255)
    description                     = fields.CharField(max_length=255)
    total_smvk_votes                = fields.FloatField(default=0)
    smvk_percentage_required        = fields.FloatField(default=0)
    smvk_required_for_trigger       = fields.FloatField(default=0)
    start_timestamp                 = fields.DatetimeField()
    executed_timestamp              = fields.DatetimeField()
    expiration_timestamp            = fields.DatetimeField()
    start_level                     = fields.BigIntField(default=0)
    executed_level                  = fields.BigIntField(default=0)

    class Meta:
        table = 'emergency_governance_record'

class EmergencyGovernanceVote(Model):
    id                              = fields.BigIntField(pk=True)
    timestamp                       = fields.DatetimeField()
    emergency_governance_record     = fields.ForeignKeyField('models.EmergencyGovernanceRecord', related_name='voters')
    voter                           = fields.ForeignKeyField('models.MavrykUser', related_name='emergency_governance_votes')
    smvk_amount                     = fields.BigIntField(default=0)

    class Meta:
        table = 'emergency_governance_vote'

class BreakGlassCouncilMember(Model):
    id                              = fields.BigIntField(pk=True)
    user                            = fields.ForeignKeyField('models.MavrykUser', related_name='council_member')
    break_glass                     = fields.ForeignKeyField('models.BreakGlass', related_name='break_glass_council_members')
    name                            = fields.CharField(max_length=255)
    website                         = fields.CharField(max_length=255)
    image                           = fields.CharField(max_length=255)

    class Meta:
        table = 'break_glass_council_member'

class BreakGlassActionRecord(Model):
    id                              = fields.BigIntField(pk=True)
    break_glass                     = fields.ForeignKeyField('models.BreakGlass', related_name='break_glass_action_records')
    initiator                       = fields.ForeignKeyField('models.MavrykUser', related_name='break_glass_actions_initiator')
    start_datetime                  = fields.DatetimeField()
    executed_datetime               = fields.DatetimeField()
    executed_level                  = fields.BigIntField(default=0)
    expiration_datetime             = fields.DatetimeField()
    action_type                     = fields.CharField(max_length=48)
    status                          = fields.IntEnumField(enum_type=ActionStatus)
    executed                        = fields.BooleanField(default=False)
    signers_count                   = fields.SmallIntField(default=1)

    class Meta:
        table = 'break_glass_action_record'

class BreakGlassActionRecordSigner(Model):
    id                              = fields.BigIntField(pk=True)
    break_glass_action_record       = fields.ForeignKeyField('models.BreakGlassActionRecord', related_name='signers')
    signer                          = fields.ForeignKeyField('models.MavrykUser', related_name='break_glass_actions_signer')

    class Meta:
        table = 'break_glass_action_record_signer'

class BreakGlassActionRecordParameter(Model):
    id                              = fields.BigIntField(pk=True)
    break_glass_action_record       = fields.ForeignKeyField('models.BreakGlassActionRecord', related_name='break_glass_action_record_parameters')
    name                            = fields.CharField(max_length=255)
    value                           = fields.CharField(max_length=255)

    class Meta:
        table = 'break_glass_action_record_parameter'

class GovernanceProposalRecord(Model):
    id                              = fields.BigIntField(pk=True)
    governance                      = fields.ForeignKeyField('models.Governance', related_name='governance_proposal_records')
    proposer                        = fields.ForeignKeyField('models.MavrykUser', related_name='governance_proposal_records_proposer')
    status                          = fields.IntEnumField(enum_type=GovernanceRecordStatus)
    execution_counter               = fields.SmallIntField(default=0)
    title                           = fields.CharField(max_length=255)
    description                     = fields.CharField(max_length=255)
    invoice                         = fields.CharField(max_length=255)
    source_code                     = fields.TextField(default="")
    executed                        = fields.BooleanField(default=False)
    locked                          = fields.BooleanField(default=False)
    payment_processed               = fields.BooleanField(default=False)
    success_reward                  = fields.FloatField(default=0)
    pass_vote_count                 = fields.BigIntField(default=0)
    pass_vote_mvk_total             = fields.FloatField(default=0)
    min_proposal_round_vote_pct     = fields.BigIntField(default=0)
    min_proposal_round_vote_req     = fields.BigIntField(default=0)
    up_vote_count                   = fields.BigIntField(default=0)
    up_vote_mvk_total               = fields.FloatField(default=0)
    down_vote_count                 = fields.BigIntField(default=0)
    down_vote_mvk_total             = fields.FloatField(default=0)
    abstain_vote_count              = fields.BigIntField(default=0)
    abstain_mvk_total               = fields.FloatField(default=0)
    min_quorum_percentage           = fields.BigIntField(default=0)
    min_quorum_mvk_total            = fields.FloatField(default=0)
    quorum_vote_count               = fields.BigIntField(default=0)
    quorum_mvk_total                = fields.FloatField(default=0)
    start_datetime                  = fields.DatetimeField()
    cycle                           = fields.BigIntField(default=0)
    current_cycle_start_level       = fields.BigIntField(default=0)
    current_cycle_end_level         = fields.BigIntField(default=0)
    current_round_proposal          = fields.BooleanField(default=True)

    class Meta:
        table = 'governance_proposal_record'

class GovernanceProposalRecordData(Model):
    id                              = fields.BigIntField(pk=True)
    record_internal_id              = fields.SmallIntField(default=0)
    governance_proposal_record      = fields.ForeignKeyField('models.GovernanceProposalRecord', related_name='proposal_data')
    title                           = fields.CharField(max_length=255)
    bytes                           = fields.TextField(default="")

    class Meta:
        table = 'governance_proposal_record_data'

class GovernanceProposalRecordPayment(Model):
    id                              = fields.BigIntField(pk=True)
    record_internal_id              = fields.SmallIntField(default=0)
    governance_proposal_record      = fields.ForeignKeyField('models.GovernanceProposalRecord', related_name='proposal_payments')
    title                           = fields.CharField(max_length=255)
    to_                             = fields.ForeignKeyField('models.MavrykUser', related_name='proposal_payments', null=True)
    token_address                   = fields.CharField(max_length=36, default="")
    token_id                        = fields.CharField(max_length=36, default="")
    token_standard                  = fields.IntEnumField(enum_type=TokenType, default=TokenType.OTHER)
    token_amount                    = fields.FloatField(default=0.0)

    class Meta:
        table = 'governance_proposal_record_payment'

class GovernanceProposalRecordVote(Model):
    id                              = fields.BigIntField(pk=True)
    governance_proposal_record      = fields.ForeignKeyField('models.GovernanceProposalRecord', related_name='votes', null=True)
    voter                           = fields.ForeignKeyField('models.MavrykUser', related_name='governance_proposal_records_votes')
    round                           = fields.IntEnumField(enum_type=GovernanceRoundType)
    vote                            = fields.IntEnumField(enum_type=GovernanceVoteType, default=GovernanceVoteType.YAY)
    voting_power                    = fields.FloatField()
    current_round_vote              = fields.BooleanField(default=True)

    class Meta:
        table = 'governance_proposal_record_vote'

class GovernanceLambdaRecord(Model):
    id                              = fields.BigIntField(pk=True)
    governance                      = fields.ForeignKeyField('models.Governance', related_name='governance_lambda_records')
    lambda_function                 = fields.TextField()

    class Meta:
        table = 'governance_lambda_record'

class GovernanceSatelliteSnapshotRecord(Model):
    id                              = fields.BigIntField(pk=True)
    governance                      = fields.ForeignKeyField('models.Governance', related_name='governance_satellite_snapshot_records')
    user                            = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_snapshot_records_votes')
    total_mvk_balance               = fields.FloatField(default=0.0)
    total_delegated_amount          = fields.FloatField(default=0.0)
    total_voting_power              = fields.FloatField(default=0.0)
    cycle                           = fields.BigIntField(default=0)

    class Meta:
        table = 'governance_satellite_snapshot_record'

class GovernanceFinancialRequestRecord(Model):
    id                              = fields.BigIntField(pk=True)
    governance_financial            = fields.ForeignKeyField('models.GovernanceFinancial', related_name='governance_financial_request_records')
    treasury                        = fields.ForeignKeyField('models.Treasury', related_name='governance_financial_request_records')
    requester                       = fields.ForeignKeyField('models.MavrykUser', related_name='governance_financial_request_records')
    request_type                    = fields.CharField(max_length=255)
    status                          = fields.IntEnumField(enum_type=GovernanceRecordStatus, default=GovernanceRecordStatus.ACTIVE)
    ready                           = fields.BooleanField()
    executed                        = fields.BooleanField()
    token_contract_address          = fields.CharField(max_length=36)
    token_amount                    = fields.FloatField(default=0.0)
    token_name                      = fields.CharField(max_length=255)
    token_id                        = fields.BigIntField(default=0)
    request_purpose                 = fields.CharField(max_length=255)
    approve_vote_total              = fields.FloatField(default=0.0)
    disapprove_vote_total           = fields.FloatField(default=0.0)
    smvk_percentage_for_approval    = fields.BigIntField(default=0)
    snapshot_smvk_total_supply      = fields.FloatField(default=0.0)
    smvk_required_for_approval      = fields.FloatField(default=0.0)
    expiration_datetime             = fields.DatetimeField()
    requested_datetime              = fields.DatetimeField()

    class Meta:
        table = 'governance_financial_request_record'

class GovernanceFinancialRequestRecordVote(Model):
    id                              = fields.BigIntField(pk=True)
    governance_financial_request    = fields.ForeignKeyField('models.GovernanceFinancialRequestRecord', related_name='votes')
    voter                           = fields.ForeignKeyField('models.SatelliteRecord', related_name='governance_financial_requests_votes')
    timestamp                       = fields.DatetimeField(null=True)
    vote                            = fields.IntEnumField(enum_type=GovernanceVoteType, default=GovernanceVoteType.YAY)
    voting_power                    = fields.FloatField(default=0.0)

    class Meta:
        table = 'governance_financial_request_vote'
