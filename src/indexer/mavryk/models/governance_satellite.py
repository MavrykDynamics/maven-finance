from dipdup.models import Model, fields
from mavryk.models.parents import LinkedContract, ContractLambda, MavrykContract
from mavryk.models.enums import GovernanceVoteType, GovernanceActionStatus

###
# Governance Satellite Tables
###

class GovernanceSatellite(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='governance_satellites')
    approval_percentage                     = fields.SmallIntField(default=0)
    sat_action_duration_in_days             = fields.SmallIntField(default=0)
    gov_purpose_max_length                  = fields.SmallIntField(default=0)
    max_actions_per_satellite               = fields.SmallIntField(default=0)
    governance_satellite_counter            = fields.BigIntField(default=0)

    class Meta:
        table = 'governance_satellite'

class GovernanceSatelliteLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceSatellite', related_name='lambdas')

    class Meta:
        table = 'governance_satellite_lambda'

class GovernanceSatelliteGeneralContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceSatellite', related_name='general_contracts')
    contract_name                           = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'governance_satellite_general_contract'

class GovernanceSatelliteWhitelistContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceSatellite', related_name='whitelist_contracts')

    class Meta:
        table = 'governance_satellite_whitelist_contract'

class GovernanceSatelliteAction(Model):
    id                                      = fields.BigIntField(pk=True)
    internal_id                             = fields.BigIntField(default=0)
    governance_satellite                    = fields.ForeignKeyField('models.GovernanceSatellite', related_name='actions')
    initiator                               = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_action_initiators')
    governance_type                         = fields.CharField(max_length=255)
    status                                  = fields.IntEnumField(enum_type=GovernanceActionStatus, default=GovernanceActionStatus.ACTIVE, index=True)
    executed                                = fields.BooleanField(default=False)
    governance_purpose                      = fields.TextField(default="")
    yay_vote_smvk_total                     = fields.FloatField(default=0.0)
    nay_vote_smvk_total                     = fields.FloatField(default=0.0)
    pass_vote_smvk_total                    = fields.FloatField(default=0.0)
    snapshot_smvk_total_supply              = fields.FloatField(default=0.0)
    smvk_percentage_for_approval            = fields.SmallIntField(default=0)
    smvk_required_for_approval              = fields.FloatField(default=0.0)
    execution_datetime                      = fields.DatetimeField(null=True)
    expiration_datetime                     = fields.DatetimeField(null=True)
    start_datetime                          = fields.DatetimeField()
    governance_cycle_id                     = fields.BigIntField(default=0)
    dropped_datetime                        = fields.DatetimeField(null=True)

    class Meta:
        table = 'governance_satellite_action'

class GovernanceSatelliteActionVote(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_action             = fields.ForeignKeyField('models.GovernanceSatelliteAction', related_name='votes')
    voter                                   = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_actions_votes')
    satellite_snapshot                      = fields.ForeignKeyField('models.GovernanceSatelliteSnapshot', related_name='governance_satellite_actions_votes')
    timestamp                               = fields.DatetimeField(auto_now=True)
    vote                                    = fields.IntEnumField(enum_type=GovernanceVoteType, default=GovernanceVoteType.YAY)
    class Meta:
        table = 'governance_satellite_action_vote'

class GovernanceSatelliteActionParameter(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_action             = fields.ForeignKeyField('models.GovernanceSatelliteAction', related_name='parameters')
    name                                    = fields.TextField(default="")
    value                                   = fields.TextField(default="")

    class Meta:
        table = 'governance_satellite_action_parameter'

class GovernanceSatelliteOracle(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite                    = fields.ForeignKeyField('models.GovernanceSatellite', related_name='oracles')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_oracles')

    class Meta:
        table = 'governance_satellite_oracle'

class GovernanceSatelliteOracleAggregator(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_oracle             = fields.ForeignKeyField('models.GovernanceSatelliteOracle', related_name='aggregators')
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='governance_satellite_oracle_aggregators')
    start_timestamp                         = fields.DatetimeField()

    class Meta:
        table = 'governance_satellite_oracle_aggregator'