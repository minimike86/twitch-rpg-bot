import { HeadArmourItem, TorsoArmourItem, BackArmourItem, WristArmourItem, HandsArmourItem,
         RingArmourItem, LegsArmourItem, FeetArmourItem, MeleeWeaponItem, RangedWeaponItem, LootItem } from "./item";
import { rollDice } from "../util";

export class Player {
    public 'user-id': string;
    public username: string;
    public mod: boolean;
    public subscriber: boolean;
    public stats: PlayerStats;
    public vitals: PlayerVitals;
    public status: PlayerStatus;
    public equipment: PlayerEquipment;
    public lootBag: LootItem[];
    public reRoll: 3;

    constructor(user_id: string, username: string, mod: boolean, subscriber: boolean,
                stats: PlayerStats, vitals: PlayerVitals, status: PlayerStatus,
                equipment: PlayerEquipment, lootBag: LootItem[], reRoll: 3) {
        this['user-id'] = user_id;
        this.username = username;
        this.mod = mod;
        this.subscriber = subscriber;
        this.stats = stats;
        this.vitals = vitals;
        this.status = status;
        this.equipment = equipment;
        this.lootBag = lootBag;
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
        ATK: Math.floor(Math.random() * 4) + 3,
        DEF: Math.floor(Math.random() * 4) + 3,
        STA: Math.floor(Math.random() * 11) + 15,
        ACC: Math.floor(Math.random() * 4) + 3,
        EVA: Math.floor(Math.random() * 4) + 3,
        SPD: Math.floor(Math.random() * 4) + 3
    };
}

export interface PlayerVitals {
    HP: number;
    MAXHP: number;
    LVL: number;
    XP: number;
    CUR: PlayerCurrency;
}

export function getNewVitals(stats: PlayerStats): PlayerVitals {
    const maxHp = Math.floor(20 + (stats.STA / 4) + (Math.floor(Math.random() * 6) + 1));
    return {
        HP: maxHp,
        MAXHP: maxHp,
        LVL: 1,
        XP: 0,
        CUR: {
            GOLD: (rollDice(4)
                + rollDice(4)
                + rollDice(4)
                + rollDice(4)
                + rollDice(4)) * 10,
        }
    }
}

export interface PlayerCurrency {
    GOLD: number;
}

export interface PlayerStatus {
    dead: boolean;
    slowed: boolean;
    haste: boolean;
    blinded: boolean;
    poisoned: boolean;
    petrified: boolean;
}

export function getDefaultPlayerStatus(): PlayerStatus {
    return {
        dead: false,
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
        meleeWeapon: null,
        rangedWeapon: null
    };
}