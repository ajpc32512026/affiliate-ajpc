#!/usr/bin/env python3
"""
localize_and_audit.py

Two jobs, run together:

JOB 1 - Localize legacy external images
  Some older products (added before the Instagram converter tool existed)
  still point their imageUrl directly at Shein's CDN (img.ltwebstatic.com)
  instead of a local file in media/posts/. This downloads each of those
  images, saves them locally, and updates products.json to match - so
  every single product consistently points at media/posts/, no exceptions.

JOB 2 - Audit media/posts/ for problems
  Cross-checks your actual media/posts/ folder against products.json to find:
    - Orphaned files: images sitting in the folder that no product references
    - Broken references: products pointing at a file that doesn't exist
    - True duplicates: the same image saved twice under different filenames
  Nothing gets deleted automatically - this only reports what it finds, in
  consolidation_audit_report.txt, so you can decide what to do with each one.

Run this from your project root (same folder as index.html, right next to
media/ and json/). Requires the `requests` library:
    pip install requests

Safe to run multiple times - already-local images are left untouched.
"""

import hashlib
import json
import os
import re
import time
from pathlib import Path
from urllib.parse import urlparse

try:
    import requests
except ImportError:
    print("This script needs the 'requests' library. Install it first with:")
    print("    pip install requests")
    raise SystemExit(1)

PRODUCTS_JSON_PATH = "json/products.json"
MEDIA_POSTS_DIR = "media/posts"
REPORT_PATH = "consolidation_audit_report.txt"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

REPORT_LINES = []


def log(msg=""):
    print(msg)
    REPORT_LINES.append(msg)


def file_hash(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def derive_local_filename(url, product_id):
    """Build a local filename from the CDN URL's own filename where possible,
    falling back to the product id if the URL doesn't give us anything usable."""
    path = urlparse(url).path
    original_name = os.path.basename(path)
    if original_name and "." in original_name:
        return original_name
    ext = ".jpg"
    return f"{product_id}{ext}"


def job1_localize_external_images():
    log("=" * 60)
    log("JOB 1 - Localizing legacy external images")
    log("=" * 60)

    with open(PRODUCTS_JSON_PATH, encoding="utf-8") as f:
        products = json.load(f)

    Path(MEDIA_POSTS_DIR).mkdir(parents=True, exist_ok=True)

    downloaded = 0
    failed = []
    already_local = 0

    for product in products:
        url = product.get("imageUrl", "")
        if not url.startswith("http"):
            already_local += 1
            continue

        local_name = derive_local_filename(url, product.get("id", "unknown"))
        local_path = Path(MEDIA_POSTS_DIR) / local_name

        # Avoid re-downloading if we've already fetched this exact file
        if local_path.exists():
            product["imageUrl"] = f"{MEDIA_POSTS_DIR}/{local_name}"
            continue

        try:
            resp = requests.get(url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
            resp.raise_for_status()
            with open(local_path, "wb") as out:
                out.write(resp.content)
            product["imageUrl"] = f"{MEDIA_POSTS_DIR}/{local_name}"
            downloaded += 1
            log(f"[OK] {product.get('id')} -> {MEDIA_POSTS_DIR}/{local_name}")
            time.sleep(0.3)  # polite delay between requests
        except Exception as e:
            failed.append((product.get("id"), product.get("title"), url, str(e)))
            log(f"[FAILED] {product.get('id')} - {product.get('title')}: {e}")

    with open(PRODUCTS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2)

    log()
    log(f"Already local: {already_local}")
    log(f"Newly downloaded and localized: {downloaded}")
    log(f"Failed to download: {len(failed)}")
    if failed:
        log()
        log("Failed downloads (these still point at the external URL - fix manually):")
        for pid, title, url, err in failed:
            log(f"  {pid} | {title}")
            log(f"    URL: {url}")
            log(f"    Error: {err}")

    log()
    return products


def job2_audit_media_folder(products):
    log("=" * 60)
    log("JOB 2 - Auditing media/posts/ for orphaned, missing, and duplicate files")
    log("=" * 60)

    referenced_paths = set()
    for p in products:
        url = p.get("imageUrl", "")
        if url.startswith(MEDIA_POSTS_DIR):
            referenced_paths.add(url)

    on_disk = set()
    for fname in os.listdir(MEDIA_POSTS_DIR):
        full = Path(MEDIA_POSTS_DIR) / fname
        if full.is_file() and full.suffix.lower() in IMAGE_EXTENSIONS:
            on_disk.add(f"{MEDIA_POSTS_DIR}/{fname}")

    orphaned = sorted(on_disk - referenced_paths)
    broken_refs = sorted(referenced_paths - on_disk)

    log(f"\nTotal files on disk in {MEDIA_POSTS_DIR}: {len(on_disk)}")
    log(f"Total unique file paths referenced by products.json: {len(referenced_paths)}")
    log(f"\nOrphaned files (on disk, but no product references them): {len(orphaned)}")
    for o in orphaned:
        log(f"  {o}")

    log(f"\nBroken references (product points at a file that doesn't exist): {len(broken_refs)}")
    for b in broken_refs:
        matching = [p for p in products if p.get("imageUrl") == b]
        for p in matching:
            log(f"  {p.get('id')} | {p.get('title')} -> {b}")

    # Duplicate content detection (same bytes, different filename)
    log("\nChecking for true duplicate images (same content, different filename)...")
    hashes = {}
    duplicates = []
    for fname in sorted(os.listdir(MEDIA_POSTS_DIR)):
        full = Path(MEDIA_POSTS_DIR) / fname
        if not full.is_file() or full.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        h = file_hash(full)
        if h in hashes:
            duplicates.append((hashes[h], fname))
        else:
            hashes[h] = fname

    log(f"True duplicate pairs found: {len(duplicates)}")
    for original, dup in duplicates:
        log(f"  {dup}  is identical to  {original}")

    log()
    log(f"SUMMARY: {len(orphaned)} orphaned, {len(broken_refs)} broken references, "
        f"{len(duplicates)} exact duplicates.")
    log("Nothing was deleted - review the list above and remove/fix manually,")
    log("or ask for a follow-up script once you've decided what to do with each category.")


def main():
    products = job1_localize_external_images()
    job2_audit_media_folder(products)

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(REPORT_LINES))

    log(f"\nFull report saved to {REPORT_PATH}")


if __name__ == "__main__":
    main()
