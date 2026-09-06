import os
import urllib.request
def download_file(url, dest_path):
    print(f'Downloading {url} to {dest_path}...')
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(dest_path, 'wb') as out_file:
            out_file.write(response.read())
        print('Success.')
    except Exception as e:
        print(f'Failed to download {url}: {e}')
os.makedirs('public/videos', exist_ok=True)
os.makedirs('public/textures', exist_ok=True)
download_file('https://cdn.pixabay.com/video/2020/01/13/31201-385265520_large.mp4', 'public/videos/aurora_360.mp4')
download_file('https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Tree-transparent-background.png/1024px-Tree-transparent-background.png', 'public/textures/real_tree.png')
download_file('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Monarch_butterfly_transparent.png/800px-Monarch_butterfly_transparent.png', 'public/textures/real_butterfly.png')
download_file('https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Blue_Jay_transparent.png/800px-Blue_Jay_transparent.png', 'public/textures/real_bird.png')

