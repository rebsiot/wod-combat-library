"""Build self-contained high-contrast Combat Library SVG pictograms.
Original SVG art is bundled to avoid external URL, font, or module dependencies.
"""
from pathlib import Path
from collections import Counter
import json

ROOT=Path(__file__).parent
OUT=ROOT/'assets'/'icons'
OUT.mkdir(parents=True,exist_ok=True)
# Shape coordinates use Lucide-like 24x24 line icons, with original icon compositions.
PATHS={
'fist': '<path d="M5 12V9.3a1.7 1.7 0 0 1 3.4 0V11 7.5a1.5 1.5 0 1 1 3 0V11 6.9a1.5 1.5 0 0 1 3 0V11 8a1.4 1.4 0 0 1 2.8 0v3.1l1-1.1a1.6 1.6 0 0 1 2.4 2.1L16.7 19H9.2C6.5 19 5 16.4 5 14Z"/><path d="M8.4 11H17"/>',
'claw':'<path d="M6 21c2-5 2.1-8.5 1.4-13.5L5 3l-.5 9.5L2 16"/><path d="M12 21c1.7-5 2-9.4 1-14L11 2l-.4 9.6L9 16"/><path d="M18 21c2-4 3-8.5 2.5-12.5L19 4l-1 9-2 4"/>',
'bite':'<path d="M3 8c3-3 5-3 9-2s7 0 9-2v6c-5 3-13 3-18 0Z"/><path d="m6 11 2 5 2-4m4 0 2 4 2-5"/><path d="M3 19c4-3 14-3 18 0"/>',
'kick':'<path d="M8 3v6l4 3 5.5-.4 2 2.4-2.7 2.7-6.2-.6L7 14l-3 7"/><circle cx="8" cy="4" r="1"/>',
'head':'<path d="M8 21v-3c-3-.9-4.5-3.3-4.5-6.7C3.5 6 7 3 12 3s8 3.4 8 8c0 3-1.8 5.7-4 7v3"/><path d="M6 13h4l2-3 2 3h4"/>',
'eye':'<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
'eye-off':'<path d="M4 5 20 19M2 12s4-6 10-6 10 6 10 6c-1 2-2.5 3.4-4 4.4M7 17.3C4 15.8 2 12 2 12"/><path d="M10 9c-2 2.2 0 5.4 3.1 5.8"/>',
'burst':'<path d="m12 2 2.1 6.3L21 6l-3.1 6L22 17l-7-.5L12 22l-3-5.5-7 .5 4.1-5L3 6l6.9 2.3Z"/><path d="M8 12h8"/>',
'shield':'<path d="M12 2 20 5v6c0 5-3 8-8 11-5-3-8-6-8-11V5Z"/><path d="M8 12h8m-4-4v8"/>',
'grapple':'<path d="M3 8 8 4l5 4-3 3-3-2-2 2 6 7 2-2 3 3-4 3-9-10Z"/><path d="m21 8-5-4-5 4 3 3 3-2 2 2-6 7-2-2-3 3 4 3 9-10Z" opacity=".8"/>',
'disarm':'<path d="M3 3 21 21M6 5l6 7m-5 6 11-11m-2-3 4 4M5 19l-2 2"/><path d="m9 15-3 3 3 3 3-3"/>',
'footsteps':'<ellipse cx="8" cy="7" rx="3" ry="4" transform="rotate(-25 8 7)"/><ellipse cx="17" cy="17" rx="3" ry="4" transform="rotate(-25 17 17)"/><path d="m3 14 3 2m12-9 3 2"/>',
'counter':'<path d="M5 6h13l-4-4m4 4-4 4M19 18H6l4-4m-4 4 4 4"/><path d="M9 11h6v2H9Z"/>',
'spiral':'<path d="M12 3c-6 0-9 4-9 9s4 9 9 9 9-4 9-9-4-6-8-6-7 2-7 6 2 6 6 6 5-2 5-5-2-4-4-4-3 1-3 3 1 2 2 2"/>',
'bolt':'<path d="m13 2-8 11h6l-1 9 9-12h-6Z"/>',
'sound':'<path d="M3 9v6h4l5 4V5L7 9Z"/><path d="M16 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14"/>',
'palm':'<path d="M6 21V12c0-2 2-2 3 0V7a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-5a1.4 1.4 0 0 1 2.8 0v6l1-2a1.5 1.5 0 0 1 2.6 1.4L18 21Z"/>',
'lotus':'<path d="M12 20c-6 0-10-4-10-8 4 0 7 2 10 8 3-6 6-8 10-8 0 4-4 8-10 8Z"/><path d="M12 20c-5-4-6-9-3-16 3 2 3 5 3 7 0-2 0-5 3-7 3 7 2 12-3 16ZM3 22h18"/>',
'book':'<path d="M12 7c-3-2-7-3-10-2v14c4-1 8 0 10 2 3-2 7-3 10-2V5c-3-1-7 0-10 2ZM12 7v14"/><path d="M5 9h4m6 0h4M5 13h4m6 0h4"/>',
'scroll':'<path d="M6 4h13a3 3 0 0 1 3 3v1h-6V7H6a2 2 0 0 0-2 2v10a3 3 0 0 0 3 3h11"/><path d="M7 22c1-1 1-4 0-5h12v3a2 2 0 0 1-2 2ZM8 10h9M8 13h7"/>',
'meditate':'<circle cx="12" cy="5" r="2"/><path d="m12 8-3 5 3 2 3-2-3-5ZM2 21l6-3 4 2 4-2 6 3M6 16 3 18m15-2 3 2"/>',
'mask':'<path d="M4 4c4-2 12-2 16 0v9c0 5-4 8-8 9-4-1-8-4-8-9Z"/><path d="M7 11h3m4 0h3m-8 5c2 1 4 1 6 0"/>',
'crossed':'<path d="m3 3 18 18M21 3 3 21"/><path d="m8 4-4 4m12-4 4 4M3 15l6 6m12-6-6 6"/>',
'axe':'<path d="m6 20 11-16"/><path d="M17 3c-4 0-8 2-10 6l5 4c3-1 6-3 9-7Z"/><path d="M4 21 7 17"/>',
'sword':'<path d="M14 2h8v8L11 21l-4-4Z"/><path d="m11 13-5 5m-2-2 4 4M2 22l3-3"/>',
'dagger':'<path d="M12 2 8 13l3 3 5-3ZM11 16l-5 5m1-8 7 7"/>',
'club':'<path d="M16 2c-3 0-5 3-6 6L4 20l3 2 8-11c3-2 5-5 4-7Z"/><path d="m5 17 5 3"/>',
'staff':'<path d="m4 21 16-18m-19 9 4 3m14-6 4 3"/>',
'chain':'<ellipse cx="7" cy="7" rx="4" ry="6" transform="rotate(45 7 7)"/><ellipse cx="17" cy="17" rx="4" ry="6" transform="rotate(45 17 17)"/><path d="M9 14l6-5"/>',
'fan':'<path d="M12 21C3 16 2 11 3 6c3 0 6 2 9 6 3-4 6-6 9-6 1 5 0 10-9 15Z"/><path d="M12 21 5 7m7 14L12 6m0 15 7-14"/>',
'saw':'<path d="M4 8V4h16v4l-2 2 2 2-2 2 2 2-2 2H4V8Z"/><path d="M7 18v4m10-4v4M8 8h8"/>',
'bottle':'<path d="M9 3h6v3l-1 2 5 9-3 4H8l-3-4 5-9-1-2Z"/><path d="m8 14 3-3 2 3 3-2"/>',
'gun':'<path d="M3 10h18v5h-4l-2 3h-4l-1-3H7l-2 5H2l3-7H3Z"/><path d="M16 10V7h4v3"/>',
'rifle':'<path d="M2 9h19v3H9l-3 7H3l3-7H2ZM12 12l4 6h3l-4-6M18 7h2v2"/>',
'shotgun':'<path d="M2 9h20v2H8l-2 8H3l3-8H2ZM6 13h8l-2 3H7"/>',
'crossbow':'<path d="M3 5c4 1 6 5 9 8 3-3 5-7 9-8M3 19c4-1 6-5 9-8 3 3 5 7 9 8"/><path d="M12 2v20M9 10l3-3 3 3"/>',
'bow':'<path d="M6 3c10 4 10 14 0 18L11 12Z"/><path d="M4 12h17m-4-3 4 3-4 3"/>',
'circuit':'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/><circle cx="12" cy="12" r="3"/>',
'laser':'<path d="M3 12h7m3 0h8m-9-9v7m0 4v7m-7-15 5 5m4 4 5 5m0-14-5 5m-4 4-5 5"/><circle cx="12" cy="12" r="2"/>',
'stunner':'<rect x="8" y="2" width="9" height="19" rx="2"/><path d="m12 6-2 5h3l-1 5 3-6h-3Z"/>',
'cloud':'<path d="M7 19a4 4 0 0 1-1-7 6 6 0 0 1 11-4 5 5 0 0 1 1 10H7Z"/><path d="M5 21h14m-8-6 2 2"/>',
'grenade':'<path d="M9 4h6v4a7 7 0 1 1-6 0ZM9 4V2h7l2 2"/><path d="M12 12v6m-3-3h6"/>',
'heavygun':'<rect x="3" y="8" width="14" height="7" rx="1"/><path d="M17 9h5m-5 3h5m-18 3 4 6h3l-3-6m1-7V5h5v3"/>',
'cannon':'<path d="M4 6h17v7H4ZM6 13l-2 7h15l-2-7M4 9H2"/><circle cx="10" cy="17" r="1"/><path d="M21 8h2"/>',
'launcher':'<path d="M3 8h15l4 4-4 4H3Z"/><path d="M7 16 5 21h4l4-5m4-9V5"/>',
'flame':'<path d="M12 22c-5 0-8-3-8-8 0-4 2-7 6-11 0 5 3 5 3 9 2-2 3-4 3-6 4 4 4 7 4 9 0 5-3 7-8 7Z"/><path d="M12 22c-3 0-4-2-4-4 0-2 1-4 3-6 0 3 3 3 3 6 0 2-1 4-2 4Z"/>',
'shuriken':'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><circle cx="12" cy="12" r="2"/>',
'spear':'<path d="m3 21 15-15m-2-4 6 0-2 6-4 2-2-4Z"/>',
'stone':'<path d="M5 18 3 11l6-8h7l5 6-2 10-10 2Z"/><path d="m3 11 6 2 7-10m-7 10 0 8m0-8 10 6"/>',
'whip':'<path d="M5 21c6-3 5-8 2-10S4 2 9 2c4 0 4 5 1 7s-2 6 3 6 6-5 9-5"/><path d="M3 21h5"/>',
'flower':'<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="6" rx="3" ry="4"/><ellipse cx="18" cy="12" rx="4" ry="3"/><ellipse cx="12" cy="18" rx="3" ry="4"/><ellipse cx="6" cy="12" rx="4" ry="3"/>',
'armor':'<path d="M5 3h5l2 4 2-4h5l2 4-3 4v10H6V11L3 7Z"/><path d="M12 7v14m-6-7h12"/>',
'broken':'<path d="M3 3 21 21M9 4l5 5 3-6m-7 12-4 6m9-6 6 1-4 5"/>',
'wind':'<path d="M3 8h12a3 3 0 1 0-3-3M2 13h19a3 3 0 1 1-3 3M4 18h9a2 2 0 1 1-2 2"/>',
}

