import urllib.request
import ssl
from PIL import Image, ImageFilter, ImageEnhance
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://upload.wikimedia.org/wikipedia/commons/f/fa/2023_Toyota_Kijang_Innova_Zenix_2.0_Q_Hybrid_Modellista_%28front%29%2C_West_Surabaya.jpg"
headers = {'User-Agent': 'Mozilla/5.0'}

raw_path = r"c:\Users\Akbar\Documents\sorum_mobil\assets\img\zenix_hd_raw.jpg"
hero_path = r"c:\Users\Akbar\Documents\sorum_mobil\assets\img\hero.jpg"

print("Downloading 4000x3000 photo from Wikimedia Commons...")
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, context=ctx) as resp, open(raw_path, 'wb') as f:
    f.write(resp.read())

print(f"Downloaded! Size: {os.path.getsize(raw_path)} bytes")

# Open and crop/enhance for cinematic wide hero banner
with Image.open(raw_path) as im:
    print(f"Original image dimensions: {im.width} x {im.height}")
    # Target hero: 2880 x 1440 or wide 16:9 cinematic shot of Innova Zenix Q Modellista
    # The car is centered. We crop a cinematic panoramic section
    # Crop bounds: (left, top, right, bottom)
    # Let's crop from y=450 to y=2350 (height 1900) and full width 4000 (aspect ~ 21:10)
    crop_area = (0, 480, 4000, 2400)
    cropped = im.crop(crop_area)
    
    # Resize to standard high-resolution 2880 x 1382
    hero_w = 2880
    hero_h = int(cropped.height * (2880 / cropped.width))
    hero_img = cropped.resize((hero_w, hero_h), Image.Resampling.LANCZOS)
    
    # Apply delicate unsharp mask & crisp contrast
    hero_img = hero_img.filter(ImageFilter.UnsharpMask(radius=2, percent=115, threshold=3))
    enhancer_s = ImageEnhance.Sharpness(hero_img)
    hero_img = enhancer_s.enhance(1.25)
    
    enhancer_c = ImageEnhance.Contrast(hero_img)
    hero_img = enhancer_c.enhance(1.04)
    
    hero_img.save(hero_path, "JPEG", quality=95, subsampling=0)
    print(f"Successfully created new HD hero.jpg: {hero_img.width} x {hero_img.height}")
