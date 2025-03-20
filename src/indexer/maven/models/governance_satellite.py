from dipdup.models import Model, fields
from maven.models.parents import LinkedContract, ContractLambda, MavenContract
from maven.models.enums import GovernanceVoteType, GovernanceActionStatus

###
# Governance Satellite Tables
###

class GovernanceSatellite(MavenContract, Model):
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
    governance_satellite                    = fields.ForeignKeyField('models.GovernanceSatellite', related_name='actions', index=True)
    initiator                               = fields.ForeignKeyField('models.MavenUser', related_name='governance_satellite_action_initiators', index=True)
    governance_type                         = fields.CharField(max_length=255, index=True)
    status                                  = fields.IntEnumField(enum_type=GovernanceActionStatus, default=GovernanceActionStatus.ACTIVE, index=True)
    executed                                = fields.BooleanField(default=False, index=True)
    governance_purpose                      = fields.TextField(default="")
    yay_vote_smvn_total                     = fields.FloatField(default=0.0)
    nay_vote_smvn_total                     = fields.FloatField(default=0.0)
    pass_vote_smvn_total                    = fields.FloatField(default=0.0)
    snapshot_smvn_total_supply              = fields.FloatField(default=0.0)
    smvn_percentage_for_approval            = fields.SmallIntField(default=0)
    smvn_required_for_approval              = fields.FloatField(default=0.0)
    execution_datetime                      = fields.DatetimeField(null=True, index=True)
    expiration_datetime                     = fields.DatetimeField(null=True, index=True)
    start_datetime                          = fields.DatetimeField(index=True)
    governance_cycle_id                     = fields.BigIntField(default=0, index=True)
    dropped_datetime                        = fields.DatetimeField(null=True)

    class Meta:
        table = 'governance_satellite_action'
        indexes = [
            ("status", "expiration_datetime"),
            ("executed", "status"),
            ("governance_satellite", "status"),
            ("initiator", "status"),
            ("governance_satellite", "expiration_datetime"),
        ]

class GovernanceSatelliteActionVote(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_action             = fields.ForeignKeyField('models.GovernanceSatelliteAction', related_name='votes')
    voter                                   = fields.ForeignKeyField('models.MavenUser', related_name='governance_satellite_actions_votes')
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
    oracle                                  = fields.ForeignKeyField('models.MavenUser', related_name='governance_satellite_oracles')

    class Meta:
        table = 'governance_satellite_oracle'

class GovernanceSatelliteOracleAggregator(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_oracle             = fields.ForeignKeyField('models.GovernanceSatelliteOracle', related_name='aggregators')
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='governance_satellite_oracle_aggregators')
    start_timestamp                         = fields.DatetimeField()

    class Meta:
        table = 'governance_satellite_oracle_aggregator'