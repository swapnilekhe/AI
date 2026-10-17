# SLIDE 59
#
# AZURE OPENAI - TEXT TO IMAGE GENERATION
# Generates an image from a text prompt and saves the resulting image to a local file.
#


import base64

# GENERATE AN IMAGE
img_results = client.images.generate(
model="FLUX.1-Kontext-pro",
    prompt="A robot eating a cheeseburger.",
    n=1,
    size="1024x1024",   
)

# SAVE THE GENERATED IMAGE
image_data = base64.b64decode(
img_results.data[0].b64_json

)

with open("image.png", "wb") as image_file:
    image_file.write(image_data)

print("Image saved as image.png")