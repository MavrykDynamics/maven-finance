#!/bin/bash

# Get the error lines
ERROR_FILE="./contracts/partials/errors.ligo"
TMP_ERROR_FILE="./contracts/partials/errors_tmp.ligo"
LINES=$(cat $ERROR_FILE)

# Loop through the lines
# IFS=$'\n\n'
# set -f
COUNTER=0
REGEX="= [0-9]*"
while read line; do
    echo "$line" | sed -e "s/= [0-9]*/= $COUNTER/g"
    if [[ $line =~ $REGEX ]]
    then ((COUNTER++))
    fi
done < $ERROR_FILE > $TMP_ERROR_FILE
mv $TMP_ERROR_FILE $ERROR_FILE
exit 0