THEMES={
'natural': ('#7c371e','#1d1015','#f6af65'),
'strike':  ('#7e213c','#200e1d','#ffa3aa'),
'grapple': ('#49458c','#12142c','#bfbbff'),
'defense': ('#1b617d','#101e34','#97eaff'),
'skill':   ('#514c8b','#14152b','#b9bbf8'),
'do':      ('#673887','#20122d','#f1b5ff'),
'arcane':  ('#5d3774','#221129','#f1bbff'),
'reference':('#5b5a38','#1e211a','#f5e29c'),
'blade':   ('#385b83','#101d30','#c7e6ff'),
'blunt':   ('#634c3d','#231914','#f1cda1'),
'flexible':('#345b60','#0f2226','#9bdfd5'),
'firearm': ('#364f6f','#121a30','#bcdbff'),
'science': ('#145e69','#0c202b','#99f8ef'),
'bow':     ('#445d38','#162319','#d6f7a3'),
'military':('#6c4030','#221815','#ffbb95'),
'explosive':('#7b412c','#2a1713','#ffd28a'),
'thrown':  ('#526852','#1c251a','#d9f8aa'),
}
# Icon file names map to an (icon shape, theme) pair.
ICON_DESIGNS={
    'natural-fist':('fist','natural'), 'natural-bite':('bite','natural'), 'natural-claw':('claw','natural'), 'natural-kick':('kick','natural'),
    'strike-fist':('fist','strike'),'strike-kick':('kick','strike'),'strike-head':('head','strike'),'strike-burst':('burst','strike'),
    'strike-palm':('palm','strike'),'strike-boot':('kick','strike'),
    'grapple-hold':('grapple','grapple'),'grapple-throw':('spiral','grapple'),'grapple-disarm':('disarm','grapple'),
    'defense-shield':('shield','defense'),'defense-counter':('counter','defense'),'defense-eye':('eye','defense'), 'defense-blind':('eye-off','defense'),
    'skill-steps':('footsteps','skill'),'skill-body':('burst','skill'), 'skill-meditate':('meditate','skill'),
    'do-whirl':('spiral','do'),'do-palm':('palm','do'),'do-lotus':('lotus','do'), 'do-sound':('sound','do'),
    'do-shield':('shield','do'),'do-wind':('wind','do'), 'do-weapon':('crossed','do'), 'do-flower':('flower','do'),
    'arcane-bolt':('bolt','arcane'),'arcane-shield':('shield','arcane'),'arcane-eye':('eye','arcane'),
    'reference-book':('book','reference'),'reference-scroll':('scroll','reference'),'reference-meditate':('meditate','reference'),
    'axe':('axe','blade'),'sword':('sword','blade'),'dagger':('dagger','blade'),'sai':('crossed','blade'),
    'blunt-club':('club','blunt'),'blunt-staff':('staff','blunt'),'blunt-chain':('chain','blunt'),'blunt-knuckles':('fist','blunt'),
    'blade-claw':('claw','blade'),'blade-fan':('fan','blade'),'blade-saw':('saw','blade'),'blunt-bottle':('bottle','blunt'),
    'flexible-chain':('chain','flexible'),'flexible-whip':('whip','flexible'),'flexible-blade':('sword','flexible'),
    'firearm-handgun':('gun','firearm'),'firearm-rifle':('rifle','firearm'),'firearm-shotgun':('shotgun','firearm'),
    'science-circuit':('circuit','science'),'science-laser':('laser','science'),'science-heavy':('heavygun','science'),
    'bow':('bow','bow'),'crossbow':('crossbow','bow'),'science-stun':('stunner','science'),'science-gas':('cloud','science'),
    'military-heavy':('heavygun','military'),'military-cannon':('cannon','military'),
    'explosive-grenade':('grenade','explosive'),'explosive-launcher':('launcher','explosive'),'explosive-flame':('flame','explosive'),
    'thrown-dagger':('dagger','thrown'),'thrown-shuriken':('shuriken','thrown'),'thrown-spear':('spear','thrown'),
    'thrown-stone':('stone','thrown'),'thrown-axe':('axe','thrown'),
}

