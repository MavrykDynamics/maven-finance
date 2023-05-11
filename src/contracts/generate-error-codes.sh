#!/bin/bash

## WARNING: CAN ONLY BE USED BEFORE LAUNCHING THE PLATFORM
# Get the error lines
ERROR_FILE="./contracts/partials/errors.ligo"
TMP_ERROR_FILE="./contracts/partials/errors_tmp.ligo"
PYTHON_FILE="./test/error_codes.py"
TS_FILE="./test/error_codes.ts"
LINES=$(cat $ERROR_FILE)

# Loop through the lines and associate a code with them
COUNTER=0
REGEX="= [0-9]*"
while read line; do
    echo "$line" | sed -e "s/= [0-9]*/= $COUNTER/g"
    if [[ $line =~ $REGEX ]]
    then ((COUNTER++))
    fi
done < $ERROR_FILE > $TMP_ERROR_FILE
mv $TMP_ERROR_FILE $ERROR_FILE

while read line; do
    echo "$line" | sed -e "s/\[\@inline] const //g" -e "s/^\/\/*[A-Z a-z -]*//g" -e "s/n;//g"
done < $ERROR_FILE > $PYTHON_FILE


## Create a typescript map file
echo "export const CONTRACT_ERROR_CODES: Map<number, {message: string, description: string}> = new Map([" > $TS_FILE
while read -r line; do
    CURRENT_LINE=$(($CURRENT_LINE + 1))
    VAR_NAME=$(echo "$line" | sed -e "s/\[\@inline] const //g" -e "s/^\/\/*[A-Z a-z -]*//g" -e "s/n;//g" | cut -d '=' -f 1 | xargs)
    ERROR_CODE=$(echo "$line" | sed -e "s/\[\@inline] const //g" -e "s/^\/\/*[A-Z a-z -]*//g" -e "s/n;//g" | cut -d '=' -f 2 | xargs)
    PARSED_VAR_NAME=$(echo "$VAR_NAME" | sed -e 's/error_//' -e 's/_/ /g' -e 's/\(^\| \)\([a-z]\)/\1\u\2/g' -e 's/\(^\| \)\([A-Z]\)\([A-Z]\+\)\( \|$\)/\1\2\L\3\4/g')
    if [[ "$ERROR_CODE" -ne "" && "$ERROR_CODE" -ge 0 ]]; then
      if [[ $CURRENT_LINE -ne $COUNTER ]]; then
          echo "  [$ERROR_CODE, {message: \"$VAR_NAME\", description: \"$PARSED_VAR_NAME\"}]," >> $TS_FILE
        else
          echo "  [$ERROR_CODE, {message: \"$VAR_NAME\", description: \"$PARSED_VAR_NAME\"}]" >> $TS_FILE
        fi
    fi
done < $ERROR_FILE
echo "]);" >> $TS_FILE

exit 0