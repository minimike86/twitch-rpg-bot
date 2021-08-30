import Timeout = NodeJS.Timeout;
import {AdventuringParty} from '../models/adventure';
import {GameDataService} from './game-data-service';
import {updateViewers} from './twitch-client-service';
import {getXpRequiredForLevel} from '../util';
import {TwitchContext} from '../models/twitch';
import {
    getDefaultPlayerEquipment,
    getDefaultPlayerStatus,
    getNewStats,
    getNewVitals,
    Player,
    PlayerCurrency, PlayerVitals
} from '../models/player';

export class GameService {
    public client: any;
    private gameDataService: GameDataService;
    public adventuringParty: AdventuringParty;
    public adventureCountdown: Timeout;
    private adventurePartyFormationTime: number = 1;
    private adventureDelayTime: number = 1;

    constructor(client: any) {
        this.client = client;
        this.gameDataService = new GameDataService();
        this.adventuringParty = {
            isActive: true,
            isForming: false,
            maxPartyMembers: 8,
            partyMembers: []
        };
    }

    /**
     * PLAYERS
     */
    addPlayer(target: string, context: TwitchContext): void {
        const stats = getNewStats();
        const vitals = getNewVitals(stats);
        const newPlayer: Player = new Player(context['user-id'], context.username, context.mod, context.subscriber,
            stats, vitals, getDefaultPlayerStatus(), getDefaultPlayerEquipment(), [], 3);
        this.gameDataService.db.get('users')
            .push(newPlayer)
            .write();
        this.gameDataService.db.update('count', n => n + 1)
            .write();
        console.info(`[${new Date().toLocaleTimeString()}] info: ${context.username} added to db`);
        this.client.say(target, `Welcome ${context.username} to the stream! Here is your RPG characters stats: 
                         HP: ${vitals.HP}/${vitals.MAXHP},
                         ATK: ${stats.ATK},
                         DEF: ${stats.DEF}, 
                         STA: ${stats.STA},
                         ACC: ${stats.ACC}, 
                         EVA: ${stats.EVA},
                         SPD: ${stats.SPD}`);
    }

    getFilteredPlayers(username: string): Player[] {
        return this.gameDataService.db.get('users')
            .filter({'username': username})
            .value();
    }

    getPlayer(username: string): Player {
        return this.gameDataService.db.get('users')
            .find({'username': username})
            .value();
    }

    getPlayerVitals(username: string): PlayerVitals {
        return this.gameDataService.db.get('users')
            .find({'username': username})
            .value().vitals;
    }

    getPlayerCurrency(username: string): PlayerCurrency {
        return this.gameDataService.db.get('users')
            .find({'username': username})
            .value().vitals.CUR;
    }

    getPlayerReRoll(username: string): number {
        return this.gameDataService.db.get('users')
            .find({'username': username})
            .value().reroll;
    }

    reRollPlayer(target: string, context: TwitchContext): void {
        const oldReroll: number = this.gameDataService.db.get('users')
            .find({ 'username': context.username })
            .value().reroll;
        if (oldReroll >= 1) {
            const stats = getNewStats();
            const vitals = getNewVitals(stats);
            this.gameDataService.db.get('users')
                .find({ 'username': context.username })
                .assign({ 'stats': stats })
                .assign({ 'vitals': vitals })
                .assign({ 'status': getDefaultPlayerStatus() })
                .assign({ 'equipment': getDefaultPlayerEquipment() })
                .assign({ 'lootBag': [] })
                .assign({ 'reroll': oldReroll - 1 })
                .write();
            console.info(`[${new Date().toLocaleTimeString()}] info: ${context.username} has been rerolled.`);
            this.client.say(target, `${context.username} your RPG characters stats have been rerolled: 
                             HP: ${vitals.HP}/${vitals.MAXHP},
                             ATK: ${stats.ATK},
                             DEF: ${stats.DEF}, 
                             STA: ${stats.STA},
                             ACC: ${stats.ACC}, 
                             EVA: ${stats.EVA},
                             SPD: ${stats.SPD}`);
        }
    }

    killPlayer(target: string, username: string): void {
        if (this.gameDataService.userExists(username)) {
            this.gameDataService.db.get('users')
                .find({ 'username': username })
                .get('vitals')
                .assign({ 'HP': 0 })
                .write();
            this.gameDataService.db.get('users')
                .find({ 'username': username })
                .get('status')
                .assign({ 'dead': true })
                .write();
            this.client.say(target, `${username} has been killed. ResidentSleeper BOP GlitchNRG`);
        } else {
            this.client.say(target, `${username} is not a valid username.`);
        }
    }

