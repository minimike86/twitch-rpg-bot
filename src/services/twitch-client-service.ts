import {GameService} from './game-service';
import {getXpRequiredForLevel, rollD20} from '../util';
import {TwitchContext, TwitchTmi} from '../models/twitch';
import {Player, PlayerCurrency, PlayerVitals} from '../models/player';

const https = require('https');
const tmi = require('tmi.js');
let client: any = null;
let gameService: GameService = null;


export class TwitchClientService {
    client: any;
    gameService: GameService;

    constructor(config: any) {
        client = this.client = new tmi.client(config);
        client.on('connected', this.onConnectedHandler); // Register our event handlers (defined below)
        client.on('message', this.onMessageHandler);
        gameService = this.gameService = new GameService(client);
    }

    /**
     * onConnectedHandler (target: string, ipAddress: string, port: string): void
     * Called every time the bot connects to Twitch chat
     * @param target
     * @param ipAddress
     * @param port
     */
    onConnectedHandler (target: string, ipAddress: string, port: string): void {
        console.log(`[${new Date().toLocaleTimeString()}] info: Connected to ${ipAddress}:${port}`);
        setInterval(() => {
            gameService.addXpToViewers(target).then();
        }, 5 * 60 * 1000);
    }

    /**
     * onMessageHandler (target: string, context: TwitchContext, msg: string, self: boolean): void
     * Called every time a message comes is received and deals with any commands
     * @param target
     * @param context
     * @param msg
     * @param self
     */
    onMessageHandler (target: string, context: TwitchContext, msg: string, self: boolean): void {
        if (self) { return; } // Ignore messages from the bot
        // if (!msg.trim().startsWith('!', 0)) { return; } // Ignore non-commands

        // Remove whitespace from chat message
        const commandName = msg.trim();
        const commands: string[] = commandName.split(' ');
        handleUserContribution(target, context);

        /**
         * Command   : !xp
         * Action    : Prints the current XP total for a given player
         */
        if (commandName === '!xp') {
            const currentXp = gameService.getXp(context.username);
            client.say(target, `${context.username} has ${currentXp} xp.`);
        }

        /**
         * Command   : !addxp <username> <amount>
         * Action    : Adds the specified amount of XP to a given player
         * PERMISSION: broadcaster OR moderator
         */
        else if (commandName.startsWith('!addxp')) {
            const username: string = commands[1];
            const xp: number = parseInt(commands[2]);
            if (commands.length === 3 && (context.badges.broadcaster === '1' || context.mod)) {
                gameService.addXp(target, username, xp);
            } else {
                console.warn(`[${new Date().toLocaleTimeString()}] warn: Insufficient permission (mod) to run ${commandName} command`);
            }
        }

        /**
         * Command   : !gold
         * Action    : Prints the current Gold total for a given player
         */
        else if (commandName === '!gold') {
            const currency: PlayerCurrency = gameService.getCurrency(context.username);
            client.say(target, `${context.username} has ${currency.GOLD} gold.`);
        }

        /**
         * Command   : !addgold <username> <amount>
         * Action    : Adds the specified amount of Gold to a given player
         * PERMISSION: broadcaster OR moderator
         */
        else if (commandName.startsWith('!addgold')) {
            const username: string = commands[1];
            const gold: number = parseInt(commands[2]);
            if (commands.length === 3 && (context.badges.broadcaster === '1' || context.mod)) {
                gameService.addGold(target, username, gold);
            } else {
                console.warn(`[${new Date().toLocaleTimeString()}] warn: Insufficient permission (mod) to run ${commandName} command`);
            }
        }

        /**
         * Command   : !rmgold <amount> <username>
         * Action    : Removes the specified amount of Gold from a given player
         * PERMISSION: broadcaster OR moderator
         */
        else if (commandName.startsWith('!rmgold')) {
            const username: string = commands[1];
            const gold: number = parseInt(commands[2]);
            if (commands.length === 3 && (context.badges.broadcaster === '1' || context.mod)) {
                gameService.removeGold(target, username, gold);
            } else {
                console.warn(`[${new Date().toLocaleTimeString()}] warn: Insufficient permission (mod) to run ${commandName} command`);
            }
        }

        /**
         * Command   : !levelup <username>
         * Action    : Grants the player an instant level up
         * PERMISSION: broadcaster OR moderator
         */
        else if (commandName === '!levelup') {
            const username: string = commands[1];
            if (commands.length === 2 && (context.badges.broadcaster === '1' || context.mod)) {
                gameService.levelUp(target, username);
            } else {
                console.warn(`[${new Date().toLocaleTimeString()}] warn: Insufficient permission (mod) to run ${commandName} command`);
            }
        }

        /**
         * Command   : !nextlevel
         * Action    : Prints the amount of XP required to hit the next level up
         */
        else if (commandName === '!nextlevel') {
            const vitals: PlayerVitals = gameService.getPlayerVitals(context.username);
            const xpToLevel: number = getXpRequiredForLevel(vitals.LVL + 1);
            client.say(target, `${context.username} you need ${xpToLevel - vitals.XP} xp to reach level ${vitals.LVL + 1}.`);
        }

        /**
         * Command   : !reroll
         * Action    : Re-rolls the starting stat values for a player.
         * PERMISSION: Player has re-roll attempts available
         */
        else if (commandName === '!reroll') {
            const reRoll: number = gameService.getPlayerReRoll(context.username);
            reRoll >= 1 ? gameService.reRollPlayer(target, context)
                : client.say(target, `${context.username} your RPG character cannot be rerolled again`);
        }

        /**
         * Command   : !stats
         * Action    : Prints the players stat line.
         */
        else if (commandName === '!stats') {
            const player: Player = gameService.getPlayer(context.username);
            client.say(target, `${context.username} your RPG characters stats are: 
                         HP: ${player.vitals.HP}/${player.vitals.MAXHP} ⚠,
                         ATK: ${player.stats.ATK},
                         DEF: ${player.stats.DEF}, 
                         STA: ${player.stats.STA},
                         ACC: ${player.stats.ACC}, 
                         EVA: ${player.stats.EVA},
                         SPD: ${player.stats.SPD}`);
        }

        /**
         * Command   : !kill <username>
         * Action    : Kills a player.
         * PERMISSION: broadcaster OR moderator
         */
        else if (commandName.startsWith('!kill')) {
            const username: string = commands[1];
            if (commands.length === 2 && (context.badges.broadcaster === '1' || context.mod)) {
                gameService.killPlayer(target, username);
            } else {
                console.warn(`[${new Date().toLocaleTimeString()}] warn: Insufficient permission (mod) to run ${commandName} command`);
            }
        }

        /**
         * Command   : !revive <username>
         * Action    : Revives a player.
         * TODO: Make it so revives use a revive potion
         */
        else if (commandName.startsWith('!revive')) {
            const username: string = commands[1];
            if (commands.length === 2) {
                gameService.revivePlayer(target, username);
            }
        }

        /**
         * Command   : !adventure OR !quest
         * Action    : Starts a new adventure.
         * TODO: Adventures - Start or join adventures to earn xp and loot. Accept up to 4 people.
         *  It will randomly generate a boss for you to battle, using a turn based system it will automate the battle.
         */
        else if (commandName === '!adventure' || commandName === '!quest') {
            gameService.joinAdventure(target, context.username);
        }

        /**
         * Command   : !d20
         * Action    : Roll a d20.
         */
        else if (commandName === '!d20') {
            client.say(target, rollD20());
        }

        else {
            console.log(`[${new Date().toLocaleTimeString()}] info: Unknown command ${commandName}`);
            return;
        }

        console.log(`[${new Date().toLocaleTimeString()}] info: Executed ${commandName} command`);

    }

}

/**
 * handleUserContribution(target: string, context: TwitchContext): void
 * Handles side effects of user contributions. If a new user it creates their player character.
 * Otherwise it adds a small random amount of XP to the existing player.
 * @param target
 * @param context
 */
export function handleUserContribution(target: string, context: TwitchContext): void {
    const users: [] = gameService.getUser(context.username);
    if (users.length === 0) {
        // FIRST USER INTERACTION
        gameService.addUser(target, context);
    } else {
        // SUBSEQUENT USER INTERACTION
        gameService.addXp(target, context.username, Math.floor(Math.random() * 5) + 1);
    }
}

export function updateViewers(): Promise<TwitchTmi> {
    return new Promise(function (resolve) {
        https.get('https://tmi.twitch.tv/group/user/msec/chatters', res => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', data => {
                body += data;
            });
            res.on('end', () => {
                const twitchTmi: TwitchTmi = JSON.parse(body);
                resolve(twitchTmi);
            });
        });
    });
}