# Generate a Response
response = openai_client.responses.create(
model="gpt-4.1", # Model deployment name
instructions("You are a helpful AI assistant that answers questions clearly."),
input="What is Microsoft Foundry?",
temperature=0.8,
max_output_tokens=200,
previous_response_id=last_response_id, # Continue a previous conversation
tools=
[ # Available tools

    {
        "type": "code_interpreter",
        "container": {"type": "auto"}
    }
    ,{
    "type": "web_search"
    },
    {
    "type": "file_search",
    "vector_store_ids": [vector_store.id]
    },
    {
    "type": "function",
    "name": "get_time",
    "description": "Get the current time."
    }
],
stream=True

# Stream output as it is generated

)

# Save Response ID for Conversation Context
last_response_id = response.id

# Display Response Details
print(f"Response: {response.output_text}")
print(f"Response ID: {response.id}")
print(f"Tokens Used: {response.usage}")
print(f"Status: {response.status}")

# Display Streaming Output
for event in stream:
    if event.type == "response.output_text.delta":
        print(event.delta, end="")

    elif event.type == "response.completed":
        response_id = event.response.id


# SLIDE 18
# RETRIEVE A PREVIOUS RESPONSE
# Retrieves a previously generated response using its unique response ID for reviewing, auditing, or continuing conversations.

try:
    response_id ="sjhsjfshdkfh" # Response ID to retrieve
    previous_response = openai_client.responses.retrieve(response_id) # Retrieve the previous response
 
# Display the response text
print(f"Previous Response: {previous_response.output_text}")

except Exception as ex:
    print(f"Error: {ex}")


# SLIDE 18
# ===
# ASYNC RESPONSES API
# Uses the asynchronous OpenAI client to generate responses without blocking your application while waiting for results.
#

import asyncio
from openai import AsyncOpenAI

# Create an Azure OpenAI client
client = AsyncOpenAI(
base_url="https://<resource-name>.openai.azure.com/openai/v1/",
api_key=token_provider
)
# Generate an Asynchronous Response
async def main():
response = await client.responses.create(
model="gpt-4.1",
input="Explain quantum computing briefly."

)

print(response.output_text)

# Run the Asynchronous Function
asyncio.run(main())