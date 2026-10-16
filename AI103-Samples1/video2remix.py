# SLIDE 62
#

# AZURE OPENAI - VIDEO REMIXING
# Creates a new version of an existing video by modifying it with a new prompt.
#

# REMIX AN EXISTING VIDEO

video = client.videos.remix(
video_id="video_abc123",
prompt="Change the color palette to warm sunset tones"
)
print(f"Remix started. Video ID: {video.id}")