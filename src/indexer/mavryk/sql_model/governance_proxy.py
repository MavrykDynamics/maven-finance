from dipdup.models import Model, fields
from mavryk.sql_model.parents import ContractLambda, MavrykContract

###
# Governance Proxy Tables
###

class GovernanceProxy(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='governance_proxies')
    
    class Meta:
        table = 'governance_proxy'

class GovernanceProxyLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceProxy', related_name='lambdas')

    class Meta:
        table = 'governance_proxy_lambda'
