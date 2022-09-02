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