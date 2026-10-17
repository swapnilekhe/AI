# SLIDE 18

# CHAT COMPLETIONS API
# Sends messages to a chat model and receives a response. Conversation history is maintained by passing previous messages with each request.

# Initialize the conversation
conversation_messages = [

    {
        "role": "system",
        "content": "You are a helpful AI assistant that answers questions and provides information."
    },
    {
        "role": "user",
        "content": "When was Microsoft founded?"
    }
]

# First Chat Completion

completion = openai_client.chat.completions.create(
model="gpt-40",
messages=conversation_messages
)
assistant_text = completion.choices[0].message.content

print("Assistant:", assistant_text)

# Add the assistant's reply to the conversation
conversation_messages. append(

    {
        "role": "assistant",
        "content": assistant_text
    }



# Add Another User Message
conversation_messages. append(

    {
        "role": "user",
        "content": "Who founded it?"
    }
)

# Second Chat Completion
completion = openai_client.chat.completions.create(
model="gpt-40",
messages=conversation_messages

)

assistant_text = completion.choices[0].message.content

print("Assistant:", assistant_text)

# Continue appending messages and sending the full conversation history to maintain context.
#The entire array conversation_messages would look like this:
completion = openai_client. chat. completions.create(
model="gpt-40",
messages=
    [
        {"role": "system", "content": "You are a helpful AI assistant that answers questions and provides information. "},
        {"role": "user", "content": "When was Microsoft founded?"},
        {"role": "assistant", "content": "<Agent Output>"},
        {"role": "user", "content": "Who founded it?"}
    ]
)