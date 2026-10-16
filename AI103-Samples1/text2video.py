# SLIDE 61

# AZURE OPENAI - TEXT TO VIDEO GENERATION
# Generates a video from a text prompt using a video model, monitors the job status, and downloads the completed video

#

import time

# CREATE A VIDEO GENERATION JOB
video = client.videos.create(
model="sora-2",
prompt="A nohat walke thnaugh a rainy city street at dusk, neon signs reflecting in puddles",
size="1024x720",
seconds=4, #4 or 8 seconds or 12 seconds
input_reference=open("landscape.png", "rb")

)

print(f"Video creation started. ID: {video.id}")

# POLL UNTIL THE VIDEO IS COMPLETE
while video.status not in [
"completed",
"failed",
"cancelled"

]:
    print(f"Status: {video.status}. Waiting ... ")
    time.sleep(20)
    video = client.videos.retrieve(
    video.id
    )
        
# DOWNLOAD THE COMPLETED VIDEO
if video.status == "completed":
    content = client.videos.download_content(
    video.id,
    variant="video"
    )

content.write_to_file("output.mp4")

print("Video saved to output.mp4")