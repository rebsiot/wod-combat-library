# Changelog

## 0.2.2 — 2026-10-15

- Added 69 original, bundled SVG pictograms. All 142 catalog entries map to 65 distinct context-sensitive icons for natural attacks, martial techniques, Akashic Do, weapon classes, unusual equipment, and rules references. No remote assets, fonts, or creator-licensed images are required.
- GM-approved update refreshes compendium Item icons using stable module keys, preserving Item IDs and types. For existing v0.2.1 Items, the update is icon-only and preserves customized statistics, descriptions, names, and folders.
- The same update now refreshes eligible existing **World Items** copied from the library, but only where a module-managed key is present and the image is still a default or managed icon. Custom artwork, unrelated Items, and Actor-owned copies are not modified.
- Retained the safe 0.2.0 to 0.2.1 natural-weapon upgrade for worlds skipping a release. No automatic mass import or duplicate world folders.
- Expanded automated coverage of all mappings, icon file existence, the v0.2.1 in-place icon upgrade, selective World Item icon sync, and custom image preservation. Static/simulation tests passed; **live Foundry v14 testing is pending**.
- After replacing the module directory, restart Foundry and press **Ctrl+Shift+R**; approve the update as GM. Make module and world backups before updating.

## 0.2.1 — 2026-10-15

- Fixed Punch, Kick, Bite, and Claw: now generated as native WoD20 `Melee Weapon` Items with `isnatural: true` and rollable attack/damage fields instead of unrollable reference Features.
- Supports `;` as well as `,` in simple Strength-based melee damage notation.
- For variable Bite/Claw damage, uses explicitly identified editable lower-bound defaults; full source variants remain in the descriptions.
- On upgrading v0.2.0, replaces only the four module-managed Feature records with weapon records while preserving their compendium Item IDs and other-module flags. A world setting holds the original JSON records; best-effort restoration is attempted if a replacement fails.
- Preserved the complete 142-entry catalog, source descriptions, 42 ordinary melee weapon entries, compendium folders, permission model, and original Actor/world Item data.
- Static validation and Foundry API mock tests passed, including ID-preserving reference-to-weapon upgrade, rollback snapshot, actor-item copy simulation, reinstallation and permission protection. **Live Foundry v14 drag-and-drop remains unverified.**
- Before upgrading: back up the Foundry world as well as the module directory. For rollback restore both the previous module and the matching world backup.

## 0.2.0 — 2026-10-12

- Added 82 source-table weapon/equipment entries: 42 melee, 34 ranged (including Bolan Mk.13 reference), and 6 thrown.
- Added 8 maneuvers from general and Martial Arts quick-reference tables not present in the original maneuvers excerpt.
- Added 3 equipment/attack reference guides.
- Preserved damage dice, difficulty, concealment, ranges, rates, magazine values, and source notes.
- Native WoD20 Melee Weapon and Ranged Weapon documents where stats are representable; reference Features for exceptional damage profiles.
- Explicit pack-level and item-level role permissions (Player/Trusted Observer, Assistant GM/GM Owner).
- Safe in-place upgrade from v0.1.0; refuses to modify a compendium with unmanaged content.
- Preserves established compendium lock state, locking brand-new packs by default.

## 0.1.0 — 2026-10-12

- Initial 49-item maneuver, Do technique and optional rule library; GM-approved installer and read-only player permissions.
