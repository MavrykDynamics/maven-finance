type generalContractsType is map (string, address)
type updateGeneralContractsParams is [@layout:comb] record [
  generalContractName     : string;
  generalContractAddress  : address;
]