import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

urls = [
    'https://www.toyota.astra.co.id/product/new-kijang-innova-zenix-hev',
    'https://auto2000.co.id/mobil-baru-toyota/innova-zenix-hybrid'
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            matches = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp)', html, re.IGNORECASE)
            print(f"=== {url} found {len(matches)} images ===")
            for m in set(matches):
                if any(x in m.lower() for x in ['zenix', 'innova', 'banner', 'hero', 'gallery', 'modellista', 'color']):
                    print(m)
    except Exception as e:
        print(f"Error fetching {url}: {e}")
