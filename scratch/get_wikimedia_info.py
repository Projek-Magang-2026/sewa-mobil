import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Garasi05Bot/1.0 (https://example.com; contact@example.com)'
}

api_url = "https://commons.wikimedia.org/w/api.php?action=query&titles=File:2023_Toyota_Kijang_Innova_Zenix_2.0_Q_Hybrid_Modellista_(front),_West_Surabaya.jpg&prop=imageinfo&iiprop=url|size|mime&format=json"

req = urllib.request.Request(api_url, headers=headers)
with urllib.request.urlopen(req, context=ctx) as r:
    data = json.loads(r.read().decode('utf-8'))
    pages = data['query']['pages']
    for k, v in pages.items():
        if 'imageinfo' in v:
            info = v['imageinfo'][0]
            print("URL:", info['url'])
            print("Width:", info['width'])
            print("Height:", info['height'])
