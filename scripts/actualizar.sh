#!/bin/bash
# Actualiza la skill a la última versión de GitHub SIN borrar lo tuyo (estilos, música, .venv, node_modules).
# Uso (en la Terminal):
#   curl -fsSL https://raw.githubusercontent.com/juanguicasti55-collab/editor-video-ia/main/scripts/actualizar.sh | bash
#   … | bash -s -- "/otra/carpeta/de/la/skill"     (si no está en ~/.claude/skills/editor-video-ia)
set -e
REPO="https://github.com/juanguicasti55-collab/editor-video-ia"
DEST="${1:-$HOME/.claude/skills/editor-video-ia}"

if [ -d "$DEST/.git" ]; then
  echo "→ $DEST es un clon de git: traigo los cambios…"
  git -C "$DEST" pull --ff-only
else
  echo "→ Bajo la última versión de GitHub…"
  TMP="$(mktemp -d)"
  curl -fsSL "$REPO/archive/refs/heads/main.tar.gz" | tar -xz -C "$TMP"
  SRC="$(ls -d "$TMP"/editor-video-ia-*)"
  mkdir -p "$DEST"
  # Copia encima sin borrar nada que solo exista en tu carpeta (tus estilos, tu música, .venv, engine/node_modules)
  if command -v rsync >/dev/null; then
    rsync -a "$SRC"/ "$DEST"/
  else
    cp -R "$SRC"/. "$DEST"/
  fi
  rm -rf "$TMP"
fi
chmod +x "$DEST"/scripts/*.sh 2>/dev/null || true
echo "→ Reviso dependencias…"
bash "$DEST/scripts/setup.sh"
echo "✅ Skill actualizada en $DEST"
echo "   Nuevo: texto.py (aprobar el texto), validar.py («cumple X de Y»), acelerar.py y el revisor QA."
