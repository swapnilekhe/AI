import base64
from http import client
from pathlib import Path
from xmlrpc import client

# LOAD IMAGE FROM LOCAL FILE
image_path = Path("dragon-fruit.jpeg")
image_format = "jpeg"

with open(image_path, "rb") as image_file:
image_data = base64.b64encode(
image_file.read()
).decode("utf-8")

# Create a data URL from the image (You can also use a public web URL instead)
data_url = (
f"data: image/{image_format};base64,{image_data}"

)

# SEND IMAGE TO THE MODEL
response = client.responses.create(
model="gpt-4.1",
input=[
        {
            "role": "developer",
            "content": "You are an AI assistant for chefs planning recipes."
        },
        {
            "role": "user",
            "content": [
                            {
                                "type": "input_text",
                                "text": "What desserts could I make with this?"
                            },
                            {
                                "type": "input_image",
                                "image_url": data_ur1
                            }
                        ]
        }
    ]
)