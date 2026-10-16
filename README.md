# WoD20 Combat Library v0.2.3

A separate, reusable combat compendium for **Foundry VTT 13/14** and the **World of Darkness 20th** system. Updates from GitHub through Foundry's **Update All** and maintains a separate, player-readable Item compendium. Nothing is automatically added to characters.

## v0.2.3 — Game-Icons.net artwork and World Item update fix

All 142 entries now use recognizable illustrated artwork selected from the user-provided **Game-Icons.net SVG set**. The release includes 116 locally bundled SVGs and the file `THIRD_PARTY_ICONS.md` with original authors and licensing. The image artwork is color-adjusted but properly attributed. It never requires web image fetching in Foundry.

**What v0.2.2 missed:** That update only identified World Items with `flags.wod20-combat-library.key`. Foundry imports sometimes lack the flag. Version 0.2.3 finds those additional World Items only when their **exact name, Item type, category folder, and `WoD20 Combat Library` ancestor folder** match the catalog. It updates *only* the image field. It preserves World Item IDs, mechanics, descriptions, names, folders, custom art, and Actor-owned copies. It doesn't create duplicates or mass-import Items. Items outside the Combat Library folder or with unmatched types are intentionally skipped.

The GM-confirmation dialog shows how many matching World Items will receive the update (flag matches versus folder/name matches) and how many have custom art protected from replacement. Before updating any World Item images, the module stores a rolling backup of previous image paths in the hidden world setting `wod20-combat-library.worldIconBackups` (up to five snapshots). Restore a matching world backup for reliable rollback.

**Reference maneuvers** and unusual weapon effects that don't have accurate native roll mechanics remain `Feature` Items; an icon change does not add fictitious automation. Punch, Kick, Bite, and Claw remain native `Melee Weapon` Items with the prior v0.2.1 fixes.

### Recommended GitHub update

1. **Back up your Foundry world** and previous module files before the update.
2. In Foundry, click **Add-on Modules → Update All**. Verify `WoD20 Combat Library` is now **v0.2.3**.
3. Restart Foundry if needed. In the Foundry browser, press **Ctrl+Shift+R**.
4. Log in as GM and approve **Update WoD20 Combat Library**. Check the World Item preview counts first.
5. Compare Curbstomp, Head Butt, Joint Lock, Throw (Hard), Axe and Katana in both **Compendium Packs** and the **Items** directory.
6. Character-owned weapon icons won't automatically change. Existing actor Items are not modified.

**Rollback:** Restore both the previous module version and the pre-update **world backup**. The hidden icon backup stores prior paths for manual recovery only; this module does not include a one-click image rollback.

## Contents

**142 reference and equipment Items:**

- 49 maneuvers, Do techniques, and reference guides from the original Martial Arts/Do source excerpt (M20 pp. 422-430)
- 82 distinct weapon entries from the weapons table (M20 pp. 450-453): 42 melee weapons, 34 ranged/equipment entries, 6 thrown weapons
- 8 missing general/martial maneuvers from the M20 maneuver tables (pp. 448-449)
- 3 short guide Items for concealment, ranged attacks, ammunition/reloading, and exceptional effects

Weapons are grouped into named compendium folders: axes, blades, clubs, fist extensions, improvised, whips/chains, conventional firearms, Technocracy, bows, nonlethal, military, thrown.

### Native WoD20 Item handling

**v0.2.1 fix — basic natural attacks:** Punch, Kick, Bite, and Claw are now native
`Melee Weapon` Items with `system.isnatural = true`, rather than reference-only
`Feature` entries. On a WoD20 character sheet these belong in **Combat → Natural
Weapons**, with attack and damage rolls. Punch is Strength bashing at difficulty 6,
Kick is Strength +1 bashing at difficulty 7, Bite uses a provisional Strength +1
bashing at difficulty 5, and Claw uses a provisional Strength +1 lethal at
difficulty 6. The source allows variable bite/claw damage and damage types by
physiology; the description gives the full range. Edit the **character-owned copy**
for the creature in question. Melee combat maneuvers with straightforward attack
and damage rules retain their native weapon entries; unusual special-effect moves
remain reference Features rather than inventing automation.

**In-place upgrade from v0.2.0:** The four managed Feature entries are changed to
native weapons with the **same compendium Item IDs**. Before the retyping operation,
the GM client stores the original four JSON records under the hidden world setting
`wod20-combat-library.typeMigrationBackup`. Other managed compendium items are
updated normally. Actor-owned copies are never changed. The upgrade requires a
GM confirmation and a **world backup before installation**. If the migration fails,
it attempts to restore the original Item immediately and displays an error; retain
the world backup until a live smoke test passes. This is not a claim of live-tested
migration behavior.

