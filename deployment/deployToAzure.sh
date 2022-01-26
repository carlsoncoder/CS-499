#!/bin/bash

# Used later in the script, DO NOT set these
REGISTRY=""
REGISTRY_USERNAME=""
REGISTRY_PASSWORD=""
NODE_APP_FULL_IMAGE_NAME_WITH_REGISTRY=""

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

# Deploys the main resource group for our environment
function deploy_main_resource_group() {
    echo "$(date +"%Y-%m-%d %T") - Creating main resource group..."
    az group create \
      --name "$MAIN_RESOURCE_GROUP_NAME" \
      --location "$AZURE_LOCATION" \
      --tags "$CREATED_ON" "$CREATOR_EMAIL" "$OWNER" "$OWNER_EMAIL"
}

# Deploys an Azure Container Registry (ACR) that we will deploy our docker images to
function deploy_container_registry() {
    echo "$(date +"%Y-%m-%d %T") - Creating Azure Container Registry..."
    az acr create \
      --name "$CONTAINER_REGISTRY_NAME" \
      --resource-group "$MAIN_RESOURCE_GROUP_NAME" \
      --sku "Standard" \
      --admin-enabled \
      --location "$AZURE_LOCATION"
}

# Loads the Azure container registry where we will be deploying our images to
function load_registry() {
    echo "$(date +"%Y-%m-%d %T") - Loading Azure Container Registry..."
    REGISTRY=$(az acr show --resource-group "$MAIN_RESOURCE_GROUP_NAME" --name "$CONTAINER_REGISTRY_NAME" -o tsv --query "loginServer")

    REGISTRY_USERNAME=$(az acr credential show --name "$CONTAINER_REGISTRY_NAME" --resource-group "$MAIN_RESOURCE_GROUP_NAME" -o tsv --query "username")
    REGISTRY_PASSWORD=$(az acr credential show --name "$CONTAINER_REGISTRY_NAME" --resource-group "$MAIN_RESOURCE_GROUP_NAME" -o tsv --query "passwords[0].value")

    docker login "$REGISTRY" -u "$REGISTRY_USERNAME" -p "$REGISTRY_PASSWORD"

    # Set our fully qualified image name
    NODE_APP_FULL_IMAGE_NAME_WITH_REGISTRY="$REGISTRY/$NODE_DOCKER_IMAGE_NAME:$NODE_DOCKER_IMAGE_TAG"
}

# Deletes any local docker images with our defined image name before re-building and re-deploying
function delete_existing_image() {
    echo "$(date +"%Y-%m-%d %T") - Deleting existing docker images..."
    docker rmi "$NODE_DOCKER_IMAGE_NAME" --force
    docker rmi "$NODE_APP_FULL_IMAGE_NAME_WITH_REGISTRY" --force
}

# Builds the NodeJS client app docker image and pushes it to the registry
function build_and_push_node_client_image() {
    echo "$(date +"%Y-%m-%d %T") - Building and deploying node client docker image..."
    
    # Go up to the root to build our image
    cd ..
    docker build --no-cache -t $NODE_DOCKER_IMAGE_NAME .
    docker tag $NODE_DOCKER_IMAGE_NAME $NODE_APP_FULL_IMAGE_NAME_WITH_REGISTRY
    docker push $NODE_APP_FULL_IMAGE_NAME_WITH_REGISTRY

    # Go back to our deployment directory
    cd deployment/
}

function deploy_cosmosdb_account() {
    echo "$(date +"%Y-%m-%d %T") - Deploying Azure CosmosDB parent account..."
    az cosmosdb create \
        --name "$COSMOSDB_ACCOUNT_NAME" \
        --resource-group "$MAIN_RESOURCE_GROUP_NAME" \
        --kind "MongoDB"
}

function deploy_cosmosdb_database() {
    echo "$(date +"%Y-%m-%d %T") - Deploying Azure CosmosDB database..."
    az cosmosdb mongodb database create \
        --account-name "$COSMOSDB_ACCOUNT_NAME" \
        --name "$COSMOSDB_DATABASE_NAME" \
        --resource-group "$MAIN_RESOURCE_GROUP_NAME"
}

function load_cosmosdb_credentials() {
    echo "$(date +"%Y-%m-%d %T") - Loading CosmosDB credentials..."
    COSMOSDB_PASSWORD=$(az cosmosdb keys list --name "$COSMOSDB_ACCOUNT_NAME" --resource-group "$MAIN_RESOURCE_GROUP_NAME" --type keys --query 'primaryMasterKey' -o tsv)
    export COSMOSDB_PASSWORD
}

function insert_test_data() {
    echo "$(date +"%Y-%m-%d %T") - Inserting test CosmosDB data..."
    node insertProducts.js
    node insertTransactions.js
}

# Deploys our ACI instance and shows the FQDN to access it
function deploy_azure_aci_container_instance() {
    echo "$(date +"%Y-%m-%d %T") - Deploying Azure Container Instance (ACI)..."
    az container create \
        --resource-group "$MAIN_RESOURCE_GROUP_NAME" \
        --name "$ACI_CONTAINER_NAME" \
        --image "$NODE_APP_FULL_IMAGE_NAME_WITH_REGISTRY" \
        --dns-name-label "$ACI_DNS_NAME_LABEL" \
        --registry-login-server "$REGISTRY" \
        --registry-password "$REGISTRY_PASSWORD" \
        --registry-username "$REGISTRY_USERNAME" \
        --environment-variables 'COSMOSDB_ACCOUNT_NAME'=''$COSMOSDB_ACCOUNT_NAME'' 'COSMOSDB_PASSWORD'=''$COSMOSDB_PASSWORD'' 'COSMOSDB_DATABASE_NAME'=''$COSMOSDB_DATABASE_NAME'' 'COSMOSDB_PORT'=''$COSMOSDB_PORT'' \
        --ports 80 3000

    echo "$(date +"%Y-%m-%d %T") - Showing status and FQDN of the deployed Azure Container Instance (ACI)..."
    az container show \
        --resource-group "$MAIN_RESOURCE_GROUP_NAME" \
        --name "$ACI_CONTAINER_NAME" \
        --query "{FQDN:ipAddress.fqdn,ProvisioningState:provisioningState}" \
        --out table
}

echo "$(date +"%Y-%m-%d %T") - Script starting..."

load_variables
login
deploy_main_resource_group
deploy_container_registry
load_registry
delete_existing_image
build_and_push_node_client_image
deploy_cosmosdb_account
deploy_cosmosdb_database
load_cosmosdb_credentials
insert_test_data
deploy_azure_aci_container_instance

echo "$(date +"%Y-%m-%d %T") - Script completed successfully!"
echo ""