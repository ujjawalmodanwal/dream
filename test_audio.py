import urllib.request
import json

def test_commons(search_term):
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(search_term)}&srnamespace=6&srlimit=5&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            for item in data.get('query', {}).get('search', []):
                print(item['title'])
    except Exception as e:
        print(e)

print("--- Searching 'birdsong ogg' ---")
test_commons("birdsong filetype:ogg")
print("--- Searching 'stream river ogg' ---")
test_commons("stream water river filetype:ogg")
