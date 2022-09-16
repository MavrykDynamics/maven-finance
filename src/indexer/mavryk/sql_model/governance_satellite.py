from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract
from mavryk.sql_model.enums import GovernanceVoteType, GovernanceRecordStatus

###
# Governance Satellite Tables
###

class GovernanceSatellite(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='governance_satellites')
    gov_sat_approval_percentage             = fields.SmallIntField(default=0)
    gov_sat_duration_in_days                = fields.SmallIntField(default=0)
    gov_purpose_max_length                  = fields.SmallIntField(default=0)
    max_actions_per_satellite               = fields.SmallIntField(default=0)
    governance_satellite_counter            = fields.BigIntField(default=0)

    class Meta:
        table = 'governance_satellite'

class GovernanceSatelliteLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceSatellite', related_name='lambdas')

    class Meta:
        table = 'governance_satellite_lambda'

class GovernanceSatelliteGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceSatellite', related_name='general_contracts')

    class Meta:
        table = 'governance_satellite_general_contract'

class GovernanceSatelliteWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceSatellite', related_name='whitelist_contracts')

    class Meta:
        table = 'governance_satellite_whitelist_contract'

class GovernanceSatelliteActionRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite                    = fields.ForeignKeyField('models.GovernanceSatellite', related_name='governance_satellite_action_records')
    initiator                               = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_action_initiators')
    governance_type                         = fields.CharField(max_length=255)
    status                                  = fields.IntEnumField(enum_type=GovernanceRecordStatus, default=GovernanceRecordStatus.ACTIVE)
    executed                                = fields.BooleanField()
    governance_purpose                      = fields.TextField() #TODO: Should I reuse CharField instead?
    yay_vote_smvk_total                     = fields.FloatField(default=0.0)
    nay_vote_smvk_total                     = fields.FloatField(default=0.0)
    pass_vote_smvk_total                    = fields.FloatField(default=0.0)
    snapshot_smvk_total_supply              = fields.FloatField(default=0.0)
    smvk_percentage_for_approval            = fields.SmallIntField(default=0)
    smvk_required_for_approval              = fields.FloatField(default=0.0)
    execution_datetime                      = fields.DatetimeField(null=True)
    expiration_datetime                     = fields.DatetimeField(null=True)
    start_datetime                          = fields.DatetimeField(null=True)

    class Meta:
        table = 'governance_satellite_action_record'

class GovernanceSatelliteActionRecordVote(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_action             = fields.ForeignKeyField('models.GovernanceSatelliteActionRecord', related_name='votes')
    voter                                   = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_actions_votes')
    satellite_snapshot                      = fields.ForeignKeyField('models.GovernanceSatelliteSnapshotRecord', related_name='governance_satellite_actions_votes', null=True)
    timestamp                               = fields.DatetimeField(null=True)
    vote                                    = fields.IntEnumField(enum_type=GovernanceVoteType, default=GovernanceVoteType.YAY)
    class Meta:
        table = 'governance_satellite_action_record_vote'

class GovernanceSatelliteActionRecordParameter(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_action             = fields.ForeignKeyField('models.GovernanceSatelliteActionRecord', related_name='governance_satellite_action_parameters')
    name                                    = fields.TextField(default="")
    value                                   = fields.TextField(default="")

    class Meta:
        table = 'governance_satellite_action_record_parameter'

class GovernanceSatelliteActionRecordTransfer(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_action             = fields.ForeignKeyField('models.GovernanceSatelliteActionRecord', related_name='governance_satellite_action_transfers')
    token                                   = fields.ForeignKeyField('models.Token', related_name='governance_satellite_action_transfer_tokens', null=True)
    to_                                     = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_action_record_transfer_receiver')
    amount                                  = fields.BigIntField(default=0)

    class Meta:
        table = 'governance_satellite_action_record_transfer'

class GovernanceSatelliteAggregatorRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite                    = fields.ForeignKeyField('models.GovernanceSatellite', related_name='governance_satellite_aggregator_records')
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='governance_satellite_aggregator_records')
    creation_timestamp                      = fields.DatetimeField(null=True)
    token_0_symbol                          = fields.CharField(max_length=32, default="")
    token_1_symbol                          = fields.CharField(max_length=32, default="")
    active                                  = fields.BooleanField(default=True)

    class Meta:
        table = 'governance_satellite_aggregator_record'

class GovernanceSatelliteAggregatorRecordOracle(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_aggregator         = fields.ForeignKeyField('models.GovernanceSatelliteAggregatorRecord', related_name='governance_satellite_aggregator_record_oracles')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_aggregator_record_oracles')

    class Meta:
        table = 'governance_satellite_aggregator_record_oracle'

class GovernanceSatelliteSatelliteOracleRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite                    = fields.ForeignKeyField('models.GovernanceSatellite', related_name='governance_satellite_satellite_oracle_records')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_satellite_oracle_records')
    aggregators_subscribed                  = fields.BigIntField(default=0)

    class Meta:
        table = 'governance_satellite_satellite_oracle_record'

class GovernanceSatelliteSatelliteOracleAggregatorPairRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_satellite_oracle_record= fields.ForeignKeyField('models.GovernanceSatelliteSatelliteOracleRecord', related_name='aggregator_pairs')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_satellite_oracle_aggregator_pair_records')
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='governance_satellite_satellite_oracle_aggregator_pair_records')
    start_timestamp                         = fields.DatetimeField(null=True)
    token_0_symbol                          = fields.CharField(max_length=32)
    token_1_symbol                          = fields.CharField(max_length=32)

    class Meta:
        table = 'governance_satellite_satellite_oracle_aggregator_pair_record'