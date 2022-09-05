const {readdirSync, cp} = require('fs');
const { join } = require("path");
const cardsPath = join(__dirname,"./classes/cards");

let zoneCardMap = new Map();
let boardCardMap = new Map();
let statMap = new Map();
for (const cmd of readdirSync(cardsPath).filter(cmd => cmd.endsWith(".js"))){
    const prop = require(`${cardsPath}/${cmd}`);
    zoneCardMap.set(prop.stats.name, prop.Zone_Card);
    boardCardMap.set(prop.stats.name, prop.Board_Card);
    statMap.set(prop.stats.name, prop.stats)
}

module.exports.zoneCardMap = zoneCardMap;
module.exports.boardCardMap = boardCardMap;

const default_War_Deep = [
'Factory Gate',
'Factory Gate',
'Factory Gate',
'Undefined',
'Undefined',
'Undefined',
'Trench-Pit',
'Trench-Pit',
'Trench-Pit',
'Friendly Bombardier',
'Friendly Bombardier',
'Friendly Bombardier',
'Vestige',
'Vestige',
'Vestige',
'Industrial Progress',
'Industrial Progress',
'Industrial Progress',
'Untreasured',
'Untreasured',
'Untreasured',
'Kindlecalling',
'Kindlecalling',
'Kindlecalling',
'Carrion Searcher',
'Carrion Searcher',
'Carrion Searcher',
'Cycles of Guilt',
'Cycles of Guilt',
'Cycles of Guilt',
'Loosened Binds',
'Loosened Binds',
'Loosened Binds',
'Discard Rhyme',
'Discard Rhyme',
'Discard Rhyme',
'Villen',
'Villen',
'Villen',
'Murkguard',
'Murkguard',
'Murkguard',
'Ichthyic Sentinel',
'Ichthyic Sentinel',
'Ichthyic Sentinel',
]