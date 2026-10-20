const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..'), MOD='wod20-combat-library';
const moves=JSON.parse(fs.readFileSync(path.join(ROOT,'data/moves.json'),'utf8'));
const weapons=JSON.parse(fs.readFileSync(path.join(ROOT,'data/weapons.json'),'utf8'));
const icons=JSON.parse(fs.readFileSync(path.join(ROOT,'data/icon-map.json'),'utf8'));
assert.equal(moves.entries.length,49);assert.equal(weapons.entries.length,82);
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'module.json'),'utf8'));
assert.equal(manifest.title,'WoD20 Combat Library');assert.equal(manifest.version,'0.2.7');
assert.equal(manifest.id,MOD);
assert.equal(fs.readdirSync(path.join(ROOT,'assets/icons')).filter(x=>x.endsWith('.svg')).length,117);
const uniq=new Set([...moves.entries,...weapons.entries].map(e=>e.key));assert.equal(uniq.size,131);
assert.equal(Object.keys(icons.icons).length,142);
assert.ok(new Set(Object.values(icons.icons)).size>=90);
for(const icon of Object.values(icons.icons)){
 const svg=fs.readFileSync(path.join(ROOT,'assets/icons',icon+'.svg'),'utf8');
 assert.match(svg, /<title>/);
 assert.ok(!/<script|<foreignObject|onload=|href="https?:\/\//i.test(svg));
 if (svg.includes('<image')) {
  const match=svg.match(/href="data:image\/jpeg;base64,([A-Za-z0-9+/=]+)"/);
  assert.ok(match,icon+' portrait must contain only a local embedded PNG');
  const png=Buffer.from(match[1],'base64');assert.equal(png.subarray(0,3).toString('hex'),'ffd8ff');
 } else {assert.match(svg,/linearGradient id="bg"/);assert.match(svg,/linearGradient id="steel"/);}
}
assert.equal(icons.icons['joint-lock'],'portrait-joint-lock');
assert.equal(icons.icons['move-extra-martial-disarm'],'game-01-lorc-sword-clash');
assert.equal(icons.icons['low-blow'],'game-02-lorc-boot-kick');
assert.equal(icons.icons['head-butt'],'game-02-lorc-helmet-head-shot');
const raw=fs.readFileSync(path.join(ROOT,'scripts/main.js'),'utf8');
const source=raw.replace('export const CombatLibraryData','globalThis.CombatLibraryData');
const users=[{id:'gm',isGM:true,role:4},{id:'player',isGM:false,role:1},
 {id:'trusted',isGM:false,role:2},{id:'assistant',isGM:false,role:3}];
const states=new Map(),packs=new Map(),hooks={},modules=new Map([[MOD,{}]]),worldItems=[];let uid=0;
const folderById=new Map();
const events=[];
const copy=x=>JSON.parse(JSON.stringify(x));
function doc(data){let o=copy(data);o.id=data._id||'I'+(++uid);o.getFlag=(ns,key)=>o.flags?.[ns]?.[key];o.toObject=()=>{const d=copy(o);d._id=o.id;delete d.id;return d};return o;}
function createPack(){const p={collection:'world.'+MOD,documentName:'Item',locked:false,ownership:{},docs:[],folders:{contents:[]},
  async configure(v){if(v.ownership)this.ownership={...v.ownership};if(v.locked!==undefined)this.locked=v.locked},
  async getDocuments(){return this.docs}};packs.set(p.collection,p);return p;}
const ctx={game:{user:users[0],users,system:{id:'worldofdarkness'},packs:{get:k=>packs.get(k)},modules:{get:k=>modules.get(k)},
  settings:{register(){},async set(ns,key,v){states.set(ns+'.'+key,v)},get(ns,key){return states.get(ns+'.'+key)}},
  items:{contents:worldItems,get:id=>worldItems.find(x=>x.id===id)},folders:{get:id=>folderById.get(id)}},
 foundry:{documents:{collections:{CompendiumCollection:{async createCompendium(data){assert.equal(data.type,'Item');return createPack()}}}},
  applications:{api:{DialogV2:{async confirm(){return true}}}}},
 CONFIG:{Folder:{documentClass:{async create(d,o){let p=packs.get(o.pack),f={...d,id:'F'+(++uid)};p.folders.contents.push(f);return f}}},
  Item:{documentClass:{async createDocuments(batch,o){const p=packs.get(o.pack),docs=batch.map(doc);p.docs.push(...docs);return docs},
   async deleteDocuments(ids,o){const p=packs.get(o.pack);p.docs=p.docs.filter(d=>!ids.includes(d.id));return ids},
   async updateDocuments(batch,o){const docs=o?.pack?packs.get(o.pack).docs:worldItems;for(const b of batch){const d=docs.find(x=>x.id===b._id);assert.ok(d);for(const prop of ['name','img','folder','system','ownership'])if(Object.hasOwn(b,prop))d[prop]=b[prop];
    if(b[`flags.${MOD}`])d.flags[MOD]=b[`flags.${MOD}`];
    if(b[`flags.${MOD}.version`])d.flags[MOD].version=b[`flags.${MOD}.version`];
    if(b[`flags.${MOD}.iconPath`])d.flags[MOD].iconPath=b[`flags.${MOD}.iconPath`];
   }return batch}}}},
 Hooks:{once(k,fn){hooks[k]=fn}},
 fetch:async url=>({ok:true,json:async()=>url.endsWith('moves.json')?moves:url.endsWith('weapons.json')?weapons:icons}),
 ui:{notifications:{info:s=>events.push('INFO '+s),warn:s=>events.push('WARN '+s),error:s=>events.push('ERROR '+s)}},console};
vm.runInNewContext(source,ctx,{filename:'main.js'});
const api=()=>modules.get(MOD).api;
async function run(){hooks.init();await hooks.ready();const p=packs.get('world.'+MOD);assert.ok(p);
 assert.equal(p.docs.length,142);assert.equal(p.locked,true);
 for(let x of p.docs){assert.equal(x.ownership.default,2);for(const u of users)assert.equal(x.ownership[u.id],u.role>=3?3:2);
  assert.ok(x.system.description.includes('table') || x.system.description.includes('Difficulty'));
  assert.match(x.img,/^modules\/wod20-combat-library\/assets\/icons\/[a-z0-9-]+\.svg$/);
  assert.ok(fs.existsSync(path.join(ROOT,x.img.replace('modules/wod20-combat-library/',''))));
 }
 for(let [k,v] of Object.entries({PLAYER:'OBSERVER',TRUSTED:'OBSERVER',ASSISTANT:'OWNER',GAMEMASTER:'OWNER'}))assert.equal(p.ownership[k],v);
 const native=p.docs.filter(x=>x.type==='Melee Weapon'||x.type==='Ranged Weapon');
 const melee=p.docs.filter(x=>x.getFlag(MOD,'key')?.startsWith('weapon-melee-'));
 const ranged=p.docs.filter(x=>x.getFlag(MOD,'key')?.startsWith('weapon-ranged-'));
 const thrown=p.docs.filter(x=>x.getFlag(MOD,'key')?.startsWith('weapon-thrown-'));
 assert.equal(melee.length,42);assert.equal(ranged.length,34);assert.equal(thrown.length,6);
 assert.equal(p.docs.length,142);assert.equal(p.docs.filter(x=>x.getFlag(MOD,'key')?.startsWith('move-extra-')).length,8);
 assert.equal(p.docs.filter(x=>x.getFlag(MOD,'key')?.startsWith('weapon-reference-')).length,3);
 for(const x of [...melee,...ranged,...thrown])assert.ok(x.system.description.includes('Concealment'),x.name);
 for (const [name,bonus,type,difficulty] of [
  ['Bite',1,'bashing',5], ['Claw',1,'lethal',6], ['Punch',0,'bashing',6], ['Kick',1,'bashing',7]]) {
  const a=p.docs.find(x=>x.name===name);assert.ok(a, name);
  assert.equal(a.type,'Melee Weapon');assert.equal(a.system.isnatural,true);
  assert.equal(a.system.attack.ability,'brawl');assert.equal(a.system.damage.attribute,'strength');
  assert.equal(a.system.damage.bonus,bonus);assert.equal(a.system.damage.type,type);
  assert.equal(a.system.difficulty,difficulty);
 }
 assert.ok(p.docs.find(x=>x.name==='Bite').system.description.includes('Editable weapon default'));
 assert.ok(p.docs.find(x=>x.name==='Blinding').img.includes('blindfold.svg'));
 assert.ok(p.docs.find(x=>x.name==='Iron Shirt').img.includes('energy-shield.svg'));
 assert.ok(p.docs.find(x=>x.name==='Katana').img.includes('katana.svg'));
 assert.ok(p.docs.find(x=>x.name==='Flamethrower').img.includes('flamethrower.svg'));
 assert.equal(p.docs.find(x=>x.name==='Bolan Mk. 13 Weapons System').type,'Feature');
 assert.equal(p.docs.find(x=>x.name==='Flamethrower').type,'Feature');
 assert.equal(p.docs.find(x=>x.name==='Rocket Launcher').type,'Feature');
 assert.equal(p.docs.find(x=>x.name==='Shuriken').system.damage.bonus,3);
 assert.equal(p.docs.find(x=>x.name==='Shuriken').system.damage.attribute,'');
 assert.equal(p.docs.find(x=>x.name==='Great Axe').system.istwohanded,true);
 assert.equal(p.docs.find(x=>x.name==='Great Axe').system.minstrength,3);
 assert.equal(p.docs.find(x=>x.name==='Stiletto').system.piercing,3);
 const targetActor={items:[],async createEmbeddedDocuments(kind,batch){assert.equal(kind,'Item');for(const entry of batch)this.items.push(doc(entry));return this.items}};
 for (const name of ['Hatchet','Katana','Punch','Kick','Bite','Claw']) {
   const item=p.docs.find(x=>x.name===name);
   const embedded=await targetActor.createEmbeddedDocuments('Item',[item.toObject()]);
   assert.equal(embedded.at(-1).type,'Melee Weapon');
   assert.equal(embedded.at(-1).system.attack.isrollable,true);
   assert.equal(embedded.at(-1).system.damage.isrollable,true);
 }
 assert.equal(targetActor.items.length,6);
 const w=p.docs.find(x=>x.name==='Semi-Automatic Pistol, Light (Glock 17 9mm)');
 assert.equal(w.type,'Ranged Weapon');assert.equal(w.system.damage.bonus,4);
 assert.equal(w.system.clip.max,18);assert.equal(w.flags[MOD].clipNotation,'17+1');
 const meleeItem=p.docs.find(x=>x.name==='Katana');assert.equal(meleeItem.system.damage.bonus,3);assert.equal(meleeItem.system.damage.attribute,'strength');
 const itemCount=p.docs.length;await api().install();assert.equal(p.docs.length,itemCount);assert.equal(p.locked,true);

 // Upgrade icons from v0.2.1 without rewriting players' customized descriptions,
 // manual icons, current Item types, or IDs.
 const beforeIcons = new Map();
 for(const item of p.docs) {
   beforeIcons.set(item.id,{system:copy(item.system),type:item.type,name:item.name,folder:item.folder});
   item.flags[MOD].version='0.2.1';
   item.img= item.type==='Melee Weapon'?'icons/svg/sword.svg':item.type==='Ranged Weapon'?'icons/svg/target.svg':'icons/svg/book.svg';
 }
 const custom=p.docs.find(x=>x.name==='Sword');custom.img='custom/user-sword.webp';
 const customDesc=p.docs.find(x=>x.name==='Read an Opponent');customDesc.system.description='Storyteller custom notes';
 const worldNames=['Punch','Disarm (General)','Katana','Flamethrower','Bite'];
 for(const name of worldNames){const base=p.docs.find(x=>x.name===name),copyItem=doc({...base.toObject(),_id:'W'+(++uid)});worldItems.push(copyItem)}
 const customWorld=doc({...p.docs.find(x=>x.name==='Claw').toObject(),_id:'CustomWorld'});customWorld.img='custom/my-claw.webp';worldItems.push(customWorld);
 const unrelated=doc({name:'Hatchet',_id:'Unrelated',img:'icons/svg/book.svg',flags:{},system:{description:'User item'}});worldItems.push(unrelated);
 assert.equal(worldItems.filter(x=>x.getFlag(MOD,'key')).length,6);
 // A World Item imported without provenance flags must still update when it has
 // the exact item type/name/category inside the dedicated Combat Library root.
 const rootFolder={id:'root',name:'WoD20 Combat Library',folder:null};
 const category={id:'category',name:'08 Melee — Blades',folder:rootFolder};
 const worldNoFlag=doc({name:'Katana',type:'Melee Weapon',_id:'NoFlagWorld',folder:category,
   img:'icons/svg/sword.svg',flags:{},system:{description:'Hand-written user data',damage:{bonus:17}}});
 const worldNoFlagCustom=doc({name:'Katana',type:'Melee Weapon',_id:'NoFlagCustom',folder:category,
   img:'custom/own.webp',flags:{},system:{description:'Custom'}});
 const notLibrary=doc({name:'Katana',type:'Melee Weapon',_id:'NotLibrary',folder:{id:'other',name:'Unrelated',folder:null},
   img:'icons/svg/sword.svg',flags:{},system:{description:'Unrelated'}});
 const wrongType=doc({name:'Katana',type:'Feature',_id:'WrongType',folder:category,
   img:'icons/svg/book.svg',flags:{},system:{description:'Different document'}});
 worldItems.push(worldNoFlag,worldNoFlagCustom,notLibrary,wrongType);
 // Regression: unflagged World Item copies with native WoD20 item artwork
 // were ignored by v0.2.3 because only icons/svg placeholders were whitelisted.
 const featureFolder={id:'native-feature',name:'01 General maneuvers',folder:rootFolder};
 const nativeFeature=doc({name:'Disarm (General)',type:'Feature',_id:'NativeFeature',folder:featureFolder,
   img:'systems/worldofdarkness/assets/img/items/feature.svg',flags:{},system:{description:'Preserve me'}});
 const axeFolder={id:'native-axe',name:'07 Melee — Axes',folder:'root'};
 folderById.set('root',rootFolder);folderById.set('native-axe',axeFolder);
 const nativeMelee=doc({name:'Great Axe',type:'Melee Weapon',_id:'NativeMelee',folder:'native-axe',
   img:'systems/worldofdarkness/assets/img/items/meleeweapons.svg',flags:{},system:{damage:{bonus:9}}});
 worldItems.push(nativeFeature,nativeMelee);
 assert.deepEqual(Array.from(ctx.CombatLibraryData.worldFolderChain(nativeMelee)),['07 Melee — Axes','WoD20 Combat Library']);
 assert.equal(ctx.CombatLibraryData.canReplaceIcon(nativeFeature),true);
 assert.equal(ctx.CombatLibraryData.canReplaceIcon(nativeMelee),true);
 const preview=api().previewWorldIcons();
 assert.ok(preview.eligible.some(v=>v.item.id==='NoFlagWorld' && v.method==='folder'));
 assert.ok(preview.eligible.some(v=>v.item.id==='NativeFeature' && v.method==='folder'));
 assert.ok(preview.eligible.some(v=>v.item.id==='NativeMelee' && v.method==='folder'));
 assert.ok(!preview.eligible.some(v=>['NoFlagCustom','NotLibrary','WrongType'].includes(v.item.id)));
 const previousIDs=p.docs.map(x=>x.id);
 await api().install();
 assert.deepEqual(p.docs.map(x=>x.id),previousIDs);
 assert.equal(p.docs.find(x=>x.name==='Sword').img,'custom/user-sword.webp');
 assert.equal(p.docs.find(x=>x.name==='Read an Opponent').system.description,'Storyteller custom notes');
 for(const item of p.docs){
   assert.equal(item.flags[MOD].version,'0.2.7');
   assert.equal(item.type,beforeIcons.get(item.id).type);
   assert.equal(item.name,beforeIcons.get(item.id).name);
   assert.equal(item.folder,beforeIcons.get(item.id).folder);
 }
 for(const item of worldItems.filter(x=>worldNames.includes(x.name) && x.getFlag(MOD,'key')))assert.ok(item.img.startsWith('modules/wod20-combat-library/assets/icons/'),item.name);
 assert.equal(customWorld.img,'custom/my-claw.webp');
 assert.equal(unrelated.img,'icons/svg/book.svg');
 assert.equal(unrelated.system.description,'User item');
 assert.equal(worldItems.length,13);
 assert.ok(worldNoFlag.img.includes('katana.svg'));
 assert.ok(nativeFeature.img.includes('game-01-'));
 assert.ok(nativeMelee.img.endsWith('.svg') && nativeMelee.img.startsWith('modules/'));
 assert.equal(nativeFeature.system.description,'Preserve me');
 assert.equal(nativeMelee.system.damage.bonus,9);
 assert.equal(worldNoFlag.system.description,'Hand-written user data');
 assert.equal(worldNoFlag.system.damage.bonus,17);
 assert.equal(worldNoFlagCustom.img,'custom/own.webp');
 assert.equal(notLibrary.img,'icons/svg/sword.svg');
 assert.equal(wrongType.img,'icons/svg/book.svg');
 const worldBackups=JSON.parse(states.get(MOD+'.worldIconBackups'));
 assert.ok(worldBackups.at(-1).items.some(x=>x.id==='NoFlagWorld' && x.method==='folder'));
 const originalIcon=worldNoFlag.img;
 await api().install();
 assert.equal(worldNoFlag.img,originalIcon);
 assert.deepEqual(p.docs.map(x=>x.id),previousIDs);
 assert.equal(p.docs.find(x=>x.name==='Read an Opponent').system.description,'Storyteller custom notes');
 // When v0.2.2 is installed and v0.2.4 goes live, this is icon-only.
 const legacy=p.docs.find(x=>x.name==='Hatchet');legacy.flags[MOD].version='0.2.2';
 legacy.system.description='Locally customized weapon';legacy.img='modules/wod20-combat-library/assets/icons/axe.svg';
 const legacyID=legacy.id;
 await api().install();
 assert.equal(legacy.id,legacyID);
 assert.equal(legacy.system.description,'Locally customized weapon');
 assert.ok(legacy.img.includes('hatchet.svg'));
 // 0.2.0 created Punch, Kick, Bite and Claw as Features. Upgrading must preserve IDs,
 // create fully native weapons, and retain a world-side backup snapshot.
 const oldIds=new Map();
 for(const name of ['Bite','Claw','Punch','Kick']) {
   const old=p.docs.find(x=>x.name===name);oldIds.set(name,old.id);
   old.type='Feature';old.system={description:'0.2.0 reference',type:'',placement:'feature'};
   old.flags[MOD].version='0.2.0';
 }
 await api().install();assert.equal(p.docs.length,itemCount);
 for(const name of ['Bite','Claw','Punch','Kick']) {
   const updated=p.docs.find(x=>x.name===name);
   assert.equal(updated.id,oldIds.get(name));assert.equal(updated.type,'Melee Weapon');
   assert.equal(updated.system.isnatural,true);
 }
 const backup=JSON.parse(states.get(MOD+'.typeMigrationBackup'));
 assert.equal(backup.toVersion,'0.2.7');assert.equal(backup.items.length,4);
 assert.ok(backup.items.every(x=>x.type==='Feature'));

 // Exercise the upgrade path from 0.1.0 with existing 49 move records and an unlocked pack.
 p.docs=p.docs.filter(x=>moves.entries.some(e=>e.key===x.getFlag(MOD,'key')));
 for(const x of p.docs)x.flags[MOD].version='0.1.0';
 p.locked=false;await api().install();assert.equal(p.docs.length,142);assert.equal(p.locked,false);
 for(const x of p.docs)assert.equal(x.flags[MOD].version,'0.2.7');
 // Refuse to expose unrelated packs before setting role permissions.
 const old=copy(p.ownership);p.docs.push(doc({name:'Secret',flags:{},ownership:{default:0}}));
 let rejected=false;try{await api().install()}catch(e){rejected=true;assert.ok(e.message.includes('not managed'))}
 assert.equal(rejected,true);assert.deepEqual(p.ownership,old);
 console.log('PASS: v0.2.7 142 entries; WoD20 default Feature and weapon icon migration; ID-referenced nested folders; custom art preserved; full compendium/icon regression; actor copies unchanged; repeat-safe updates.');
}
run().catch(e=>{console.error(e);process.exit(1)});