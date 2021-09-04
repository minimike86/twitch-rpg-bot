import {Adventure} from '../models/adventure';
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
    PlayerVitals,
    PlayerCurrency
} from '../models/player';

export class GameService {
    public client: any;
    public readonly gameDataService: GameDataService;
    private adventure: Adventure;

    constructor(client: any) {
        this.client = client;
        this.gameDataService = new GameDataService();
        this.adventure = new Adventure(this);
    }

    /**
     * PLAYERS
     */
    addPlayer(target: string, context: TwitchContext): void {
        const stats = getNewStats();
        const vitals = getNewVitals(stats, 1);
        const newPlayer: Player = new Player(context['user-id'], context.username, context.mod, context.subscriber,
            stats, vitals, getDefaultPlayerStatus(), getDefaultPlayerEquipment(), [], 3);
        this.gameDataService.db.get('users')
            .push(newPlayer)
            .write();
        this.gameDataService.db.update('count', n => n + 1)
            .write();
        console.info(`[${new Date().toLocaleTimeString()}] info: ${context.username} added to db`);
        this.client.say(target, `Welcome ${context.username} to the stream! Here is your RPG character stats: 
                         HP: ${vitals.HP}/${vitals.MAXHP},
                         ATK: ${stats.ATK},
                         DEF: ${stats.DEF}, 
                         STA: ${stats.STA},
                         ACC: ${stats.ACC}, 
                         EVA: ${stats.EVA},
                         SPD: ${stats.SPD} - if you don't like them type !reroll to make another.`);
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
            .value().reRoll;
    }

    reRollPlayer(target: string, context: TwitchContext): void {
        const oldReRoll: number = this.gameDataService.db.get('users')
            .find({ 'username': context.username })
            .value().reRoll;
        if (oldReRoll >= 1) {
            const stats = getNewStats();
            const vitals = getNewVitals(stats, 1);
            this.gameDataService.db.get('users')
                .find({ 'username': context.username })
                .assign({ 'stats': stats })
                .assign({ 'vitals': vitals })
                .assign({ 'status': getDefaultPlayerStatus() })
                .assign({ 'equipment': getDefaultPlayerEquipment() })
                .assign({ 'lootBag': [] })
                .assign({ 'reRoll': oldReRoll - 1 })
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

    damagePlayer(username: string, amount: number): void {
        if (this.gameDataService.userExists(username)) {
            const player: Player = this.gameDataService.db.get('users')
                .find({ 'username': username })
                .value();
            if (!player.status.dead) {
                this.gameDataService.db.get('users')
                    .find({ 'username': username })
                    .get('vitals')
                    .assign({ 'HP': player.vitals.HP - amount <= 0 ? 0 : player.vitals.HP - amount })
                    .write();
            }
            if (player.vitals.HP === 0) {
                this.gameDataService.db.get('users')
                    .find({ 'username': username })
                    .get('status')
                    .assign({ 'dead': true })
                    .write();
            }
        }
    }

    healPlayer(target: string, username: string, context: TwitchContext): void {
        const commandUser: Player = this.gameDataService.db.get('users')
            .find({ 'username': context.username })
            .value();
        if (this.gameDataService.userExists(username)) {
            const player: Player = this.gameDataService.db.get('users')
                .find({ 'username': username })
                .value();
            if (!player.status.dead) {
                this.gameDataService.db.get('users')
                    .find({ 'username': username })
                    .get('vitals')
                    .assign({ 'HP': player.vitals.MAXHP })
                    .write();
                this.client.say(target, `${commandUser.username} applies a healing kit to ${username} and restores their health.`);
            } else {
                this.client.say(target, `${username} is dead.`);
            }
        } else {
            this.client.say(target, `${username} is not a valid username.`);
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
            if (player.status.dead) {
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
        this.adventure.join(target, this.client, player);
    }

}