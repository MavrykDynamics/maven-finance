type send_fa12_type       is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")

type fa12_transfer_type  is FA12_transfer of send_fa12_type

type fa12_get_balance_type  is michelson_pair(address, "owner", contract(nat), "")

type fa12_balance_of_type  is FA12_balance_of of fa12_get_balance_type
