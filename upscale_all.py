"""
Batch Upscaler & Image Enhancer for Garasi 05
=============================================
Upscales:
1. Editorial cuts (hero, featured-1, featured-2, featured-3, cta)
2. All 13 Ready Stock posters (stock/)
3. All 27 Serah Terima photos (serah-terima/)
Using Lanczos interpolation + unsharp masking + micro-contrast enhancement.
"""

import os
from PIL import Image, ImageFilter, ImageEnhance

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE_DIR, "assets", "img")
STOCK_DIR = os.path.join(IMG_DIR, "stock")
HANDOVER_DIR = os.path.join(IMG_DIR, "serah-terima")


def enhance_image(im, scale=1.5, unsharp_radius=2, unsharp_pct=110, sharpness=1.3, contrast=1.03):
    """Upscale with Lanczos and apply adaptive sharpening."""
    if scale != 1.0:
        new_w = int(im.width * scale)
        new_h = int(im.height * scale)
        im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Unsharp Mask to recover edge fidelity
    im = im.filter(ImageFilter.UnsharpMask(radius=unsharp_radius, percent=unsharp_pct, threshold=3))
    
    # Sharpness enhancement
    if sharpness != 1.0:
        enhancer = ImageEnhance.Sharpness(im)
        im = enhancer.enhance(sharpness)
        
    # Contrast adjustment
    if contrast != 1.0:
        enhancer_c = ImageEnhance.Contrast(im)
        im = enhancer_c.enhance(contrast)
        
    return im


def process_all():
    print("=== Processing Editorial Images ===")
    editorial_tasks = [
        # Hero: Zenix Q
        {
            "src": os.path.join(STOCK_DIR, "innova-zenix-q-2023.jpg"),
            "dst": os.path.join(IMG_DIR, "hero.jpg"),
            "crop": (0, 200, 1131, 655),
            "scale": 2.5,  # 2827px wide
            "unsharp_pct": 130,
            "sharpness": 1.4
        },
        # Featured 1: Fortuner GR
        {
            "src": os.path.join(STOCK_DIR, "fortuner-gr-2022.jpg"),
            "dst": os.path.join(IMG_DIR, "featured-1.jpg"),
            "crop": (0, 195, 1131, 650),
            "scale": 2.5,
            "unsharp_pct": 135,
            "sharpness": 1.4
        },
        # Featured 2: Fortuner Interior
        {
            "src": os.path.join(STOCK_DIR, "fortuner-gr-2022.jpg"),
            "dst": os.path.join(IMG_DIR, "featured-2.jpg"),
            "crop": (415, 1200, 715, 1495),
            "scale": 3.2,
            "unsharp_pct": 140,
            "sharpness": 1.5
        },
        # Featured 3: Fortuner Rear
        {
            "src": os.path.join(STOCK_DIR, "fortuner-gr-2022.jpg"),
            "dst": os.path.join(IMG_DIR, "featured-3.jpg"),
            "crop": (778, 1200, 1072, 1495),
            "scale": 3.2,
            "unsharp_pct": 140,
            "sharpness": 1.5
        },
        # CTA: CR-V Prestige Turbo
        {
            "src": os.path.join(STOCK_DIR, "crv-prestige-2022.jpg"),
            "dst": os.path.join(IMG_DIR, "cta.jpg"),
            "crop": (0, 195, 1131, 650),
            "scale": 2.5,
            "unsharp_pct": 130,
            "sharpness": 1.35
        }
    ]

    for t in editorial_tasks:
        if os.path.exists(t["src"]):
            with Image.open(t["src"]) as im:
                c = im.crop(t["crop"])
                out = enhance_image(c, scale=t["scale"], unsharp_pct=t["unsharp_pct"], sharpness=t["sharpness"])
                out.save(t["dst"], "JPEG", quality=95, subsampling=0)
                print(f"Upscaled {os.path.basename(t['dst'])}: {out.size}")

    print("\n=== Processing 13 Ready Stock Posters ===")
    if os.path.exists(STOCK_DIR):
        for f in os.listdir(STOCK_DIR):
            if f.lower().endswith(".jpg"):
                path = os.path.join(STOCK_DIR, f)
                with Image.open(path) as im:
                    # Upscale 1.5x (from 1131x1600 to ~1696x2400) + sharpen
                    out = enhance_image(im, scale=1.5, unsharp_radius=1.8, unsharp_pct=115, sharpness=1.3)
                    out.save(path, "JPEG", quality=94, subsampling=0)
                    print(f"Enhanced stock: {f} -> {out.size}")

    print("\n=== Processing 27 Serah Terima Photos ===")
    if os.path.exists(HANDOVER_DIR):
        for f in os.listdir(HANDOVER_DIR):
            if f.lower().endswith(".jpg"):
                path = os.path.join(HANDOVER_DIR, f)
                with Image.open(path) as im:
                    # Upscale 1.5x + sharpen for crisp customer handover display
                    out = enhance_image(im, scale=1.5, unsharp_radius=1.8, unsharp_pct=115, sharpness=1.3)
                    out.save(path, "JPEG", quality=94, subsampling=0)
                    print(f"Enhanced handover: {f} -> {out.size}")

    print("\nAll assets upscaled and sharpened successfully!")


if __name__ == "__main__":
    process_all()
