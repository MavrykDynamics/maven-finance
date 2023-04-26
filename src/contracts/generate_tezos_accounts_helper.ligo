// Setup a list of addresses
const userAmount        = 10n;
const _ = {
    for _i := 0 to int(userAmount){
        const newAccount            = Test.new_account();
        const hashedAccount         = (newAccount.0, newAccount.1, Crypto.hash_key(newAccount.1));
        Test.log(hashedAccount)
    };
} with(unit)
