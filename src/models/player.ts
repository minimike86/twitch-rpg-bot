import {
    HeadArmourItem, TorsoArmourItem, BackArmourItem, WristArmourItem, HandsArmourItem,
    RingArmourItem, LegsArmourItem, FeetArmourItem, MeleeWeaponItem, RangedWeaponItem,
    LootItem, Unarmed
} from './item';
import {rollDice} from '../util';
import {randomBytes} from "crypto";

export class BasicPlayer {
    public id: string;
    public stats: PlayerStats;
    public vitals: PlayerVitals;
    public status: PlayerStatus;
    public equipment: PlayerEquipment;
    public lootBag: LootItem[];

    constructor(stats: PlayerStats, vitals: PlayerVitals, status: PlayerStatus,
                equipment: PlayerEquipment, lootBag: LootItem[]) {
        this.id = randomBytes(20).toString('hex');
        this.stats = stats;
        this.vitals = vitals;
        this.status = status;
        this.equipment = equipment;
        this.lootBag = lootBag;
    }

}

export class Player extends BasicPlayer {
    public 'user-id': string;
    public username: string;
    public mod: boolean;
    public subscriber: boolean;
    public reRoll: 3;

    constructor(user_id: string, username: string, mod: boolean, subscriber: boolean,
                stats: PlayerStats, vitals: PlayerVitals, status: PlayerStatus,
                equipment: PlayerEquipment, lootBag: LootItem[], reRoll: 3) {
        super(stats, vitals, status, equipment, lootBag);
        this['user-id'] = user_id;
        this.username = username;
        this.mod = mod;
        this.subscriber = subscriber;
        this.reRoll = reRoll;
    }

}

export interface PlayerStats {
    ATK: number;    // Attack Power
    DEF: number;    // Defence
    STA: number;    // Stamina
    ACC: number;    // Accuracy
    EVA: number;    // Evasion
    SPD: number;    // Speed
}

export function getNewStats(): PlayerStats {
    return {
        ATK: rollDice(6),
        DEF: rollDice(6),
        STA: rollDice(6),
        ACC: rollDice(6),
        EVA: rollDice(6),
        SPD: rollDice(6)
    };
}

export interface PlayerVitals {
    HP: number;
    MAXHP: number;
    LVL: number;
    XP: number;
    CUR: PlayerCurrency;
}

export function getNewVitals(stats: PlayerStats, level: number): PlayerVitals {
    const maxHp = [...Array(level)].map(() => rollDice(12) + 2)
                                   .reduce((a,b) => a + b);
    return {
        HP: maxHp,
        MAXHP: maxHp,
        LVL: 1,
        XP: 0,
        CUR: {
            GOLD: [...Array(5)].map(() => rollDice(4))
                                         .reduce((a,b) => a + b) * 10,
        }
    }
}

export interface PlayerCurrency {
    GOLD: number;
}

export interface PlayerStatus {
    dead: boolean;
    undead: boolean;
    slowed: boolean;
    haste: boolean;
    blinded: boolean;
    poisoned: boolean;
    petrified: boolean;
}

export function getDefaultPlayerStatus(): PlayerStatus {
    return {
        dead: false,
        undead: false,
        slowed: false,
        haste: false,
        blinded: false,
        poisoned: false,
        petrified: false
    };
}

export interface PlayerEquipment {
    head: HeadArmourItem|null;
    torso: TorsoArmourItem|null;
    back: BackArmourItem|null;
    wrist: WristArmourItem|null;
    hands: HandsArmourItem|null;
    ringLeft: RingArmourItem|null;
    ringRight: RingArmourItem|null;
    legs: LegsArmourItem|null;
    feet: FeetArmourItem|null;
    meleeWeapon: MeleeWeaponItem|null;
    rangedWeapon: RangedWeaponItem|null;
}

export function getDefaultPlayerEquipment(): PlayerEquipment {
    return {
        head: null,
        torso: null,
        back: null,
        wrist: null,
        hands: null,
        ringLeft: null,
        ringRight: null,
        legs: null,
        feet: null,
        meleeWeapon: new Unarmed(),
        rangedWeapon: null,
    };
}