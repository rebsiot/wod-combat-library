"""Static reproducible mapping of original content keys to bundled pictograms."""
from pathlib import Path
import json, collections
ROOT=Path(__file__).parent
entries=json.loads((ROOT/'data/moves.json').read_text())['entries']+json.loads((ROOT/'data/weapons.json').read_text())['entries']
extras={
'move-extra-bite':('Bite','01 General maneuvers'),
'move-extra-claw':('Claw','01 General maneuvers'),
'move-extra-disarm':('Disarm (General)','01 General maneuvers'),
'move-extra-rear':('Flank / Rear Attack','01 General maneuvers'),
'move-extra-grapple':('Grapple','01 General maneuvers'),
'move-extra-kick':('Kick','01 General maneuvers'),
'move-extra-punch':('Punch','01 General maneuvers'),
'move-extra-martial-disarm':('Disarm (Martial Arts)','03 Martial Arts'),
'weapon-reference-concealment':('Weapon Tables — Concealment and Damage','19 Weapon Rules and Notes'),
'weapon-reference-range':('Ranged Weapons — Range, Rate and Ammunition','19 Weapon Rules and Notes'),
'weapon-reference-reloads':('Bows, Special Ammunition and Unresolved Effects','19 Weapon Rules and Notes')}
entries += [dict(key=k,name=n,category=c) for k,(n,c) in extras.items()]
moveOverrides={
'move-extra-bite':'natural-bite','move-extra-claw':'natural-claw','move-extra-punch':'natural-fist','move-extra-kick':'natural-kick',
'move-extra-disarm':'grapple-disarm','move-extra-rear':'skill-steps','move-extra-grapple':'grapple-hold','move-extra-martial-disarm':'grapple-disarm',
'read-an-opponent':'defense-eye','sweep':'skill-steps','tackle':'skill-body','blinding':'defense-blind','body-slam':'skill-body',
'curbstomp':'strike-boot','haymaker':'strike-fist','head-butt':'strike-head','jab-pistol':'firearm-handgun','low-blow':'strike-burst','pistol-whip':'firearm-handgun',
'counter-throw':'grapple-throw','death-strike':'strike-palm','deflecting-block':'defense-shield','dragon-tail-sweep':'skill-steps',
'elbow-knee-strike':'strike-boot','flying-kick':'strike-kick','hard-strike':'strike-fist','soft-strike':'strike-palm',
'joint-lock':'grapple-hold','nerve-pressure-point-strike':'strike-palm','snake-step-hard':'skill-steps','snake-step-soft':'skill-steps',
'snap-kick':'strike-kick','spinning-kick':'strike-kick','throw-hard':'grapple-throw','throw-soft':'grapple-throw','thunder-kick':'arcane-bolt',
'vital-strike':'strike-burst','withering-grasp':'grapple-hold','arrow-cutting':'do-weapon','hurricane-throw':'do-whirl',
'iron-shirt':'do-shield','kiaijutsu-stamina':'do-sound','kiaijutsu-terror':'do-sound','kiaijutsu-eloquence':'do-sound',
'plum-flower-blossom':'do-flower','soft-fist':'do-palm','ten-thousand-weapons':'do-weapon','typhoon-kick':'do-wind','weapon-art':'do-weapon',
'thunder-punch-magick-trick':'arcane-bolt','drunken-style-optional':'skill-steps','kuei-lung-chuan-dragon-spirit-kung-fu':'do-whirl',
'the-peaceful-way-optional':'do-lotus','catching-bullets-magick-trick':'arcane-shield',
'martial-arts-learning-maneuvers':'reference-book','do-training-and-mastery':'reference-meditate','do-eight-limbs-of-expertise':'reference-scroll',
'weapon-reference-concealment':'reference-scroll','weapon-reference-range':'reference-book','weapon-reference-reloads':'reference-scroll'
}

def icon(e):
    key=e['key']; name=e['name'].lower(); cat=e['category']
    if key in moveOverrides:return moveOverrides[key]
    if cat=='07 Melee — Axes':return 'axe'
    if cat=='08 Melee — Blades':return 'dagger' if any(w in name for w in ('knife','stiletto','sai')) else 'sai' if 'hook' in name else 'sword'
    if cat=='09 Melee — Clubs':return 'blunt-staff' if 'staff' in name else 'blunt-chain' if 'nunchaku' in name else 'blunt-club'
    if cat=='10 Melee — Fist Extensions':
        return 'blunt-knuckles' if any(w in name for w in ('knuckles','sap','gauntlet')) else 'blade-claw' if any(w in name for w in ('claw','katar')) else 'blade-fan'
    if cat=='11 Melee — Improvised':return 'blade-saw' if 'chainsaw' in name else 'blunt-bottle' if 'bottle' in name else 'blunt-club'
    if cat=='12 Melee — Whips and Chains':return 'flexible-blade' if 'kusarigama' in name else 'flexible-chain' if 'chain' in name or 'gusari' in name else 'flexible-whip'
    if cat=='13 Ranged — Conventional':
        return 'firearm-shotgun' if 'shotgun' in name else 'firearm-rifle' if any(w in name for w in ('rifle','smg','mac-10','mp-5')) else 'firearm-handgun'
    if cat=='14 Ranged — Technocracy':return 'science-heavy' if 'chain-gun' in name else 'science-circuit' if any(w in name for w in ('bolan','mjollner')) else 'science-laser'
    if cat=='15 Ranged — Bows':return 'crossbow' if 'crossbow' in name else 'bow'
    if cat=='16 Ranged — Nonlethal':return 'science-stun' if 'taser' in name else 'science-gas'
    if cat=='17 Ranged — Military':
        return 'explosive-flame' if 'flame' in name else 'explosive-launcher' if 'launcher' in name else 'military-cannon' if 'cannon' in name else 'military-heavy'
    if cat=='18 Thrown Weapons':return 'thrown-dagger' if 'knife' in name else 'thrown-shuriken' if 'shuriken' in name else 'thrown-spear' if 'spear' in name else 'thrown-axe' if 'tomahawk' in name else 'thrown-stone'
    raise ValueError((key,name,cat))
icons={e['key']:icon(e) for e in entries}
assert len(icons)==len(entries)==142
for filename in set(icons.values()):
 assert (ROOT/'assets'/'icons'/f'{filename}.svg').exists(), filename
assert not (set(icons)-{e['key'] for e in entries})
(ROOT/'data/icon-map.json').write_text(json.dumps({'version':'0.2.2','icons':icons},indent=2,ensure_ascii=False)+'\n')
print(f"Mapped all {len(icons)} Items to {len(set(icons.values()))} distinct picture icons")
print(collections.Counter(icons.values()).most_common(20))
