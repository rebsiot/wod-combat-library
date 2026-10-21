# WoD20 Combat Library v0.2.9 — Cleanup art pass for maneuvers and techniques

This patch keeps the same **142 combat and weapon reference Items** but improves more of the user-reviewed icons. The new pass focuses on the folders called out during review: general maneuvers, dirty fighting, martial arts, Do special techniques, and learning/prerequisite references.

## What changed

- Added more approved screenshot portraits for entries such as **Body Slam, Head Butt, Low Blow, Tackle, Counter Throw, Throw (Hard), Throw (Soft), Hurricane Throw, Disarm (General), Disarm (Martial Arts), Elbow / Knee Strike, Soft Fist,** and **Do — Training and Mastery**.
- Reassigned several awkward placeholders to more fitting art, including **Read an Opponent**, **Ten Thousand Weapons**, **Plum Flower Blossom**, **Iron Shirt**, and **The Peaceful Way**.
- Existing rules, Item types, keys, IDs, folder names, and compendium/world-update behavior are unchanged.

## Upgrade reminder

Back up the module and your world data first. The compendium update is repeat-safe, and the optional world refresh still updates only eligible module-managed World Item `img` paths. Actor-owned Items are not modified.

**Rollback:** Restore v0.2.8 software. If World Item `img` fields were updated, restore the corresponding world-data snapshot as well.