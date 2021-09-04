import {LootItem, Unarmed} from "./item";
import {
    BasicPlayer, getDefaultPlayerEquipment, getDefaultPlayerStatus, getNewStats, getNewVitals,
    PlayerEquipment,
    PlayerStats,
    PlayerStatus,
    PlayerVitals
} from "./player";
import {rollDice} from "../util";


export class Enemy extends BasicPlayer {
    public name: string;
    public emoteAvatar: string;

    constructor(name: string, emoteAvatar: string,
                stats: PlayerStats, vitals: PlayerVitals, status: PlayerStatus,
                equipment: PlayerEquipment, lootBag: LootItem[]) {
        super(stats, vitals, status, equipment, lootBag);
        this.name = name;
        this.emoteAvatar = emoteAvatar;
    }

}

export class Skeleton extends Enemy {
    constructor() {
        const stats = {
            ATK: 1,
            DEF: 1,
            STA: 0,
            ACC: 1,
            EVA: 0,
            SPD: 0
        };
        const vitals = {
            HP: 12,
            MAXHP: 12,
            LVL: 1,
            XP: 100,
            CUR: {
                GOLD: [...Array(5)].map((_, i) => rollDice(4))
                                             .reduce((a,b) => a + b) * 10,
            }
        };
        const status = {
            dead: false,
            undead: true,
            slowed: false,
            haste: false,
            blinded: false,
            poisoned: false,
            petrified: false
        };
        const loot: LootItem[] = [];
        super('Skeleton', '💀', stats, vitals, status, getDefaultPlayerEquipment(), loot);
    }
}