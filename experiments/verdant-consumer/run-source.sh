#!/usr/bin/env bash
# Standalone exact-source qualification: never imports Verdant into Pixel Pals runtime.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/output"
TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT
mkdir -p "$TEMP/src" "$TEMP/output" "$OUT"

cp "$ROOT/Cargo.toml" "$ROOT/orchard.json" "$ROOT/invalid-orchard.json" "$ROOT/verify-glb.mjs" "$ROOT/preview-glb.mjs" "$TEMP/"
cp "$ROOT/src/main.rs" "$TEMP/src/main.rs"
python3 - "$TEMP/Cargo.toml" <<'PY'
import pathlib, sys
p=pathlib.Path(sys.argv[1])
raw=p.read_text()
old='verdant-core = { version = "=2.21.7", registry = "verdant", default-features = false }'
new='verdant-core = { git = "https://github.com/afflom/verdant-engine", rev = "cf25bac29df05f97573ca5ef2a1d83c2f201aff3", default-features = true }'
assert old in raw, 'pinned v2.21.7 release dependency not found'
p.write_text(raw.replace(old,new))
PY

(
  cd "$TEMP"
  cargo +1.97.1 run --release -- orchard.json output/orchard-first.glb
  cargo +1.97.1 run --release -- orchard.json output/orchard-second.glb
  node verify-glb.mjs output/orchard-first.glb output/orchard-second.glb output/source-manifest.json
  node preview-glb.mjs output/orchard-first.glb output/orchard-landscape.png output/orchard-portrait.png output/preview-manifest.json
  if cargo +1.97.1 run --release -- invalid-orchard.json output/invalid.glb; then
    echo 'FAIL: bad route accepted by source consumer' >&2
    exit 1
  fi
  test ! -e output/invalid.glb
  sha256sum Cargo.lock > output/source-cargo-lock.sha256
  cp Cargo.lock output/source-Cargo.lock
  cp output/orchard-first.glb "$OUT/source-orchard.glb"
  cp output/orchard-landscape.png output/orchard-portrait.png output/source-manifest.json output/preview-manifest.json output/source-Cargo.lock output/source-cargo-lock.sha256 "$OUT/"
  echo 'VERDANT_SOURCE_GATE_PASS: exact pinned Verdant source, duplicate GLB, negative input and two independent debug previews'
)
