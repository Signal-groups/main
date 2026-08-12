from pathlib import Path
from PIL import Image
import json

ROOT = Path(__file__).resolve().parents[1]
AD_ROOT = ROOT / "ad"
ASSET_ROOT = AD_ROOT / "assets" / "embedded"

converted = []

for source in sorted(ASSET_ROOT.iterdir()):
    if source.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
        continue

    destination = source.with_suffix(".webp")
    with Image.open(source) as image:
        has_alpha = "A" in image.getbands()
        prepared = image.convert("RGBA" if has_alpha else "RGB")
        prepared.save(
            destination,
            "WEBP",
            quality=84,
            method=6,
            lossless=has_alpha,
        )
        converted.append(
            {
                "source": source.name,
                "destination": destination.name,
                "width": image.width,
                "height": image.height,
                "originalBytes": source.stat().st_size,
                "optimizedBytes": destination.stat().st_size,
            }
        )

replacement_map = {
    item["source"]: item["destination"]
    for item in converted
    if item["optimizedBytes"] < item["originalBytes"]
}

updated_files = []
for page in AD_ROOT.rglob("*"):
    if page.suffix.lower() not in {".html", ".css", ".js"}:
        continue
    original = page.read_text(encoding="utf-8")
    updated = original
    for old_name, new_name in replacement_map.items():
        updated = updated.replace(old_name, new_name)
    if updated != original:
        page.write_text(updated, encoding="utf-8")
        updated_files.append(page.relative_to(AD_ROOT).as_posix())

for item in converted:
    source = ASSET_ROOT / item["source"]
    destination = ASSET_ROOT / item["destination"]
    if item["source"] in replacement_map:
        source.unlink()
    elif destination.exists():
        destination.unlink()

report = {
    "converted": converted,
    "usedOptimizedAssets": sorted(replacement_map.values()),
    "updatedFiles": updated_files,
    "originalBytes": sum(item["originalBytes"] for item in converted),
    "optimizedBytes": sum(
        item["optimizedBytes"] if item["source"] in replacement_map else item["originalBytes"]
        for item in converted
    ),
}
(ASSET_ROOT / "optimization-report.json").write_text(
    json.dumps(report, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)

print(json.dumps({
    "convertedAssets": len(replacement_map),
    "updatedFiles": len(updated_files),
    "beforeMB": round(report["originalBytes"] / 1024 / 1024, 2),
    "afterMB": round(report["optimizedBytes"] / 1024 / 1024, 2),
}, ensure_ascii=False, indent=2))
