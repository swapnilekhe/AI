from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import (PromptAgentDefinition, MCPTool, FunctionTool, Tool)

# Connect to the AI Foundry Project
project_client = AIProjectClient(endpoint=project_endpoint, credential=credential)

# Create a Custom Function Tool - Allows the agent to retrieve recent snowfall totals.
function_tool = FunctionTool(
name="recent_snowfall",
description="Get recent snowfall totals for a given location.",
parameters={
        "type": "object",
        "properties": 
                    {
                        "location": {
                        "type": "string",
                        "description": "The city name to check snowfall for."
                        }
                    },
        "required": ["location"],
        "additionalProperties": False
        },
    strict=True
)
# Connect to a Knowledge Base via MCP - Allows the agent to access external information sources.
knowledge_tool = MCPTool(
    server_label="product-docs",
    server_url=(
    f"{search_endpoint}/knowledgebases/"
    "product-documentation/mcp"
    )
    require_approval="always"
)


# Create the Agent
agent = project_client.agents.create_version(
    name="snowfall-agent",
    definition = PromptAgentDefinition(
        model="gpt-4.1",
        instructions=(
            "You are a weather assistant tracking snowfall. "
            "Use the provided functions to answer questions."
            ),
        tools=[
                function_tool,
                knowledge_tool
            ]
    )
)


# agents.create_version()	Create a new version of an agent definition
# agents.get_version()	Retrieve a specific agent version
# agents.list_versions()	List an agent's versions
# agents.delete_version()	Delete a specific version