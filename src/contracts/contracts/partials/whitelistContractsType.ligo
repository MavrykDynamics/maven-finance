type whitelistContractsType is map (string, address)
type updateWhitelistContractsParams is [@layout:comb] record [
  whitelistContractName     : string;
  whitelistContractAddress  : address;
]