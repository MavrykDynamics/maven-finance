#!/bin/bash

## WARNING: CAN ONLY BE USED BEFORE LAUNCHING THE PLATFORM

# Get the error lines
ERROR_FILE="./contracts/partials/errors.ligo"
TMP_ERROR_FILE="./contracts/partials/errors_tmp.ligo"
PYTHON_FILE="./test/error_codes.py"
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

# Create a python lib file
while read line; do
    echo "$line" | sed -e "s/\[\@inline] const //g" -e "s/^\/\/*[A-Z a-z -]*//g" -e "s/n;//g"
done < $ERROR_FILE > $PYTHON_FILE

exit 0