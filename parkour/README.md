# Parkour

A parkour runner through Rouen with two levels:

- **Niveau 1, les toits (la nuit):** an endless run over the rooftops that gets faster and harder. A finish arch every 1 000 m gives bonus coins (100 per km), a protective bubble and a coin multiplier; the first one drops the crown. A pink flag marks the runner's best distance.
- **Niveau 2, Rue Eau-de-Robec (le jour):** a hand-built street course along the Robec with café tables, awnings to bounce on, balconies, benches to vault, a handrail, drawbridges that lift, walls to climb, a UFO flight and a finish line. Hints appear just before each move. Each run earns stars: ★ reach the finish, ★★ also 250 coins with the bubble kept, ★★★ also both goals and the 3 hidden golden jerseys. The first 3-star run unlocks the "Maillot doré" outfit. It is a single HTML page with no dependencies: the character, the city, the music and the sound effects are all drawn or synthesised in code.

## Play

Open `index.html` in a browser (Chrome on Android works best, in landscape).

- **2 quick taps**: jump (2 more in the air: double jump)
- **3 quick taps**: salto
- **Keep the finger pressed**: slide on the ground, glide in the air, dribble the ball into the goal (double bonus)
- Swiping down / up still slides / flips

A double flip gives x2 coins for 8 seconds; a triple flip gives x3. On a computer, use Space / Up to jump, Down to slide and Right to flip.

## Demo

The **DÉMO** button on the menu makes the game play itself for 1 000 m: it jumps, slides, does double and triple flips, picks up every power-up and a chest, passes under the Gros-Horloge and crosses a finish line. A caption explains each move. Demo coins and scores are not saved.

## What's in it

- The runner: blond hair, big white t-shirt, baggy grey-blue pants
- Rouen at dusk: half-timbered rooftops, the Cathedral spire, Saint-Ouen, Saint-Maclou, and the Gros-Horloge to slide under
- Roofs of different shapes: big pointed roofs with dormers, rows of pointed roofs, castles with battlements and pointed towers
- Obstacles: chimneys (some with red and blue flare smoke), "ICI C'EST PARIS" banners, washing lines of jerseys, pigeons
- French flags on the roofs; "ICI C'EST PARIS", "ALLEZ PARIS" and "PSG" banners and tags on the walls
- Football: a ball and a goal on some roofs; running into the ball kicks it in: "BUUUUUT !" and bonus coins
- At 1 000 m: a finish arch, and a king's crown (red velvet and gold) falls onto his head (unlocks the crown)
- Power-ups: Paris ball (coin magnet), Disque d'Or (shield), OVNI (flight), loot chests
- Style screen with outfits, hats and trails by rarity; 15 challenges (Défis); saved record and coins
- Snow and a birthday message in December

Progress is saved automatically in the browser (`localStorage`). The SAUVEGARDE screen has a save button and a save code (`PK1-…`) that can be copied and pasted back to restore coins, outfits and records on another phone.

## Install on a phone

When served over HTTPS (for example GitHub Pages), Chrome can add it to the home screen (menu, then "Add to Home screen"). It then opens full-screen and works offline thanks to `manifest.webmanifest` and `sw.js`.

## Source

`src/core.html` is the game, `src/level2-robec.js` is level 2. Run `sh build.sh` inside `src/` to rebuild `index.html`.
