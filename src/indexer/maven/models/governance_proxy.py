from dipdup.models import Model, fields
from maven.models.parents import ContractLambda, MavenContract

###
# Governance Proxy Tables
###

class GovernanceProxy(MavenContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='governance_proxies')
    
    class Meta:
        table = 'governance_proxy'

class GovernanceProxyLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceProxy', related_name='lambdas')

    class Meta:
        table = 'governance_proxy_lambda'
