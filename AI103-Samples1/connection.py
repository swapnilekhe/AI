 # SLIDE 17

# CONNECT TO AN AZURE AI FOUNDRY PROJECT
# Creates a client connection to an Azure AI Foundry project. Replace <resource-name> and <project-name> with your values.
# ==

from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

project_client = AIProjectClient( # project_client can now be used to interact with your Azure AI Foundry project resources.
credential=DefaultAzureCredential(),
endpoint="https://<resource-name>.services.ai.azure.com/api/projects/<project-name>"
)

# SLIDE 17
# ==
# CONNECT TO AN AZURE OPENAI ENDPOINT (ENTRA ID AUTHENTICATION)
# Uses Microsoft Entra ID instead of an API key to authenticate with an Azure OpenAI resource.
# .=

from azure.identity import (DefaultAzureCredential, get_bearer_token_provider)
from openai import OpenAI

token_provider = get_bearer_token_provider( # Create a token provider using your Azure credentials
DefaultAzureCredential(),
"https://ai.azure.com/.default"

)

openai_client = OpenAI(
base_url="https://<resource-name>.openai.azure.com/openai/v1/", # Replace <resource-name> with your Azure OpenAI resource name.
api_key=token_provider,
)

# Create an Azure OpenAI client

 

# SLIDE 17
# =====
# CONNECT TO AN AZURE OPENAI ENDPOINT (API KEY)
# Uses an Azure OpenAI API key stored in an environment variable to authenticate requests.
# =.===

import os
from openai import OpenAI

# Create an Azure OpenAI client
openai_client = OpenAI(
base_url="https://<resource-name>.openai.azure.com/openai/v1/", # Replace <resource-name> with your Azure OpenAI resource name.
# Ensure the AZURE_OPENAI_API_KEY environment variable is set.
api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
api_version="2024-06-01-preview"
)