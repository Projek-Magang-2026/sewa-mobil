import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

article_urls = [
    'https://autonetmagz.com/toyota-kijang-innova-zenix-meluncur-di-indonesia-harga-mulai-419-juta/110996/',
    'https://autonetmagz.com/detail-toyota-kijang-innova-zenix-indonesia-apa-saja-tipenya/111019/'
]

for u in article_urls:
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            imgs = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp)', html, re.IGNORECASE)
            print(f"=== {u} ===")
            for img in set(imgs):
                if 'wp-content/uploads' in img and any(k in img.lower() for k in ['zenix', 'innova', 'front', 'depan', 'q-hybrid', 'modellista']):
                    print(img)
    except Exception as e:
        print(f"Error {u}: {e}")
