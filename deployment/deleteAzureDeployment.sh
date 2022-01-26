#!/bin/bash

# Loads the variables from the external variables file at the root
function load_variables() {
    echo "$(date +"%Y-%m-%d %T") - Loading external variables..."
    export $(grep -v '#.*' variables | xargs)
}

# Logs into your az account - we assume you're already logged in, if not, run "az login" prior to running this script!
function login() {  
    # Load the subscription ID
    echo "$(date +"%Y-%m-%d %T") - Loading subscription ID and setting active subscription..."
    SUBSCRIPTION_ID=$(az account show --subscription "$SUBSCRIPTION_NAME" --query 'id' -o tsv)

    # Set the active subscription
    az account set --subscription "$SUBSCRIPTION_ID"
}

# Deletes the main resource group for our environment
function delete_main_resource_group() {
    echo "$(date +"%Y-%m-%d %T") - Deleting main resource group..."
    az group delete --name "$MAIN_RESOURCE_GROUP_NAME" --yes
}

echo "$(date +"%Y-%m-%d %T") - Script starting..."

load_variables
login
delete_main_resource_group

echo "$(date +"%Y-%m-%d %T") - Script completed successfully!"
echo ""