/**
 * WoD20 Combat Library 0.2.3
 * GM-approved, repeat-safe upgrade of Item compendium and matching World Item icons.
 * Source data in moves.json and weapons.json; stable keys permit safe updates.
 * Only module-managed World Item icons are refreshed; actor items are never modified.
 */
const MOD = "wod20-combat-library";
const VERSION = "0.2.3";
const PACK_NAME = "wod20-combat-library";
const PACK_ID = `world.${PACK_NAME}`;
const ACCESS = Object.freeze({
  PLAYER: "OBSERVER", TRUSTED: "OBSERVER", ASSISTANT: "OWNER", GAMEMASTER: "OWNER"
});
const OWN = 3;
const VIEW = 2;
const GROUPS = [
  "01 General maneuvers", "02 Dirty fighting", "03 Martial Arts",
  "04 Do special techniques", "05 Optional focus and styles", "06 Learning and prerequisites",
  "07 Melee — Axes", "08 Melee — Blades", "09 Melee — Clubs",
  "10 Melee — Fist Extensions", "11 Melee — Improvised", "12 Melee — Whips and Chains",
  "13 Ranged — Conventional", "14 Ranged — Technocracy", "15 Ranged — Bows",
  "16 Ranged — Nonlethal", "17 Ranged — Military", "18 Thrown Weapons",
  "19 Weapon Rules and Notes"
];
const CHUNK = 25;
const ICON_DIR = `modules/${MOD}/assets/icons`;
const DEFAULT_ICONS = new Set(["icons/svg/book.svg", "icons/svg/target.svg", "icons/svg/sword.svg"]);
let catalogEntries = [];
let iconMap = null;
let inProgress = false;

