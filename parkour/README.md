# Parkour

A rooftop parkour runner through Rouen. It is a single HTML page with no dependencies: the character, the city, the music and the sound effects are all drawn or synthesised in code.

## Play

Open `index.html` in a browser (Chrome on Android works best, in landscape).

- **Tap**: jump
- **Tap in the air**: double jump with a flip
- **Swipe up in the air**: an extra flip
- **Swipe down**: slide (or dive when in the air)

A double flip gives x2 coins for 8 seconds; a triple flip gives x3. On a computer, use Space / Up to jump, Down to slide and Right to flip.

## Demo

The **DÉMO** button on the menu makes the game play itself for 1 000 m: it jumps, slides, does double and triple flips, picks up every power-up and a chest, passes under the Gros-Horloge and crosses a finish line. A caption explains each move. Demo coins and scores are not saved.

## What's in it

- The runner: blond hair, big white t-shirt, baggy grey-blue pants
- Rouen at dusk: half-timbered rooftops, the Cathedral spire, Saint-Ouen, Saint-Maclou, and the Gros-Horloge to slide under
- Obstacles: chimneys, "ICI C'EST PARIS" banners, pigeons
- Power-ups: Paris ball (coin magnet), Disque d'Or (shield), OVNI (flight), loot chests
- Style screen with outfits, hats and trails by rarity; 15 challenges (Défis); saved record and coins
- Snow and a birthday message in December

Progress is saved in the browser (`localStorage`), so it stays on the device.

## Install on a phone

When served over HTTPS (for example GitHub Pages), Chrome can add it to the home screen (menu, then "Add to Home screen"). It then opens full-screen and works offline thanks to `manifest.webmanifest` and `sw.js`.
