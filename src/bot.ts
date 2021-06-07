/**
 * Bot Description:
 * This is a simple RPG chat bot that your viewers can use to level up their character
 * and embark on adventures to battle bosses for XP and Loot! There is also a daily shop
 * where they can spend coins they earn from adventures.
 *
 * To add or remove this bot from your channel then type in chat !join #{channel name}
 * or !leave #{channel name}. You MUST mod or vip the bot in your channel for messages
 * to work properly.
 *
 * Commands
 * !xp - Shows current XP
 * !stats, !skills - Shows current stats/skills
 * !skillPoints - Shows remaining skill points
 * !upgrade - Upgrade a skill
 * !adventure, !quest - Joins an adventure
 * !loot, !bag - Displays your current loot bag
 * !equipped - Displays your equipment
 * !equip - Equip an item
 * !throw - Throw an item
 * !shop - Show the daily shop
 * !get, !purchase - Buy something
 * !steal - Try to steal an item
 * !outlaws - Display current outlaws
 * !kill - Try to kill an outlaw
 * !energy - Display remaining energy
 */

// TODO: Raids - Raids can take up to 8 people. This type of adventure is started by
//               choosing a level you wish to attempt, the higher the level, the more
//               chance of high tier loot!
// TODO: Rifts - Work together during a live stream to level up loot chests.
//               Rifts, rifts will open when the streamer goes live. Upon opening,
//               everyone is given a token... You can use this token to enter the rift
//               or save up the tokens to enter more than once another day... Everyone
//               works together advancing the levels to level up the loot chest. When
//               the rift closes, the loot chest will open and spoils will be distributed
//               to those who entered.
// TODO: Energy System - This is to limit how many adventures you can do.
// TODO: Loot - Collect loot and equip items for better stats.
// TODO: Daily Shop - Buy items with coins collected. Also you can try to steal a shop item.
// TODO: PvP - challenge other players to duels.

import { TwitchClientService } from "./services/twitch-client-service";

const fs = require('fs');


const config = JSON.parse(fs.readFileSync('src/config.json'));
const twitchClientService:TwitchClientService = new TwitchClientService(config);
twitchClientService.client.connect();