    revivePlayer(target: string, username: string, context: TwitchContext): void {
        const commandUser: Player = this.gameDataService.db.get('users')
            .find({ 'username': context.username })
            .value();
        if (this.gameDataService.userExists(username)) {
            const player: Player = this.gameDataService.db.get('users')
                .find({ 'username': username })
                .value();
            if (player.vitals.HP <= 0 && player.status.dead) {
                this.gameDataService.db.get('users')
                    .find({ 'username': username })
                    .get('vitals')
                    .assign({ 'HP': Math.floor(player.vitals.MAXHP / 2) })
                    .write();
                this.gameDataService.db.get('users')
                    .find({ 'username': username })
                    .get('status')
                    .assign({ 'dead': false })
                    .write();
                this.client.say(target, `MercyWing1 TBAngel MercyWing2 ${commandUser.username} prays to all the gods. By the grace of an unseen divine power ${username} has been revived.`);
            } else {
                this.client.say(target, `${username} is not dead.`);
            }
        } else {
            this.client.say(target, `${username} is not a valid username.`);
        }
    }

    /**
     * EXPERIENCE
     */
    getXp(username: string): number {
        return this.gameDataService.db.get('users')
            .find({'username': username})
            .value().vitals.XP;
    }

    addXp(target: string, username: string, xp: number): void {
        const player: Player = this.gameDataService.db.get('users').find({ 'username': username }).value();
        const newXp: number = player.vitals.XP + xp;
        this.gameDataService.db.get('users').find({ 'username': player.username })
            .get('vitals').assign({ 'XP': newXp })
            .write();
        // console.info(`[${new Date().toLocaleTimeString()}] info: ${username} earned ${xp} xp.`);
        // this.client.say(target, `Added ${xp} to ${username}.`);

        // CHECK FOR LEVEL UP
        if (newXp >= getXpRequiredForLevel(player.vitals.LVL + 1)) {
            this.levelUp(target, player.username);
        }

    }

    async addXpToViewers(target: string): Promise<void> {
        const twitchTmi = await updateViewers();
        const viewers = [...twitchTmi.chatters.broadcaster,
            ...twitchTmi.chatters.vips,
            ...twitchTmi.chatters.moderators,
            ...twitchTmi.chatters.staff,
            ...twitchTmi.chatters.admins,
            ...twitchTmi.chatters.global_mods,
            ...twitchTmi.chatters.viewers];
        const randomXp: number = Math.floor(Math.random() * 50) + 50;
        const randomGold: number = Math.floor(Math.random() * 50) + 50;
        viewers.filter(x => this.gameDataService.userExists(x)).forEach(viewer => {
            this.addXp(target, viewer, randomXp);
            this.addGold(target, viewer, randomGold);
        });
        console.info(`[${new Date().toLocaleTimeString()}] info: Adding ${randomXp} bonus xp, and ${randomGold} bonus gold to all current viewers (${viewers.filter(x => this.gameDataService.userExists(x))}).`);
        // client.say(target, `All viewers have been awarded ${randomXp} bonus xp.`);
    }

    levelUp(target: string, username: string): void {
        const player = this.gameDataService.db.get('users')
            .find({ 'username': username })
            .value();
        // LEVEL UP STATS
        this.gameDataService.db.get('users')
            .find({ 'username': player.username })
            .get('stats')
            .assign({ 'ATK': player.stats.ATK + Math.floor(Math.random() * 2) + 1 })
            .assign({ 'DEF': player.stats.DEF + Math.floor(Math.random() * 2) + 1 })
            .assign({ 'STA': player.stats.STA + Math.floor(Math.random() * 5) + 5 })
            .assign({ 'ACC': player.stats.ACC + Math.floor(Math.random() * 2) + 1 })
            .assign({ 'EVA': player.stats.EVA + Math.floor(Math.random() * 2) + 1 })
            .assign({ 'SPD': player.stats.SPD + Math.floor(Math.random() * 2) + 1 })
            .write();
        // LEVEL UP VITALS
        const maxHp = player.vitals.MAXHP + Math.floor(20 + (player.stats.STA / 4) + (Math.floor(Math.random() * 6) + 1));
        this.gameDataService.db.get('users')
            .find({ 'username': player.username })
            .get('vitals')
            .assign({ 'LVL': player.vitals.LVL + 1 })
            .assign({ 'MAXHP': maxHp })
            .assign({ 'HP': maxHp })
            .write();
        // ANNOUNCE
        const newPlayer = this.gameDataService.db.get('users')
            .find({ 'username': player.username })
            .value();
        console.info(`[${new Date().toLocaleTimeString()}] info: ${newPlayer.username} has reached level ${newPlayer.vitals.LVL}.`);
        this.client.say(target, `HSWP ${newPlayer.username} your RPG character has reached level ${newPlayer.vitals.LVL}! New stats are:  
                             HP: ${player.vitals.HP}/${player.vitals.MAXHP},
                             ATK: ${newPlayer.stats.ATK},
                             DEF: ${newPlayer.stats.DEF}, 
                             STA: ${newPlayer.stats.STA},
                             ACC: ${newPlayer.stats.ACC}, 
                             EVA: ${newPlayer.stats.EVA},
                             SPD: ${newPlayer.stats.SPD}`);
    }