Simple melee, ranged, and thrown weapons use WoD20's native `Melee Weapon` or `Ranged Weapon` types. Fields include attack pool/ability, damage, difficulty, concealment, range, rate, and magazine capacity where these apply. The listed melee attack difficulties are from the book. Since the ranged table does not specify a base attack difficulty, the module uses the WoD20 default difficulty 6 and explains range modifiers in the reference guide. Ranged base damage uses the fixed damage dice given in the book; melee uses Strength plus bonus. Strength/Skill choices for attacking are standard mappings, not values supplied explicitly by the table.

Weapons with effects that cannot be represented accurately using a straightforward damage roll are `Feature` reference Items, including the Bolan Mk. 13 composite weapons system, Flamethrower, and Rocket Launcher. No invented damage automation is included. Grenade launchers have damage fields as printed, but use separate explosive rules for blast effects; those rules are not in the uploaded table. Source descriptions retain noteworthy restrictions, unusual reload/mode rules, and source page citations.

The book's clip notations like `17+1` are displayed exactly in Item descriptions and recorded in metadata. The native numeric clip capacity is 18 in that case. Thrown weapon ranges are absent from the table and left unspecified (0 in the sheet).

The 49 original moves retain their original item types. Some moves represented by Feature require Storyteller adjudication; no false auto-attack macros have been added.

## Permissions

This is an **Item compendium**, not a public editable world folder. On first install and every upgrade, the installer sets:

| Foundry role | Compendium | Each Item |
|---|---|---|
| Player | OBSERVER | Observer (2) |
| Trusted Player | OBSERVER | Observer (2) |
| Assistant GM | OWNER | Owner (3) |
| GM | OWNER | Owner (3) |

Item ownership is also set explicitly by user ID to account for existing players. This lets players search, inspect, and drag **copies** onto characters they control, but not edit the shared originals. New compendiums are locked against accidental changes. If a previously created pack was unlocked before the upgrade, that lock preference is preserved.

Only items with this module's own managed flags are updated. If the target compendium contains unmanaged Items, the installer refuses to change the pack rather than exposing private content. **No ownership on existing actors, actor-embedded Items, world Items, or other compendiums is changed.** In v0.2.3, qualifying existing World Items have only their `img` field updated.

## Install or upgrade

1. Unzip `wod20-combat-library` directly under your Foundry `Data/modules` directory. If upgrading, replace that directory entirely.
2. Restart Foundry, press **Ctrl+Shift+R** to hard-refresh the browser, and verify the module is enabled at **Game Settings > Manage Modules**.
3. Back up the **Foundry world**, including the world Combat Library compendium, before updating v0.2.0.
4. Log in as **GM**; approve **Create / Update WoD20 Combat Library** when prompted. The icon refresh also covers eligible matching World Items with or without source flags when they meet the strict folder/name/type checks; Actor-owned items are untouched.
5. Open **Compendium Packs > WoD20 Combat Library**. Players should see a read-only collection with draggable Items.
6. Test by dragging **Punch** (Natural Weapons) and **Hatchet** (Melee Weapons) onto a **controlled/unlocked** WoD20 Actor sheet. Confirm each appears under Combat and can roll an attack.
7. If either fails, verify the character sheet is editable and the player owns the Actor. Capture any browser-console error: the offline tests cannot exercise live drag-and-drop.

**Rollback:** Stop Foundry. Restore the previous `Z:\Data\modules\wod20-combat-library` folder **and a matching pre-upgrade world snapshot**. Restoring only the older module ZIP cannot undo in-world compendium Item type changes.

For manual reinstallation/upgrades, the module API supports:

```javascript
game.modules.get("wod20-combat-library").api.install();
```

This displays the GM confirmation before doing anything.

## Compatibility and limitations

- WoD20 V7.3.x / Foundry VTT 13-14 schema fields checked against published template.json. Current module build and migration are only syntax/mock-tested; **live user-world drag/drop and item retyping are not verified**.
- Existing character-owned copies do not change when master compendium content is updated (normal Foundry behavior).
- This is reference and equipment catalog automation, not a full combat adjudicator.
- Distinct book rows have separate Items, including a thrown variant for the knife and tomahawk.
- The **Explosives chart** was not supplied; explosive blast/area rules must be handled by the Storyteller until that source is available.

## Sources

User-supplied excerpts from *Mage: The Ascension 20th Anniversary Edition*, pp. 422-430 and 448-453. Text is summarized and gameplay stats transcribed for personal use; not an official publication.
