"""Package only runtime assets; preserve /eruption/ and redirect the site root."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent.parent
destination = root / 'artifacts' / 'site'
game = destination / 'eruption'
game.mkdir(parents=True, exist_ok=True)
files = [
    'index.html', 'layout.css', 'paths.js', 'payouts.js', 'visuals.js',
    'city-depth.js', 'street-sprites.js', 'civic-buildings.js', 'city-cycle.js',
    'impact-effects.js', 'street-reactions.js', 'explosion-rounded.png',
    'volcano-pixel.png',
]
for name in files:
    shutil.copy2(root / 'eruption' / name, game / name)
shutil.copytree(root / 'eruption' / 'assets', game / 'assets', dirs_exist_ok=True)
shutil.copy2(root / 'model.js', destination / 'model.js')
(destination / '.nojekyll').write_text('')
(destination / 'index.html').write_text(
    '<!doctype html><html lang="en"><meta charset="utf-8">'
    '<meta http-equiv="refresh" content="0;url=eruption/">'
    '<title>Plinko Eruption</title><a href="eruption/">Play Plinko Eruption</a></html>',
    encoding='utf-8',
)
print(f'Packaged Eruption at {destination}')
