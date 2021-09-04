import {GameService} from "../services/game-service";
import {Player, PlayerCurrency} from './player';
import {Enemy, Skeleton} from "./enemy";
import {rollDice} from "../util";
import {LootItem} from "./item";
import _ from "lodash";
import Timeout = NodeJS.Timeout;


export class Adventure {
    private gameService: any;
    public enemies: Enemy[];
    public adventuringParty: AdventuringParty;
    public adventureCountdown: Timeout;
    public battleOutcome: BattleOutcome;
    private adventurePartyFormationTime: number = 0.125;
    private adventureDelayTime: number = 0.125;
    private nextAdventureDelayTime: number = 0.125;

    constructor(gameService: GameService){
        this.gameService = gameService;
        this.enemies = [];
        this.adventuringParty = {
            partyMembers: [],
            maxPartyMembers: 8,
            isForming: false,
            isActive: false
        };
        this.battleOutcome = {
            success: false,
            XP: 0,
            CUR: {
                GOLD: 0
            },
            lootBag: [],
            spoilsReport: ''
        };
    }

    public getEnemyNames(): string {
        let nameStr = '';
        if (this.enemies.length === 1) {
            nameStr += ' a ';
        } else if (this.enemies.length > 1) {
            nameStr += ' a group consisting of a ';
        }
        for (let i = 0; i <= this.enemies.length - 1; i++) {
            nameStr += this.enemies[i].name + ' ' + this.enemies[i].emoteAvatar;
            if (this.enemies.length > 1 && i === this.enemies.length - 2) {
                nameStr += ', and a ';
            } else if (this.enemies.length > 1 && i < this.enemies.length - 1) {
                nameStr += ', ';
            }
        }
        return nameStr;
    }

    public join(target: string, client: any, player: Player) {
        // Check user can start and/or join a quest
        if (player.status.dead) {
            client.say(target, `Sorry ${player.username} you can't ${this.adventuringParty.isForming ? 'join' : 'start'} an adventuring party if you're dead!`);
            return;
        }

        // Check if a quest is not already started (either in progress, or on cool down).
        if (!this.adventuringParty.isActive) {

            // Form a new adventuring party and start the adventure when time runs out
            if (!this.adventuringParty.isForming) {
                if (this.adventureCountdown === undefined) {
                    this.adventuringParty.isForming = true;
                    this.adventureCountdown = setTimeout(() => {
                        this.startAdventure(target, client);
                    }, this.adventurePartyFormationTime * 60 * 1000);
                    if (this.adventurePartyFormationTime >= 1) {
                        setTimeout(() => {
                            client.say(target, `The adventuring party will set off on the quest in 1 minute. Type !quest to join!`);
                        }, (this.adventurePartyFormationTime * 60 * 1000) - (60 * 1000));
                        setTimeout(() => {
                            client.say(target, `The adventuring party will set off on the quest in 30 seconds. Type !quest to join!`);
                        }, (this.adventurePartyFormationTime * 60 * 1000) - (30 * 1000));
                    }
                }
            }

            // An adventuring party is being formed add new members to it
            if (this.adventuringParty.isForming) {
                if (this.adventuringParty.partyMembers.length < this.adventuringParty.maxPartyMembers - 1
                    && !this.adventuringParty.partyMembers.includes(player)) {
                    // Add party member
                    this.adventuringParty.partyMembers.push(player);
                    client.say(target, `${this.adventuringParty.partyMembers.length === 1 ? `${player.username} is looking to form a new adventuring party for a quest. 
                        ${this.adventuringParty.partyMembers.length !== this.adventuringParty.maxPartyMembers ? ` There are ${this.adventuringParty.maxPartyMembers - this.adventuringParty.partyMembers.length} party member slots left. Type !quest to join!` : ''}`
                        : ''}`);
                    if (this.adventuringParty.partyMembers.length >= this.adventuringParty.maxPartyMembers - 1) {
                        client.say(target, `The adventuring party is full!`);
                    }
                } else {
                    if (this.adventuringParty.partyMembers.includes(player)) {
                        client.say(target, `${player.username} is already in the adventuring party!`);
                        return;
                    }
                    if (this.adventuringParty.partyMembers.length >= this.adventuringParty.maxPartyMembers - 1) {
                        client.say(target, `Sorry ${player.username} but the adventuring party is full!`);
                        return;
                    }
                }
            }

        }
    }