def build_svg(name, shape, theme):
    top, bottom, accent = THEMES[theme]
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="{name.replace('-', ' ')}">
<defs><linearGradient id="base" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bottom}"/></linearGradient><linearGradient id="border" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{accent}" stop-opacity=".65"/><stop offset="1" stop-color="{accent}" stop-opacity=".06"/></linearGradient></defs>
<rect x="2" y="2" width="124" height="124" rx="22" fill="url(#base)"/>
<circle cx="110" cy="19" r="39" fill="{accent}" opacity=".075"/>
<path d="M17 110 110 17" stroke="{accent}" stroke-opacity=".055" stroke-width="7"/>
<rect x="5" y="5" width="118" height="118" rx="19" fill="none" stroke="url(#border)" stroke-width="3"/>
<path d="M17 17h25" stroke="{accent}" stroke-width="4" opacity=".86" stroke-linecap="round"/>
<g transform="translate(23 23) scale(3.45)" stroke="#f7f9ff" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round" fill="none">{PATHS[shape]}</g>
<circle cx="107" cy="106" r="5" fill="{accent}"/>
</svg>'''
    return svg
for name,(shape,theme) in ICON_DESIGNS.items():
    (OUT/(name+'.svg')).write_text(build_svg(name,shape,theme),encoding='utf-8')
print(f"Generated {len(ICON_DESIGNS)} original SVG files; themes: {Counter(v[1] for v in ICON_DESIGNS.values())}")
