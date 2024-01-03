export type depositorsType = string | { whitelist : Array<string>};

export type vaultStorageType = {
    admin                       : string;
    handle                      : {};
    name                        : string;
    depositors                  : depositorsType;
}