    public startAdventure(target: string, client: any): void {
        this.adventuringParty.isActive = true;
        this.enemies = _.sampleSize([new Skeleton()], 1);
        client.say(target, `The adventuring party encountered ${this.getEnemyNames()}!`);

        // Wait n seconds before initiating and completing the adventure
        setTimeout(() => {
            this.battleOutcome = this.simulateBattle();
            if (this.battleOutcome.success) {
                client.say(target, `KAPOW HSWP The party returns safely with a bunch of loot! ${this.battleOutcome.spoilsReport}`);
            } else {
                client.say(target, `NotLikeThis The party has fallen. RIP. Other players can revive you by typing !revive [username]`);
            }

            // After the quest. Reset the adventure.
            this.adventureCountdown = undefined;
            this.adventuringParty.partyMembers = [];
            this.adventuringParty.isForming = false;

            // After n delay then allow a new quest to be started
            setTimeout(() => {
                client.say(target, `A new quest is available. Type !quest to join!`);
                this.adventuringParty.isActive = false;
            }, (this.nextAdventureDelayTime) * 60 * 1000);

        }, this.adventureDelayTime * 60 * 1000);
    }

    public simulateBattle(): BattleOutcome {
        const initOrder: Array<Player|Enemy> = _.orderBy(_.union(this.adventuringParty.partyMembers, this.enemies), (o: Player) => o.stats.SPD, ['desc']);
        do {
            for (let combatant of initOrder) {
                if (combatant.hasOwnProperty('username')) {
                    const target: Enemy = _.sample(initOrder.filter(x => x.hasOwnProperty('emoteAvatar')));
                    if (this.makeAttack(combatant, target)) {
                        this.dealPvEDamage(combatant as Player, target);
                    } else {
                        console.info((combatant as Player).username + '\'s ' + combatant.equipment.meleeWeapon.name + ' attack on ' + target.name + ' misses!');
                    }
                }
                if (combatant.hasOwnProperty('emoteAvatar')) {
                    const target: Player = _.sample(initOrder.filter(x => x.hasOwnProperty('username')));
                    if (this.makeAttack(combatant, target)) {
                        this.dealEvPDamage(combatant as Enemy, target);
                    } else {
                        console.info((combatant as Enemy).name + '\'s ' + combatant.equipment.meleeWeapon.name + ' attack on ' + target.username + ' misses!');
                    }
                }
                if (this.adventuringParty.partyMembers.length === 0) {
                    this.battleOutcome.success = false;
                    return this.battleOutcome;
                } else if (this.enemies.length === 0) {
                    this.battleOutcome.success = true;
                    return this.battleOutcome;
                }
            }
        } while (this.adventuringParty.partyMembers.length > 0 || this.enemies.length > 0);
        return this.battleOutcome;
    }

    public makeAttack(combatant: Player|Enemy, target: Player|Enemy): boolean {
        const targetRoll = rollDice(20);
        const evade: number = targetRoll + target.stats.EVA;
        const playerRoll = rollDice(20);
        if (playerRoll === 20) {
            return true;
        } else {
            const hit: number = playerRoll + combatant.stats.ACC;
            return hit >= evade;
        }
    }

    public dealPvEDamage(combatant: Player, target: Enemy) {
        const damage: number = combatant.stats.ATK +
                               rollDice(combatant.equipment.meleeWeapon.ATK);
        if (target.vitals.HP - damage > 0) {
            _.set(_.find(this.enemies, enemy => enemy.id === target.id), 'vitals.HP', target.vitals.HP - damage);
            console.info(combatant.username + '\'s ' + combatant.equipment.meleeWeapon.name + ' attack deals ' + damage + ' damage to ' + target.name + '!');
        } else {
            _.remove(this.enemies, enemy => enemy.id === target.id);
            this.battleOutcome.XP += target.vitals.XP;
            this.battleOutcome.CUR.GOLD += target.vitals.CUR.GOLD;
            this.battleOutcome.lootBag.push(...target.lootBag);
            console.info(combatant.username + '\'s ' + combatant.equipment.meleeWeapon.name + ' attack deals ' + damage + ' damage to ' + '' + target.name + ' and it falls.');
        }
    }

    public dealEvPDamage(combatant: Enemy, target: Player) {
        const damage: number = combatant.stats.ATK +
                               rollDice(combatant.equipment.meleeWeapon.ATK);
        this.gameService.damagePlayer(target.username, damage);
        if (!target.status.dead) {
            console.info(combatant.name + '\'s ' + combatant.equipment.meleeWeapon.name + ' attack deals ' + damage + ' damage to ' + target.username + '!');
        } else {
            _.remove(this.adventuringParty.partyMembers, player => player.id === target.id);
            console.info(combatant.name + '\'s ' + combatant.equipment.meleeWeapon.name + ' attack deals ' + damage + ' damage to ' + '' + target.username + ' and it falls.');
        }
    }

}


export class AdventuringParty {
    public partyMembers: Player[];
    public maxPartyMembers: number;
    public isForming: boolean;
    public isActive: boolean;

    constructor(enemies: Enemy[], partyMembers: Player[], maxPartyMembers: number, isForming: boolean, isActive: boolean) {
        this.partyMembers = partyMembers;
        this.maxPartyMembers = maxPartyMembers;
        this.isForming = isForming;
        this.isActive = isActive;
    }

}

export interface BattleOutcome {
    success: boolean;
    XP: number;
    CUR: PlayerCurrency;
    lootBag: LootItem[];
    spoilsReport: string;
}
