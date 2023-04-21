#!/bin/bash

# Get the generation script
GENERATION_SCRIPT="./generate_tezos_accounts_helper.ligo"
TEMP_GENERATED_FILE="./temp.ligo_accounts"
STRING_TO_REMOVE="Everything at the top-level was executed."
JSON_FILE="./test/helpers/random_accounts.json"

# Generate multiple accounts
docker run --rm -v "$PWD":"$PWD" -w "$PWD" mavrykdynamics/ligo:0.60.0 run test $GENERATION_SCRIPT | sed -e "s/$STRING_TO_REMOVE$//" | grep "\S" > $TEMP_GENERATED_FILE
"edsk3NhW3Xr8viyoQ9CgpHgtvzMrhAucYNt4zhgSb9nCCnSEgPwBh7"
edpkuqMpAemZFfryxXHuNjThdn8Uuw1QZh8AmNij2C98sFocJ7iuYT
tz1UG5oTjGqKj4z1e5u5hyzSDJKudhpaq3E4
# Create the JSON account file
JSON_TEXT=$(echo -e "[\n")
while read line; do
    FORMATTED_ACCOUNT=$(echo "$line" | tr -d '()')
    SECRET_KEY=$(echo -e "$FORMATTED_ACCOUNT" | cut -c1-56)
    PUBLIC_KEY=$(echo -e "$FORMATTED_ACCOUNT" | cut -c60-113)
    PUBLIC_KEY_HASH=$(echo -e "$FORMATTED_ACCOUNT" | cut -c117-154)
    echo $SECRET_KEY
    echo $PUBLIC_KEY
    echo $PUBLIC_KEY_HASH
    JSON_TEXT=$(echo -e "$JSON_TEXT\n\t{\n\t\t\"pkh\": \"$PUBLIC_KEY_HASH\",\n\t\t\"pk\": \"$PUBLIC_KEY\",\n\t\t\"sk\": $SECRET_KEY\n\t},")
done < $TEMP_GENERATED_FILE
JSON_TEXT=$(echo -e "$JSON_TEXT" | sed '$ s/.$//')
JSON_TEXT=$(echo -e "$JSON_TEXT\n]")

echo -e "$JSON_TEXT" > $JSON_FILE

rm -rf $TEMP_GENERATED_FILE
