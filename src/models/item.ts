export interface LootItem {
    id: number;
    name: string;
    description: string;
}

export interface PotionItem extends LootItem {
    HP: 100;
}

export interface HiPotionItem extends LootItem {
    HP: 250;
}

export interface MaxPotionItem extends LootItem {
    HP: 9999;
}

export interface RevivalPotionItem extends LootItem {
    status: 'revive';
}

export interface EquipmentItem extends LootItem {
    ATK?: number;
    DEF?: number;
    STA?: number;
    ACC?: number;
    EVA?: number;
    SPD?: number;
}

interface ArmourItem extends EquipmentItem {
    DEF: number;
    slot: string;
}

export interface HeadArmourItem extends ArmourItem {
    slot: 'Head';
}

export interface TorsoArmourItem extends ArmourItem {
    slot: 'Torso';
}

export interface BackArmourItem extends ArmourItem {
    slot: 'Back';
}

export interface WristArmourItem extends ArmourItem {
    slot: 'Back';
}

export interface HandsArmourItem extends ArmourItem {
    slot: 'Back';
}

export interface RingArmourItem extends ArmourItem {
    slot: 'Ring';
}

export interface LegsArmourItem extends ArmourItem {
    slot: 'Legs';
}

export interface FeetArmourItem extends ArmourItem {
    slot: 'Feet';
}

interface WeaponItem extends EquipmentItem {
    ATK: number;
    slot: string;
}

export interface MeleeWeaponItem extends WeaponItem {
    slot: 'Melee';
}

export interface WoodenSword extends MeleeWeaponItem {
    ATK: 1;
}

export interface IronSword extends MeleeWeaponItem {
    ATK: 2;
}

export interface SteelSword extends MeleeWeaponItem {
    ATK: 3;
}

export interface LaserSword extends MeleeWeaponItem {
    ATK: 99;
}

export interface RangedWeaponItem extends WeaponItem {
    slot: 'Ranged';
}

export interface LightCrossbow extends MeleeWeaponItem {
    ATK: 1;
}

export interface HeavyCrossbow extends MeleeWeaponItem {
    ATK: 2;
}

export interface ShortBow extends MeleeWeaponItem {
    ATK: 1;
}

export interface LongBow extends MeleeWeaponItem {
    ATK: 2;
}

export interface TacticalNuke extends MeleeWeaponItem {
    ATK: 99;
}