    /**
     * CURRENCY
     */
    addGold(target: string, username: string, gold: number): void {
        const player: Player = this.gameDataService.db.get('users')
            .find({ 'username': username })
            .value();
        const newGold: number = player.vitals.CUR.GOLD + gold;
        this.gameDataService.db.get('users')
            .find({ 'username': username })
            .get('vitals')
            .get('CUR')
            .assign({ 'GOLD': newGold })
            .write();
        // this.client.say(target, `Added ${gold} to ${username}.`);
        // console.info(`[${new Date().toLocaleTimeString()}] info: ${username} earned ${gold} gold.`);
    }

    removeGold(target: string, username: string, gold: number): void {
        const player: Player = this.gameDataService.db.get('users')
            .find({ 'username': username })
            .value();
        const newGold: number = player.vitals.CUR.GOLD - gold;
        this.gameDataService.db.get('users')
            .find({ 'username': username })
            .get('vitals')
            .get('CUR')
            .assign({ 'GOLD': newGold })
            .write();
        this.client.say(target, `Removed ${gold} from ${username}.`);
        console.info(`[${new Date().toLocaleTimeString()}] info: ${username} lost ${gold} gold.`);
    }

    /**
     * ADVENTURES
     * @param target
     * @param username
     */
    joinAdventure(target: string, username: string): void {
        const player: Player = this.gameDataService.db.get('users')
            .find({ 'username': username })
            .value();

        // Check user can start and/or join a quest
        if (player.vitals.HP <= 0) {
            this.client.say(target, `Sorry ${player.username} you can't ${this.adventuringParty.isForming ? 'join' : 'start'} an adventuring party if you're dead!`);
            return;
        }

        // Check if a quest is not already started (either in progress, or on cool down).
        if (!this.adventuringParty.isActive) {

            // Form a new adventuring party
            if (!this.adventuringParty.isForming) {
                this.client.say(target, `${player.username} is looking to form a new adventuring party for a quest.`);
                if (this.adventureCountdown === undefined) {
                    this.adventuringParty.isForming = true;
                    this.adventureCountdown = setTimeout(() => {
                        this.startAdventure(target);
                    }, this.adventurePartyFormationTime * 60 * 1000);
                    if (this.adventurePartyFormationTime >= 1) {
                        setTimeout(() => {
                            this.client.say(target, `The adventuring party will set off on the quest in 1 minute. Type !quest to join!`);
                        }, (this.adventurePartyFormationTime * 60 * 1000) - (60 * 1000));
                        setTimeout(() => {
                            this.client.say(target, `The adventuring party will set off on the quest in 30 seconds. Type !quest to join!`);
                        }, (this.adventurePartyFormationTime * 60 * 1000) - (30 * 1000));
                    }
                }
            }

            // An adventuring party is being formed
            if (this.adventuringParty.isForming) {
                if (this.adventuringParty.partyMembers.length < this.adventuringParty.maxPartyMembers - 1
                    && !this.adventuringParty.partyMembers.includes(player)) {
                    // Add party member
                    this.adventuringParty.partyMembers.push(player);
                    this.client.say(target, `${player.username} has joined the adventuring party!
                                     ${this.adventuringParty.partyMembers.length !== this.adventuringParty.maxPartyMembers ?
                        ` There are ${this.adventuringParty.maxPartyMembers - this.adventuringParty.partyMembers.length} party member slots left. Type !quest to join!` : ''}`);
                    if (this.adventuringParty.partyMembers.length >= this.adventuringParty.maxPartyMembers - 1) {
                        this.client.say(target, `The adventuring party is full!`);
                    }
                } else {
                    if (this.adventuringParty.partyMembers.includes(player)) {
                        this.client.say(target, `${player.username} is already in the adventuring party!`);
                        return;
                    }
                    if (this.adventuringParty.partyMembers.length >= this.adventuringParty.maxPartyMembers - 1) {
                        this.client.say(target, `Sorry ${player.username} but the adventuring party is full!`);
                        return;
                    }
                }
            }

        }

    }

    startAdventure(target: string): void {
        this.adventuringParty.isActive = true;
        this.client.say(target, `The adventuring party has gone looking for a new adventure and encountered a vicious monster!`);
        setTimeout(() => {
            const success = Math.random() < 0.5
            if (success) {
                const xp = Math.floor(Math.random() * 250) + 1;
                let spoilsReport: string = '';
                this.adventuringParty.partyMembers.forEach(member => {
                    const gold = Math.floor(Math.random() * 1000) + 1;
                    this.addXp(target, member.username, xp);
                    this.addGold(target, member.username, gold);
                    spoilsReport += `${spoilsReport}${member.username} gained ${xp}xp and ${gold}gold; `;
                });
                this.client.say(target, `The party returns safely with a bunch of loot! ${spoilsReport}`);
            } else {
                this.adventuringParty.partyMembers.forEach(member => {
                    this.killPlayer(target, member.username);
                });
                this.client.say(target, `The party has fallen. RIP.`);
            }

            this.adventureCountdown = undefined;
            this.adventuringParty.partyMembers = [];
            this.adventuringParty.isForming = false;

            setTimeout(() => {
                this.client.say(target, `A new quest is available. Type !quest to join!`);
                this.adventuringParty.isActive = false;
            }, (this.adventureDelayTime) * 60 * 1000);

        }, 15 * 1000);
    }

}