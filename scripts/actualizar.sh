#!/bin/bash
# Actualiza la skill a la última versión de GitHub SIN borrar lo tuyo (estilos, música, .venv, node_modules).
# Antes de tocar nada guarda un RESPALDO de tu carpeta y al final te dice qué archivos tuyos eran distintos.
# Uso (en la Terminal):
#   curl -fsSL https://raw.githubusercontent.com/juanguicasti55-collab/editor-video-ia/main/scripts/actualizar.sh | bash
#   … | bash -s -- "/otra/carpeta/de/la/skill"     (si no está en ~/.claude/skills/editor-video-ia)
# Para volver atrás:  tar -xzf ~/editor-video-ia-respaldos/<fecha>.tar.gz -C ~/.claude/skills/
set -e
REPO="https://github.com/juanguicasti55-collab/editor-video-ia"
DEST="${1:-$HOME/.claude/skills/editor-video-ia}"
RESP="$HOME/editor-video-ia-respaldos"          # FUERA de la carpeta de skills (si no, Claude la vería como otra skill)
FECHA="$(date +%Y-%m-%d-%H%M%S)"

if [ -d "$DEST" ]; then
  mkdir -p "$RESP"
  echo "→ Respaldo de tu carpeta (sin .venv ni node_modules, que se reinstalan) en $RESP/$FECHA.tar.gz"
  tar -czf "$RESP/$FECHA.tar.gz" -C "$(dirname "$DEST")" \
      --exclude "*/.venv" --exclude "*/node_modules" --exclude "*/.git" "$(basename "$DEST")"
fi

if [ -d "$DEST/.git" ]; then
  echo "→ $DEST es un clon de git: traigo los cambios…"
  git -C "$DEST" pull --ff-only
else
  echo "→ Bajo la última versión de GitHub…"
  TMP="$(mktemp -d)"
  curl -fsSL "$REPO/archive/refs/heads/main.tar.gz" | tar -xz -C "$TMP"
  SRC="$(ls -d "$TMP"/editor-video-ia-*)"
  mkdir -p "$DEST"
  # Qué archivos tuyos son distintos de los de GitHub (esos se reemplazan; quedan en el respaldo)
  CAMBIAN="$(cd "$SRC" && find . -type f | while read -r f; do
    [ -f "$DEST/$f" ] && ! cmp -s "$f" "$DEST/$f" && echo "   ${f#./}"; done || true)"
  # Copia encima sin borrar nada que solo exista en tu carpeta (tus estilos, tu música, .venv, engine/node_modules)
  if command -v rsync >/dev/null; then
    rsync -a "$SRC"/ "$DEST"/
  else
    cp -R "$SRC"/. "$DEST"/
  fi
  rm -rf "$TMP"
  if [ -n "$CAMBIAN" ]; then
    echo "→ Estos archivos tuyos eran distintos y se cambiaron por la versión de GitHub (están en el respaldo):"
    echo "$CAMBIAN"
  fi
fi
chmod +x "$DEST"/scripts/*.sh 2>/dev/null || true
echo "→ Reviso dependencias…"
bash "$DEST/scripts/setup.sh"
echo "✅ Skill actualizada en $DEST"
[ -d "$RESP" ] && echo "   Respaldo: $RESP/$FECHA.tar.gz"
