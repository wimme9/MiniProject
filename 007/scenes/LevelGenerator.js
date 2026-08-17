// scenes/LevelGenerator.js
// Procedurally generates a new, randomized level layout every time it's
// called (used on Start, Replay AND Restart, so every playthrough differs).
// Difficulty (gap width, spike frequency, platform density) ramps up the
// further along the level you go, split into 3 tiers.
//
// This file has NO Phaser dependency - it only returns plain data, so it
// can be unit-tested with plain Node if needed.

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}
function chance(p) {
  return Math.random() < p;
}

function pickTier(progressRatio, tiers) {
  for (const tier of tiers) {
    if (progressRatio <= tier.untilRatio) return tier;
  }
  return tiers[tiers.length - 1];
}

/**
 * @param {object} cfg  the "levelGen" block from gameData.json
 * @returns {object} level data: worldWidth, ground, pits, platforms,
 *                    coins, bonusCoins, spikes, checkpoints, goal
 */
function generateLevel(cfg) {
  const levelLength = randInt(cfg.levelLengthMin, cfg.levelLengthMax);
  const groundY = cfg.groundY;

  // Exactly 3 fixed coin "planes", so pickup height always reads clearly:
  //  1) ground level        - regular coins, easy, no jump needed
  //  2) low floating platform - regular coins, small jump needed
  //  3) high floating platform - bonus coins, near max jump height (risk/reward)
  const GROUND_COIN_Y = groundY - 40;
  const LOW_PLATFORM_Y = groundY - 95;
  const HIGH_PLATFORM_Y = groundY - 145; // stays under the ~150px max jump apex

  const ground = [];
  const pits = [];
  const platforms = [];
  const coins = [];
  const bonusCoins = [];
  const spikes = [];

  let x = 0;
  let segmentStartX = 0;
  let justLandedFromPit = false;

  const closeGroundSegment = (endX) => {
    if (endX > segmentStartX) {
      ground.push({ x: segmentStartX, y: groundY, width: endX - segmentStartX, height: 40 });
    }
  };

  // --- Start safe zone: no hazards, just a couple of coins to get moving ---
  const startSafe = cfg.startSafeZone;
  coins.push({ x: 140, y: GROUND_COIN_Y });
  coins.push({ x: 200, y: GROUND_COIN_Y });
  x = startSafe;

  // --- Main procedurally generated body ---
  const bodyEnd = levelLength - cfg.endSafeZone;

  while (x < bodyEnd) {
    const progress = x / levelLength;
    const tier = pickTier(progress, cfg.tiers);

    const doPit = !justLandedFromPit && chance(0.32);

    if (doPit) {
      // Close the ground we've built so far, right at the pit's edge
      closeGroundSegment(x);

      const gap = randInt(tier.gapMin, tier.gapMax);
      pits.push({ x, width: gap });

      // Wide gaps get a stepping-stone platform near the middle so the
      // jump is always makeable even at max difficulty.
      if (gap > 150) {
        platforms.push({
          x: x + gap / 2 - 32,
          y: groundY - 16,
          width: 64,
          height: 20
        });
      }

      x += gap;
      segmentStartX = x;
      justLandedFromPit = true;
      continue;
    }

    // --- Flat run segment ---
    const flatLen = randInt(tier.flatMin, tier.flatMax);
    const segEnd = Math.min(x + flatLen, bodyEnd);

    // Ground-level coin: sparse, at most 1 per run, fixed height (level 1)
    if (segEnd - x > 100 && chance(cfg.groundCoinChance)) {
      coins.push({ x: randFloat(x + 40, segEnd - 40), y: GROUND_COIN_Y });
    }

    // Occasionally add ONE floating platform above this run, on one of the
    // two fixed height tiers - low (level 2, regular coin) or high
    // (level 3, bonus coin). Never both on the same run, keeping the 3
    // planes visually distinct instead of a random scatter of heights.
    if (chance(tier.platformChance)) {
      const platW = randInt(80, 128);
      const platX = randFloat(x + 40, Math.max(x + 40, segEnd - platW - 40));
      const isHigh = chance(0.5);
      const platY = isHigh ? HIGH_PLATFORM_Y : LOW_PLATFORM_Y;
      platforms.push({ x: platX, y: platY, width: platW, height: 24 });

      if (isHigh) {
        bonusCoins.push({ x: platX + platW / 2, y: platY - 30 });
      } else {
        coins.push({ x: platX + platW / 2, y: platY - 30 });
      }
    }

    // Spike placement: never right after a pit landing (needs clear ground)
    if (!justLandedFromPit && chance(tier.spikeChance) && segEnd - x > 140) {
      spikes.push({ x: (x + segEnd) / 2, y: groundY - 16 });
    }

    x = segEnd;
    justLandedFromPit = false;
  }

  // --- End safe zone + goal ---
  closeGroundSegment(x);
  ground.push({ x, y: groundY, width: levelLength - x, height: 40 });
  const goal = { x: levelLength - 60, y: groundY - 60 };

  // --- Checkpoints: spaced roughly evenly, snapped onto solid ground ---
  const isInsidePit = (px) => pits.some(p => px >= p.x && px <= p.x + p.width);
  const snapToGround = (targetX) => {
    let offset = 0;
    while (offset < 400) {
      if (targetX + offset < levelLength && !isInsidePit(targetX + offset)) return targetX + offset;
      if (targetX - offset > 0 && !isInsidePit(targetX - offset)) return targetX - offset;
      offset += 10;
    }
    return targetX;
  };

  const checkpoints = [];
  const ratios = cfg.checkpointCount === 1 ? [0.5]
    : cfg.checkpointCount === 2 ? [0.35, 0.7]
    : [0.25, 0.5, 0.75];
  ratios.forEach(r => {
    const cx = snapToGround(Math.floor(levelLength * r));
    checkpoints.push({ x: cx, y: groundY - 40 });
  });

  return {
    worldWidth: levelLength,
    ground,
    pits,
    platforms,
    coins,
    bonusCoins,
    spikes,
    checkpoints,
    goal
  };
}

// Expose for both browser (<script>) and Node (unit testing) use.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateLevel };
}