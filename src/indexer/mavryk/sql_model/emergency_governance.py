from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract

###
# Emergency Governance Tables
###

class EmergencyGovernance(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='emergency_governances')
    decimals                                = fields.SmallIntField(default=0)
    min_smvk_required_to_trigger            = fields.FloatField(default=0)
    min_smvk_required_to_vote               = fields.FloatField(default=0)
    proposal_desc_max_length                = fields.SmallIntField(default=0)
    proposal_title_max_length               = fields.SmallIntField(default=0)
    required_fee_mutez                      = fields.BigIntField(default=0)
    smvk_percentage_required                = fields.SmallIntField(default=0)
    duration_in_minutes                     = fields.BigIntField(default=0)
    current_emergency_record_id             = fields.BigIntField(default=0)
    next_emergency_record_id                = fields.BigIntField(default=0)

    class Meta:
        table = 'emergency_governance'

class EmergencyGovernanceLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.EmergencyGovernance', related_name='lambdas')

    class Meta:
        table = 'emergency_governance_lambda'

class EmergencyGovernanceGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.EmergencyGovernance', related_name='general_contracts')
    contract_name                           = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'emergency_governance_general_contract'

class EmergencyGovernanceWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.EmergencyGovernance', related_name='whitelist_contracts')

    class Meta:
        table = 'emergency_governance_whitelist_contract'

class EmergencyGovernanceRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    internal_id                             = fields.BigIntField(default=0)
    emergency_governance                    = fields.ForeignKeyField('models.EmergencyGovernance', related_name='emergency_governance_records', index=True)
    proposer                                = fields.ForeignKeyField('models.MavrykUser', related_name='emergency_governance_proposer', index=True)
    executed                                = fields.BooleanField(default=False, index=True)
    title                                   = fields.TextField(default="")
    description                             = fields.TextField(default="")
    total_smvk_votes                        = fields.FloatField(default=0)
    smvk_percentage_required                = fields.FloatField(default=0)
    smvk_required_for_trigger               = fields.FloatField(default=0)
    start_timestamp                         = fields.DatetimeField(index=True)
    execution_datetime                      = fields.DatetimeField(index=True, null=True)
    expiration_timestamp                    = fields.DatetimeField(index=True)
    start_level                             = fields.BigIntField(default=0, index=True)
    execution_level                         = fields.BigIntField(default=0, index=True, null=True)

    class Meta:
        table = 'emergency_governance_record'

class EmergencyGovernanceVote(Model):
    id                                      = fields.BigIntField(pk=True)
    emergency_governance_record             = fields.ForeignKeyField('models.EmergencyGovernanceRecord', related_name='voters', index=True)
    voter                                   = fields.ForeignKeyField('models.MavrykUser', related_name='emergency_governance_votes', index=True)
    timestamp                               = fields.DatetimeField(index=True)
    smvk_amount                             = fields.FloatField(default=0.0)

    class Meta:
        table = 'emergency_governance_vote'