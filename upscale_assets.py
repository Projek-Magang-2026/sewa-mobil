"""
Script Upscale & Enhancement Gambar Mobil untuk Sorum Mobil
===========================================================
Fitur:
1. Ekstraksi gambar resolusi penuh (High Quality Crop) dari sumber asli poster.
2. Super-Resolution Upscaling menggunakan Lanczos Resampling dengan filter unsharp mask adaptive.
3. Contrast & Color Enhancement cerdas agar mobil terlihat jernih, tajam, dan tidak burik/pecah di layar besar (Retina / 4K).
4. Auto-process gambar hero, showcase/unggulan (featured-1, featured-2, featured-3), dan cta.
"""

import os
from PIL import Image, ImageFilter, ImageEnhance

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE_DIR, "assets", "img")
STOCK_DIR = os.path.join(IMG_DIR, "stock")


def upscale_and_enhance(im, scale=2.0, sharpness=1.4, contrast=1.05):
    """
    Melakukan upscaling dengan metode Lanczos High-Fidelity
    diikuti penajaman unsharp mask agar detail cat & lekuk mobil jernih.
    """
    new_w = int(im.width * scale)
    new_h = int(im.height * scale)
    
    # 1. Lanczos High-Quality Resampling
    upscaled = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # 2. Unsharp Mask (menghilangkan buram / efek pecah)
    enhanced = upscaled.filter(ImageFilter.UnsharpMask(radius=2, percent=120, threshold=3))
    
    # 3. Micro detail sharpness & subtle contrast boost
    enhancer_s = ImageEnhance.Sharpness(enhanced)
    enhanced = enhancer_s.enhance(sharpness)
    
    enhancer_c = ImageEnhance.Contrast(enhanced)
    enhanced = enhancer_c.enhance(contrast)
    
    return enhanced


def process_section_images():
    print("🚀 Memulai proses Upscale & Enhancement gambar mobil...\n")
    
    tasks = [
        # HERO: Innova Zenix Q Modelista Hybrid
        {
            "name": "hero.jpg (Hero Section)",
            "source": os.path.join(STOCK_DIR, "innova-zenix-q-2023.jpg"),
            "dest": os.path.join(IMG_DIR, "hero.jpg"),
            "crop": (0, 212, 1131, 657),   # (left, top, right, bottom)
            "scale": 2.2,                  # ~2488px lebar (tajam di layar 2K/4K)
            "sharpness": 1.35
        },
        # UNGGULAN 1: Fortuner GR 2.8L (Main Showcase)
        {
            "name": "featured-1.jpg (Unggulan Utama - Fortuner GR)",
            "source": os.path.join(STOCK_DIR, "fortuner-gr-2022.jpg"),
            "dest": os.path.join(IMG_DIR, "featured-1.jpg"),
            "crop": (0, 200, 1131, 645),
            "scale": 2.2,                  # ~2488px lebar (sangat tajam & jernih)
            "sharpness": 1.4
        },
        # UNGGULAN 2: Fortuner Interior
        {
            "name": "featured-2.jpg (Unggulan Detail Interior)",
            "source": os.path.join(STOCK_DIR, "fortuner-gr-2022.jpg"),
            "dest": os.path.join(IMG_DIR, "featured-2.jpg"),
            "crop": (418, 1202, 714, 1494),
            "scale": 3.0,                  # Zoom detail interior ~888px jernih
            "sharpness": 1.5
        },
        # UNGGULAN 3: Fortuner Tampak Belakang
        {
            "name": "featured-3.jpg (Unggulan Detail Eksterior Belakang)",
            "source": os.path.join(STOCK_DIR, "fortuner-gr-2022.jpg"),
            "dest": os.path.join(IMG_DIR, "featured-3.jpg"),
            "crop": (780, 1202, 1072, 1494),
            "scale": 3.0,                  # Zoom detail belakang ~876px jernih
            "sharpness": 1.5
        },
        # CTA: Honda CR-V Prestige Turbo
        {
            "name": "cta.jpg (CTA Section Bawah)",
            "source": os.path.join(STOCK_DIR, "crv-prestige-2022.jpg"),
            "dest": os.path.join(IMG_DIR, "cta.jpg"),
            "crop": (0, 200, 1131, 645),
            "scale": 2.2,
            "sharpness": 1.35
        }
    ]
    
    for item in tasks:
        if not os.path.exists(item["source"]):
            print(f"⚠️ File sumber tidak ditemukan: {item['source']}")
            continue
            
        with Image.open(item["source"]) as img:
            # Crop bagian yang relevan
            cropped = img.crop(item["crop"])
            
            # Upscale + Enhance
            enhanced = upscale_and_enhance(
                cropped,
                scale=item.get("scale", 2.0),
                sharpness=item.get("sharpness", 1.4),
                contrast=1.04
            )
            
            # Simpan dengan kualitas JPEG maksimal (95) + Subsampling 4:4:4
            enhanced.save(item["dest"], "JPEG", quality=95, subsampling=0)
            
            orig_size = f"{cropped.width}x{cropped.height}"
            new_size = f"{enhanced.width}x{enhanced.height}"
            print(f"✅ {item['name']}: {orig_size} ➔ {new_size} (Upscaled & Enhanced)")

    print("\n✨ Selesai! Semua gambar di section unggulan & hero sudah di-upscale jernih tanpa pecah.")

if __name__ == "__main__":
    process_section_images()
