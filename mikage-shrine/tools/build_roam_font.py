#!/usr/bin/env python3
"""Build the small Noto Serif SC subset used by the roaming UI."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


ROOT = Path(__file__).resolve().parent.parent
SCAN_FILES = ["roam-controller.js", "activities.js", "panels.html", "roam.css", "minigames-host.mjs", "minigames.css"]
SOURCE_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf"
LICENSE_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/OFL.txt"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--font-source", type=Path, required=True, help="NotoSerifSC[wght].ttf from Google Fonts")
    parser.add_argument("--output-name", default="roam-glyphs.ttf", help="Subset file name under assets/opening")
    parser.add_argument("--manifest-name", default="roam-font-manifest.json", help="Manifest file under src")
    args = parser.parse_args()
    source = args.font_source.resolve()
    if not source.is_file():
        raise SystemExit(f"Font source not found: {source}")

    covered: set[int] = set()
    existing_counts: dict[str, int] = {}
    for path in (ROOT / "assets/opening").glob("*.ttf"):
        if path.name == "roam-glyphs.ttf" or path.name == args.output_name:
            continue
        cmap = set(TTFont(path).getBestCmap())
        covered.update(cmap)
        existing_counts[path.name] = len(cmap)

    required = {
        ord(char)
        for name in SCAN_FILES
        for char in (ROOT / "src" / name).read_text(encoding="utf-8")
        if "\u3400" <= char <= "\u9fff"
    }
    missing = required - covered

    font = TTFont(source)
    source_cmap = set(font.getBestCmap())
    if missing - source_cmap:
        raise SystemExit(f"Source font is missing required codepoints: {sorted(missing - source_cmap)}")
    if "fvar" in font:
        font = instantiateVariableFont(font, {"wght": 500}, inplace=True)
    options = subset.Options()
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.name_languages = ["*"]
    options.recalc_timestamp = False
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=missing)
    subsetter.subset(font)

    out = ROOT / "assets/opening" / args.output_name
    font.save(out)
    actual = set(TTFont(out).getBestCmap())
    if actual != missing:
        raise SystemExit("Generated font cmap does not match the missing required characters")
    if required - (covered | actual):
        raise SystemExit("Generated font does not cover every required Chinese character")

    ranges: list[list[int]] = []
    for codepoint in sorted(missing):
        if ranges and codepoint == ranges[-1][1] + 1:
            ranges[-1][1] = codepoint
        else:
            ranges.append([codepoint, codepoint])
    unicode_range = ",".join(
        f"U+{start:X}" if start == end else f"U+{start:X}-{end:X}"
        for start, end in ranges
    )

    manifest = {
        "file": f"assets/opening/{args.output_name}",
        "family": "Mikage Serif",
        "weight": 500,
        "style": "normal",
        "unicodeRange": unicode_range,
        "bytes": out.stat().st_size,
        "sha256": sha256(out),
        "source": SOURCE_URL,
        "sourceSha256": sha256(source),
        "license": "SIL Open Font License 1.1",
        "licenseFile": "assets/opening/roam-glyphs-OFL.txt",
        "sourceFile": "assets/opening/roam-glyphs-SOURCE.txt",
        "scannedFiles": [f"src/{name}" for name in SCAN_FILES],
        "existingCmapCounts": existing_counts,
        "requiredChineseCount": len(required),
        "addedGlyphCodepoints": len(missing),
        "characters": "".join(map(chr, sorted(missing))),
        "coverageVerified": True,
        "remainingMissing": [],
    }
    (ROOT / "src" / args.manifest_name).write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    asset_manifest_path = ROOT / "asset-manifest.json"
    assets = json.loads(asset_manifest_path.read_text(encoding="utf-8"))
    entry = next((item for item in assets if item["path"] == manifest["file"]), None)
    if entry is None:
        entry = {"path": manifest["file"]}
        assets.append(entry)
    entry.update(sha256=manifest["sha256"], bytes=manifest["bytes"])
    asset_manifest_path.write_text(json.dumps(assets, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    license_path = ROOT / "assets/opening/roam-glyphs-OFL.txt"
    if not license_path.exists():
        raise SystemExit(f"Missing license file: {license_path}")
    source_path = ROOT / "assets/opening/roam-glyphs-SOURCE.txt"
    source_path.write_text(
        "Source family: Noto Serif SC\n"
        "Author: The Noto Project Authors\n"
        "License: SIL Open Font License, Version 1.1 (see roam-glyphs-OFL.txt)\n"
        f"Source: {SOURCE_URL}\n"
        f"License source: {LICENSE_URL}\n"
        "Derivative: static wght=500 subset; only characters missing from the existing Mikage fonts.\n"
        f"Source SHA256: {manifest['sourceSha256']}\n",
        encoding="utf-8",
    )
    print(json.dumps({key: manifest[key] for key in ("bytes", "sha256", "requiredChineseCount", "addedGlyphCodepoints", "coverageVerified")}))


if __name__ == "__main__":
    main()
