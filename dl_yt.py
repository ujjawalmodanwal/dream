from pytube import YouTube
yt = YouTube('https://youtu.be/taJr7qZGHPI')
stream = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first()
stream.download(output_path='public/videos', filename='aurora_portal.mp4')
print("Success")
