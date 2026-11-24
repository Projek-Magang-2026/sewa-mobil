"""Konversi asset gambar (.jpg/.png -> .webp) dan video (.mp4 -> .webm) untuk Garasi 05.

Penggunaan:
    python convert_assets.py
    python convert_assets.py --force
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageOps


def find_ffmpeg() -> str:
    """Temukan executable ffmpeg dari PATH atau paket imageio_ffmpeg."""
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg  # type: ignore

        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError as exc:
        raise RuntimeError(
            "ffmpeg tidak ditemukan di PATH dan paket imageio_ffmpeg belum terpasang."
        ) from exc


def convert_image_to_webp(src: Path, quality: int = 82, force: bool = False) -> tuple[int, int]:
    """Konversi satu file gambar (.jpg/.jpeg/.png) ke .webp dengan orientasi EXIF terjaga."""
    dst = src.with_suffix(".webp")
    if (
        not force
        and dst.exists()
        and dst.stat().st_size > 0
        and dst.stat().st_mtime >= src.stat().st_mtime
    ):
        return src.stat().st_size, dst.stat().st_size

    with Image.open(src) as img:
        img = ImageOps.exif_transpose(img)
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            img = img.convert("RGBA")
        else:
            img = img.convert("RGB")
        img.save(dst, "WEBP", quality=quality, method=6)

    return src.stat().st_size, dst.stat().st_size


def convert_video_to_webm(
    src: Path, ffmpeg_exe: str, crf: int = 32, force: bool = False
) -> tuple[int, int]:
    """Konversi satu file video .mp4 ke .webm (VP9) tanpa audio."""
    dst = src.with_suffix(".webm")
    if (
        not force
        and dst.exists()
        and dst.stat().st_size > 0
        and dst.stat().st_mtime >= src.stat().st_mtime
    ):
        return src.stat().st_size, dst.stat().st_size

    cmd = [
        ffmpeg_exe,
        "-y",
        "-i",
        str(src),
        "-c:v",
        "libvpx-vp9",
        "-crf",
        str(crf),
        "-b:v",
        "0",
        "-row-mt",
        "1",
        "-deadline",
        "good",
        "-cpu-used",
        "4",
        "-an",
        str(dst),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return src.stat().st_size, dst.stat().st_size


def format_mb(size_bytes: int) -> str:
    return f"{size_bytes / (1024 * 1024):.2f} MB"


def main() -> None:
    parser = argparse.ArgumentParser(description="Konversi gambar ke WebP dan video ke WebM.")
    parser.add_argument("--root", type=Path, default=Path("assets/img"), help="Folder asset sumber")
    parser.add_argument("--quality", type=int, default=82, help="Kualitas WebP (0-100)")
    parser.add_argument("--crf", type=int, default=32, help="CRF VP9 untuk WebM (lebih kecil = lebih jernih)")
    parser.add_argument("--force", action="store_true", help="Konversi ulang meski file tujuan sudah ada")
    args = parser.parse_args()

    if not args.root.exists():
        raise SystemExit(f"Folder tidak ditemukan: {args.root}")

    img_exts = {".jpg", ".jpeg", ".png"}
    images = sorted(p for p in args.root.rglob("*") if p.suffix.lower() in img_exts)
    videos = sorted(p for p in args.root.rglob("*.mp4"))

    total_src = 0
    total_dst = 0

    print(f"Mengonversi {len(images)} gambar ke WebP...")
    for img_path in images:
        s_sz, d_sz = convert_image_to_webp(img_path, quality=args.quality, force=args.force)
        total_src += s_sz
        total_dst += d_sz
        saving = (1 - d_sz / s_sz) * 100 if s_sz else 0
        print(f"  [WEBP] {img_path} -> {img_path.with_suffix('.webp').name} ({s_sz // 1024} KB -> {d_sz // 1024} KB, -{saving:.1f}%)")

    if videos:
        ffmpeg_exe = find_ffmpeg()
        print(f"\nMengonversi {len(videos)} video ke WebM (menggunakan {Path(ffmpeg_exe).name})...")
        for vid_path in videos:
            s_sz, d_sz = convert_video_to_webm(vid_path, ffmpeg_exe, crf=args.crf, force=args.force)
            total_src += s_sz
            total_dst += d_sz
            saving = (1 - d_sz / s_sz) * 100 if s_sz else 0
            print(f"  [WEBM] {vid_path} -> {vid_path.with_suffix('.webm').name} ({format_mb(s_sz)} -> {format_mb(d_sz)}, -{saving:.1f}%)")

    overall_saving = (1 - total_dst / total_src) * 100 if total_src else 0
    print("\n--- Ringkasan Konversi ---")
    print(f"Total ukuran awal   : {format_mb(total_src)}")
    print(f"Total ukuran baru   : {format_mb(total_dst)}")
    print(f"Penghematan total   : -{overall_saving:.1f}%")


if __name__ == "__main__":
    main()
