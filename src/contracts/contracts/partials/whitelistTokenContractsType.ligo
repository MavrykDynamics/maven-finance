type whitelistTokenContractsType is map (string, address)
type updateWhitelistTokenContractsParams is [@layout:comb] record [
  tokenContractName     : string;
  tokenContractAddress  : address;
]