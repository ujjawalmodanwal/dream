import os
import urllib.request
def dl(url, dest):
    print(f"Downloading {dest}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(dest, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Success: {dest}")
    except Exception as e:
        print(f"Failed: {e}")

os.makedirs('public/videos', exist_ok=True)
os.makedirs('public/textures', exist_ok=True)
dl('https://upload.wikimedia.org/wikipedia/commons/4/43/Tree-transparent-background.png', 'public/textures/real_tree.png')
dl('https://upload.wikimedia.org/wikipedia/commons/3/3d/Monarch_butterfly_transparent.png', 'public/textures/real_butterfly.png')
dl('https://upload.wikimedia.org/wikipedia/commons/7/74/Blue_Jay_transparent.png', 'public/textures/real_bird.png')
dl('https://storage.googleapis.com/vrview/examples/video/congo_2048.mp4', 'public/videos/aurora_360.mp4')