function report(message, kind = "info") {
  ui.notifications?.[kind]?.(`WoD20 Combat Library: ${message}`);
}
function html(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}
function pack() { return game.packs.get(PACK_ID); }
function ownership() {
  const owners = {default: VIEW};
  for (const user of game.users || []) {
    owners[user.id] = (user.isGM || user.role >= 3) ? OWN : VIEW;
  }
  return owners;
}
async function setAccess(collection) {
  await collection.configure({ownership: {...ACCESS}});
  for (const [role, required] of Object.entries(ACCESS)) {
    if (collection.ownership?.[role] !== required) {
      throw new Error(`Failed to set ${role} access to ${required}`);
    }
  }
}
async function loadCatalog() {
  const fetchJson = async (name) => {
    const response = await fetch(`modules/${MOD}/data/${name}.json`);
    if (!response.ok) throw new Error(`Cannot read ${name} catalog: HTTP ${response.status}`);
    return response.json();
  };
  const [moves, weapons, iconCatalog] = await Promise.all([fetchJson("moves"), fetchJson("weapons"), fetchJson("icon-map")]);
  const entries = [...(moves.entries || []), ...(weapons.entries || []), ...additionalEntries()];
  if (entries.length < 130) throw new Error("Combat catalog is missing or incomplete.");
  const keys = new Set();
  for (const entry of entries) {
    if (!entry.key || !GROUPS.includes(entry.category) || keys.has(entry.key)) {
      throw new Error(`Invalid or duplicate combat entry: ${entry.name || entry.key}`);
    }
    keys.add(entry.key);
  }
  const mapped = iconCatalog?.icons;
  if (!mapped || Object.keys(mapped).length !== entries.length) {
    throw new Error("Combat icon mapping is missing or incomplete.");
  }
  for (const entry of entries) {
    if (!/^[a-z0-9-]+$/.test(mapped[entry.key] || "")) {
      throw new Error(`No bundled icon for ${entry.key}`);
    }
  }
  iconMap = mapped;
  catalogEntries = entries;
  return {entries};
}
function additionalEntries() {
  const source = "Mage: The Ascension 20th Anniversary Edition, pp. 448-449";
  const m = (key,name,roll,difficulty,damage,special,category="01 General maneuvers") => ({
    key:`move-extra-${key}`,name,roll,difficulty,damage,actions:"1",
    summary:`${name}: general combat maneuver.`,special,prerequisites:"None",
    source,category,itemType: (["bite", "claw", "punch", "kick"].includes(key)) ? "Melee Weapon" : "Feature",optional:false
  });
  return [
    m("bite","Bite","Dexterity + Brawl","5","Strength +1 to +3; bashing or lethal","Damage varies by teeth and the attacker's physiology."),
    m("claw","Claw","Dexterity + Brawl","6","Strength +1 to +3; lethal or aggravated","Claw damage depends on the creature or enhancement; Storyteller adjudicates."),
    m("disarm","Disarm (General)","Dexterity + Melee (or Brawl while unarmed)","Weapon: normal +1 / unarmed: 8","Disarm or normal damage","Attacker must exceed opponent's Strength in successes to disarm; failure can cause ordinary damage; botch can lose the attacker's own weapon."),
    m("rear","Flank / Rear Attack","Strength + Ability","Normal difficulty -1 (flank) / -2 (rear)","As attack","Modify the normal attack difficulty for positioning; do not replace the attack's usual dice pool."),
    m("grapple","Grapple","Strength + Brawl","6","Strength damage or none","Establish control of the opponent; subsequent actions and escape attempts require adjudication."),
    m("kick","Kick","Dexterity + Brawl","7","Strength +1; bashing","Basic unarmed kick."),
    m("punch","Punch","Dexterity + Brawl","6","Strength; bashing","Basic unarmed punch."),
    m("martial-disarm","Disarm (Martial Arts)","Dexterity + Martial Arts","7","Disarm; 3 successes needed","Unarmed disarm maneuver. Requires Martial Arts 3.","03 Martial Arts"),
    {
      key:"weapon-reference-concealment", name:"Weapon Tables — Concealment and Damage",category:"19 Weapon Rules and Notes",
      summary:"Weapon table reference: P = pocket; J = jacket; T = trenchcoat; N = cannot conceal. B = bashing, L = lethal, A = aggravated.",
      roll:"Varies by weapon",difficulty:"Varies",damage:"Varies",actions:"Varies",prerequisites:"None",optional:false,
      special:"Melee damage such as Strength +2 adds dice to Strength. Ranged damage uses the listed fixed dice pool. See weapon Items for specific exceptions.",
      source:"Mage: The Ascension 20th Anniversary Edition, pp. 450-453",itemType:"Feature"
    },
    {
      key:"weapon-reference-range", name:"Ranged Weapons — Range, Rate and Ammunition",category:"19 Weapon Rules and Notes",
      summary:"Ranges are given in yards. At the listed range the attack difficulty is 6; at twice the listed range it is 8; within two yards it is 4.",
      roll:"Dexterity + Firearms; Dexterity + Archery for bows (as applicable)",difficulty:"6 at stated range / 8 at double / 4 within 2 yards",
      damage:"All firearms and bows on the source table cause lethal damage unless otherwise indicated.",actions:"Per rate and reload rules",prerequisites:"Appropriate proficiency",optional:false,
      special:"Rate means maximum bullets or three-round bursts per turn. '17+1' denotes a full magazine plus one in the chamber. The WoD20 sheet's clip field stores total current capacity, while the exact table notation remains in the Item description.",
      source:"Mage: The Ascension 20th Anniversary Edition, pp. 452-453",itemType:"Feature"
    },
    {
      key:"weapon-reference-reloads", name:"Bows, Special Ammunition and Unresolved Effects",category:"19 Weapon Rules and Notes",
      summary:"Bows and crossbows normally require two actions to reload. A character with Archery 3 or higher may ready a bow in one action, not a crossbow.",
      roll:"Varies",difficulty:"Varies",damage:"Depends on weapon",actions:"Varies",prerequisites:"None",optional:false,
      special:"Explosive damage is covered by a separate table not included with this PDF; missile effects, flamethrower effects, and the Bolan Mk.13's multi-weapon modes require Storyteller handling. Do not assume automated damage from the equipment entry alone.",
      source:"Mage: The Ascension 20th Anniversary Edition, p. 453",itemType:"Feature"
    }
  ];
}
async function getOrCreatePack() {
  let result = pack();
  if (result) {
    if (result.documentName !== "Item") {
      throw new Error(`Existing ${PACK_ID} is not an Item compendium. No changes made.`);
    }
    return result;
  }
  if (!game.user.isGM) throw new Error("Only a GM can create a compendium.");
  result = await foundry.documents.collections.CompendiumCollection.createCompendium({
    name: PACK_NAME,
    label: "WoD20 Combat Library",
    type: "Item",
    system: "worldofdarkness",
    package: "world"
  });
  if (!result) throw new Error("Foundry did not create the Item compendium.");
  return result;
}
function rulesText(e) {
  const row = (title, value) => `<tr><th style="width:135px;text-align:left;vertical-align:top">${html(title)}</th><td>${html(value)}</td></tr>`;
  const summary = `<p>${html(e.summary)}</p>`;
  const note = e.key === "move-extra-bite" ? `<p><strong>Editable weapon default:</strong> Strength +1 bashing. The book permits Strength +1 to +3 and bashing or lethal depending on physiology; adjust the character copy.</p>` :
    e.key === "move-extra-claw" ? `<p><strong>Editable weapon default:</strong> Strength +1 lethal. The book permits Strength +1 to +3 and lethal or aggravated depending on physiology; adjust the character copy.</p>` : "";
  const table = `<table class="m20-move-rules"><tbody>${[
    row("Dice pool", e.roll), row("Difficulty", e.difficulty),
    row("Damage / effect", e.damage), row("Actions", e.actions),
    row("Requirements", e.prerequisites)
  ].join("")}</tbody></table>`;
  return `<section class="m20-move-reference">${summary}${table}${note}` +
    (e.special ? `<h3>Special Rules</h3><p>${html(e.special)}</p>` : "") +
    (e.optional ? `<p><em>Optional rule or illustrative technique: Storyteller approval required.</em></p>` : "") +
    `<p><small>${html(e.source)}. Rules summarized for table reference.</small></p></section>`;
}
// Build native attacks for representable damage; the four basic natural attacks use
// explicit editable baselines where the source offers a variable damage range.
// Counters, special-case strikes and passive abilities remain Features.
function weaponData(e) {
  if (e.itemType !== "Melee Weapon") return null;
  const naturalDefault = e.key === "move-extra-bite" ? {bonus: 1, type: "bashing"} :
    e.key === "move-extra-claw" ? {bonus: 1, type: "lethal"} : null;
  const damage = /^Strength(?: \+(\d+))?[,;]\s*(bashing|lethal)$/i.exec(e.damage);
  const roll = /^(Dexterity|Strength) \+ (Brawl|Melee|Martial Arts)$/i.exec(e.roll);
  if ((!damage && !naturalDefault) || !roll || !/^\d+$/.test(e.difficulty)) return null;
  return {
    attack: {
      attribute: roll[1].toLowerCase(),
      ability: roll[2].toLowerCase().replace(/\s+/g, ""),
      accuracy: 0,
      isrollable: true
    },
    damage: {
      attribute: "strength", bonus: naturalDefault?.bonus ?? Number(damage[1] || 0),
      type: naturalDefault?.type ?? damage[2].toLowerCase(), isrollable: true
    },
    difficulty: Number(e.difficulty),
    isnatural: !["Pistol Whip"].includes(e.name),
    isweapon: true,
    isequipped: false
  };
}
function formatDamage(e) {
  if (e.weaponKind === "reference") return "Component-dependent / see rules";
  const d = e.damageType === "B" ? "Bashing" : e.damageType === "L" ? "Lethal" : "Aggravated";
  if (e.weaponKind === "ranged") return e.damageDice ? `${e.damageDice} dice / ${d}` : "Special / see notes";
  const term = e.damageBase === "strength" ? "Strength" : "Fixed";
  if (e.damageBase === "fixed") return `${e.damageBonus} dice / ${d}`;
  return `${term}${e.damageBonus ? ` + ${e.damageBonus}` : ""} / ${d}`;
}
function weaponRulesText(e) {
  const row = (k, v) => `<tr><th style="width:125px;text-align:left;vertical-align:top">${html(k)}</th><td>${html(v)}</td></tr>`;
  const fields = [row("Damage", formatDamage(e))];
  if (e.difficulty != null) fields.push(row("Attack difficulty", e.difficulty));
  if (e.weaponKind === "ranged" || e.weaponKind === "reference") {
    if (e.range != null) fields.push(row("Range", `${e.range}${e.name === "Rocket Launcher" ? "+" : ""} yards`));
    if (e.rate != null) fields.push(row("Rate", e.rate));
    if (e.clip != null) fields.push(row("Clip", e.clip));
  }
  fields.push(row("Concealment", `${e.conceal || ""} — ${e.concealDescription || "see item notes"}`));
  const notes = (e.notes || []).map(n => `<li>${html(n)}</li>`).join("");
  const warning = e.weaponKind === "reference" || (e.weaponKind === "ranged" && e.damageDice === 0)
    ? `<p><strong>Reference only:</strong> This entry has no automated damage roll because the table specifies unusual or incomplete damage mechanics.</p>` : "";
  return `<section class="m20-weapon-reference"><table><tbody>${fields.join("")}</tbody></table>`+
    (e.weaponKind === "thrown" ? `<p>Thrown-weapon attack pool: Dexterity + Athletics (table-use default; the PDF gives difficulty and damage, not the Ability).</p>` : "")+
    (e.weaponKind === "ranged" ? `<p>Uses the WoD20 default attack difficulty 6; range modifiers are described in the Ranged Weapons reference entry.</p>` : "")+
    (notes ? `<h3>Special Rules</h3><ul>${notes}</ul>` : "") + warning +
    `<p><small>${html(e.source)}. Table mechanics transcribed for play reference.</small></p></section>`;
}
function weaponItemData(e) {
  const ranged = e.weaponKind === "ranged";
  if (e.weaponKind === "reference" || (ranged && !e.damageDice)) return null;
  const type = ranged || e.weaponKind === "thrown" ? "Ranged Weapon" : "Melee Weapon";
  const melee = type === "Melee Weapon";
  const rangedModes = ranged && e.sourceNotes?.includes("1");
  const notes = e.sourceNotes || [];
  const maximum = ranged ? String(e.clip).split("+").reduce((sum,n) => sum + Number(n || 0),0) : 0;
  return {
    type,
    system: {
      attack: {attribute:"dexterity", ability:melee ? "melee" : (e.weaponKind === "thrown" ? "athletics" : e.ability), accuracy:0, isrollable:true},
      damage: {attribute: ranged ? "" : (e.damageBase === "strength" ? "strength" : ""),
        bonus: ranged ? e.damageDice : e.damageBonus,
        type: e.damageType === "B" ? "bashing" : e.damageType === "L" ? "lethal" : "aggravated", isrollable:true},
      difficulty: melee || e.weaponKind === "thrown" ? e.difficulty : 6,
      conceal: e.conceal === "varies" ? "" : e.conceal,
      piercing: melee && notes.includes("3") ? 3 : 0,
      minstrength: melee && notes.includes("1") ? 3 : 0,
      istwohanded: melee && (notes.includes("1") || notes.includes("2")),
      isequipped:false, isweapon:true, isnatural:false,
      ...(type === "Ranged Weapon" ? {range:e.range ?? 0,rate:e.rate ?? 0,clip:{value:maximum,max:maximum},
        mode:{hasreload:ranged,hasburst:Boolean(rangedModes),hasfullauto:Boolean(rangedModes),hasspray:Boolean(rangedModes)}} : {})
    }
  };
}
function iconFor(e) {
  const name = iconMap?.[e.key];
  if (!name) throw new Error(`No managed icon mapping for ${e.key}`);
  return `${ICON_DIR}/${name}.svg`;
}
function canReplaceIcon(item) {
  const current = String(item.img || "");
  const previous = item.getFlag?.(MOD, "iconPath");
  // Never replace someone's custom artwork, including custom artwork on an imported world Item.
  return !current || DEFAULT_ICONS.has(current) || current.startsWith(`${ICON_DIR}/`) || (previous && current === previous);
}
// Guard against modified names, misplaced documents, and the common case where a
// GM used Foundry Import All and lost the source module flags. For unflagged docs
// an exact Item name, native type, category folder and library root are mandatory.
function worldFolderChain(item) {
  const chain = [];
  const seen = new Set();
  let folder = item.folder;
  for (let depth = 0; folder && depth < 12; depth++) {
    if (typeof folder === "string") folder = game.folders?.get?.(folder);
    if (!folder || !folder.name || seen.has(folder.id || folder._id)) break;
    seen.add(folder.id || folder._id);
    chain.push(folder.name);
    folder = folder.folder || folder.parent || null;
  }
  return chain;
}
function worldIconPreview() {
  if (!iconMap || !catalogEntries.length) return {eligible: [], custom: 0, flagged: 0, folder: 0};
  const byKey = new Map(catalogEntries.map(entry => [entry.key, entry]));
  const byNameCategory = new Map();
  for (const entry of catalogEntries) {
    const composite = `${entry.category}\0${entry.name}`;
    if (byNameCategory.has(composite)) byNameCategory.set(composite, null);
    else byNameCategory.set(composite, entry);
  }
  const eligible = [];
  let custom = 0, flagged = 0, folder = 0;
  for (const item of game.items?.contents || []) {
    const sourceKey = item.getFlag?.(MOD, "key");
    let entry = byKey.get(sourceKey);
    let method = "flag";
    if (!entry) {
      const path = worldFolderChain(item);
      if (path.length < 2 || !path.includes("WoD20 Combat Library")) continue;
      // Only the immediate first folder can act as a category proof.
      entry = byNameCategory.get(`${path[0]}\0${item.name}`);
      if (!entry || toItem(entry).type !== item.type) continue;
      method = "folder";
    }
    if (!canReplaceIcon(item)) { custom++; continue; }
    const img = iconFor(entry);
    if (item.img === img) continue;
    eligible.push({item, img, method});
    if (method === "flag") flagged++;
    else folder++;
  }
  return {eligible, custom, flagged, folder};
}
async function updateWorldIcons(preview = worldIconPreview()) {
  const changes = preview.eligible.map(({item, img}) => ({_id: item.id, img}));
  if (!changes.length) return 0;
  // Make restoration of these icon-only world edits possible without changing
  // the IDs, folders, flags, mechanics, or actor-owned copies.
  const rawHistory = game.settings.get(MOD, "worldIconBackups") || "";
  let history = [];
  try { history = rawHistory ? (JSON.parse(rawHistory) || []) : []; }
  catch (_) { throw new Error("World icon backup data is invalid. No World Items changed."); }
  if (!Array.isArray(history)) throw new Error("World icon backup data is invalid. No World Items changed.");
  history.push({version:VERSION, date:new Date().toISOString(), items:preview.eligible.map(({item,method}) => ({
    id:item.id, name:item.name, previousImage:item.img, method
  }))});
  await game.settings.set(MOD, "worldIconBackups", JSON.stringify(history.slice(-5)));
  let updated = 0;
  for (let i = 0; i < changes.length; i += CHUNK) {
    const result = await CONFIG.Item.documentClass.updateDocuments(changes.slice(i,i+CHUNK));
    updated += result.length;
  }
  return updated;
}
function toItem(e, folder = null) {
  const isGear = Boolean(e.weaponKind);
  const schema = isGear ? weaponItemData(e) : null;
  const combat = !isGear ? weaponData(e) : null;
  const itemType = schema?.type || (combat ? "Melee Weapon" : "Feature");
  const sourceDetails = isGear ? weaponRulesText(e) : rulesText(e);
  return {
    name:e.name,type:itemType,folder,
    img: iconFor(e),
    ownership: ownership(),
    system: {
      description:sourceDetails, reference:e.source,
      settings:{iscreated:true,isvisible:true,isremovable:true},
      ...(schema?.system || combat || {type:"",placement:"feature",value:0,max:0})
    },
    flags:{[MOD]:{
      key:e.key,version:VERSION,iconPath:iconFor(e),category:e.category,originalType:e.itemType||e.weaponKind||"Feature",
      ...(isGear ? {sourcePage:e.sourcePage,conceal:e.conceal,damageNotation:formatDamage(e),clipNotation:e.clip||null} :
       {roll:e.roll,difficulty:e.difficulty,damage:e.damage,actions:e.actions,prerequisites:e.prerequisites,optional:Boolean(e.optional)})
    }}
  };
}
async function ensureFolders(collection) {
  const folders = new Map();
  const existing = collection.folders?.contents || [];
  for (const category of GROUPS) {
    let folder = existing.find(f => f.name === category && f.type === "Item");
    if (!folder) {
      // Folder organization is optional; the pack remains searchable without it.
      try {
        folder = await CONFIG.Folder.documentClass.create({
          name: category, type: "Item", sorting: "a", folder: null
        }, {pack: collection.collection});
      } catch (error) {
        console.warn(`${MOD} | Could not create category folder ${category}`, error);
      }
    }
    if (folder) folders.set(category, folder.id);
  }
  return folders;
}
async function install({force = false} = {}) {
  if (!game.user.isGM) { report("A GM must install the combat compendium.", "warn"); return; }
  if (inProgress) { report("Installation is already running.", "warn"); return; }
  if (game.system.id !== "worldofdarkness") {
    report("This module requires the World of Darkness 20th system.", "error"); return;
  }
  inProgress = true;
  try {
    const catalog = await loadCatalog();
    const collection = await getOrCreatePack();
    const before = [...await collection.getDocuments()];
    // Never expose unrelated private content by applying Player OBSERVER to an occupied pack.
    if (before.some(item => !item.getFlag(MOD, "key"))) {
      throw new Error("The target pack contains Items not managed by this module. Move them to another pack; nothing was overwritten.");
    }
    await setAccess(collection);
    const previouslyLocked = collection.locked;
    if (collection.locked) await collection.configure({locked: false});
    let added = 0, updated = 0;
    try {
      const groups = await ensureFolders(collection);
      const byKey = new Map(before.map(item => [item.getFlag(MOD, "key"), item]));
      const create = [], change = [], retype = [];
      for (const entry of catalog.entries) {
        const desired = toItem(entry, groups.get(entry.category) || null);
        const old = byKey.get(entry.key);
        if (old) {
          if (old.type !== desired.type) {
            retype.push({old, desired});
          } else if (force || old.getFlag(MOD, "version") !== VERSION) {
            if (["0.2.1", "0.2.2", "0.2.3"].includes(old.getFlag(MOD, "version"))) {
              // Icon-only upgrade. Do not overwrite previously customized stats,
              // descriptions, names, folders, or ownership on version 0.2.1 Items.
              change.push({
                _id: old.id,
                ...(canReplaceIcon(old) ? {img: desired.img} : {}),
                [`flags.${MOD}.version`]: VERSION,
                [`flags.${MOD}.iconPath`]: desired.img
              });
            } else {
              // Older versions also require the 0.2.1 native weapon schema fixes.
              change.push({
                _id: old.id, name: desired.name, folder: desired.folder,
                ...(canReplaceIcon(old) ? {img: desired.img} : {}),
                system: desired.system, ownership: desired.ownership,
                [`flags.${MOD}`]: desired.flags[MOD]
              });
            }
          }
        } else {
          create.push(desired);
        }
      }
      const ItemClass = CONFIG.Item.documentClass;
      for (let index = 0; index < create.length; index += CHUNK) {
        const created = await ItemClass.createDocuments(create.slice(index,index+CHUNK), {
          pack: collection.collection
        });
        added += created.length;
      }
      for (let index = 0; index < change.length; index += CHUNK) {
        const result = await ItemClass.updateDocuments(change.slice(index,index+CHUNK), {
          pack: collection.collection
        });
        updated += result.length;
      }
      if (retype.length) {
        // A WoD20 Item's type is its DataModel subtype. Updating `system` without
        // replacing an old Feature leaves it in the wrong character-sheet section.
        // Snapshot generated originals before changing these particular managed docs.
        const originals = retype.map(({old}) => old.toObject());
        await game.settings.set(MOD, "typeMigrationBackup", JSON.stringify({
          fromVersion: originals.map(d => d.flags?.[MOD]?.version),
          toVersion: VERSION, date: new Date().toISOString(), items: originals
        }));
        for (const {old, desired} of retype) {
          const previous = old.toObject();
          const replacement = {
            ...previous, ...desired, _id: old.id,
            flags: {...(previous.flags || {}), ...desired.flags}
          };
          await ItemClass.deleteDocuments([old.id], {pack: collection.collection});
          try {
            const made = await ItemClass.createDocuments([replacement], {
              pack: collection.collection, keepId: true
            });
            if (made.length !== 1 || made[0].id !== old.id || made[0].type !== desired.type) {
              throw new Error(`Cannot verify type upgrade for ${old.name}`);
            }
            updated++;
          } catch (error) {
            // Best effort: restore the original generated document and its UUID.
            try {
              const present = (await collection.getDocuments()).some(i => i.id === old.id);
              if (present) await ItemClass.deleteDocuments([old.id], {pack: collection.collection});
              await ItemClass.createDocuments([previous], {pack: collection.collection, keepId: true});
            } catch (restoreError) {
              console.error(`${MOD} | Could not restore ${old.name}; use typeMigrationBackup`, restoreError);
            }
            throw error;
          }
        }
      }
    } finally {
      // Newly created libraries should always be locked when installation finishes.
      // Existing packs retain their locked/unlocked preference.
      if (previouslyLocked || before.length === 0) await collection.configure({locked: true});
    }
    await setAccess(collection);
    const final = await collection.getDocuments();
    const actual = new Map(final.map(item => [item.getFlag(MOD, "key"), item]));
    if (actual.size !== catalog.entries.length) throw new Error(`Count mismatch: found ${actual.size} of ${catalog.entries.length} catalog Items.`);
    for (const entry of catalog.entries) {
      const item = actual.get(entry.key);
      if (!item || item.ownership?.default !== VIEW) {
        throw new Error(`Item ${entry.name} is missing or has incorrect player access.`);
      }
      for (const user of game.users || []) {
        const expected = (user.isGM || user.role >= 3) ? OWN : VIEW;
        if (item.ownership[user.id] !== expected) throw new Error(`Item ${entry.name} is inaccessible to user ${user.id}.`);
      }
    }
    // World Items in the user's Items directory are independent from the source
    // compendium. Update only their icons after a successful pack upgrade.
    // This is a GM-confirmed, repeat-safe and non-destructive icon-only operation.
    const worldIconsUpdated = await updateWorldIcons();
    await game.settings.set(MOD, "installedVersion", VERSION);
    report(`Ready: ${catalog.entries.length} combat entries (${added} created, ${updated} compendium updated; ${worldIconsUpdated} World Item icons refreshed).`);
    return {count: catalog.entries.length, added, updated, worldIconsUpdated, collection};
  } catch (error) {
    console.error(`${MOD} | Installation failed`, error);
    report(`Installation failed: ${error.message}`, "error");
    throw error;
  } finally {
    inProgress = false;
  }
}
async function promptInstall(force = false) {
  if (!game.user?.isGM) return;
  const existing = Boolean(pack());
  // Count only existing, flagged, default-image World Items; not actor inventory.
  // Icon map is loaded for the prompt without altering the world.
  try { await loadCatalog(); }
  catch (err) { console.error(`${MOD} | Catalog validation failed`, err); report(`Catalog validation failed: ${err.message}`, "error"); return; }
  const worldPreview = worldIconPreview();
  const matchingWorldItems = worldPreview.eligible.length;
  const yes = await foundry.applications.api.DialogV2.confirm({
    window: {title: existing ? "Update WoD20 Combat Library" : "Create WoD20 Combat Library"},
    content: `<p>${existing ? "Update" : "Create"} a separate <strong>WoD20 Combat Library</strong> Item compendium?</p>` +
      `<p>Includes 142 weapon, maneuver and reference entries from the supplied M20 PDFs. `+
      `Player/Trusted: <strong>Observer (view and copy)</strong>. Assistant GM/GM: <strong>Owner</strong>. `+
      `The pack will be locked against accidental edits on first install.</p>`+
      `<p>Only Items previously generated by this module will be updated. Actor items, unrelated packs, `+
      `and the Charamancer starter-content folder are not changed.</p>`+
      `<p><strong>v0.2.3 Game-Icons.net artwork:</strong> 142 entries use recognizable illustrated icons. `+
      `${matchingWorldItems} World Items can receive an icon-only refresh `+
      `(${worldPreview.flagged} source-flag matches; ${worldPreview.folder} exact Combat Library folder/name/type matches). `+
      `${worldPreview.custom} recognized World Items have custom artwork and will be skipped. `+
      `A backup of previous World Item icons is stored before changes. `+
      `Actor inventory, Item mechanics, IDs, folders and unrelated Items are not modified.</p>`+
      `<p><strong>Earlier v0.2.1 fix retained:</strong> Converts Punch, Kick, Bite, and Claw from reference-only Features `+
      `to native melee weapons when upgrading from older versions. Existing managed compendium entries keep their IDs, `+
      `and their previous records are backed up to a world setting. Back up your world before updating.</p>`,
    yes: {label: existing ? "Update Library" : "Create Library"},
    no: {label: "Not Now"}, rejectClose: false
  });
  if (yes) return install({force});
}
Hooks.once("init", () => {
  game.settings.register(MOD,"typeMigrationBackup",{
    name:"Combat Library Type Migration Backup",scope:"world",config:false,type:String,default:""
  });
  game.settings.register(MOD,"worldIconBackups",{
    name:"Combat World Item Icon Backups",scope:"world",config:false,type:String,default:""
  });
  game.settings.register(MOD,"installedVersion",{
    name:"Combat Library Version",scope:"world",config:false,type:String,default:""
  });
  const installed = game.modules.get(MOD);
  if (installed) installed.api = {install:()=>promptInstall(true), getPack:pack, previewWorldIcons:worldIconPreview, version:VERSION};
});
Hooks.once("ready", async () => {
  if (!game.user.isGM || game.system.id !== "worldofdarkness") return;
  if (!pack() || game.settings.get(MOD,"installedVersion") !== VERSION) {
    try { await promptInstall(false); }
    catch(error) {console.error(`${MOD} | Setup prompt failed`,error);}
  }
});
// Export only pure helpers for deterministic source-validation tests.
export const CombatLibraryData = {weaponData, toItem, rulesText, ownership, iconFor, canReplaceIcon, worldFolderChain, worldIconPreview};
