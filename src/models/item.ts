import {randomBytes} from "crypto";

export abstract class LootItem {
    id: string;
    name: string;
    description: string;
    quantity: number;

    constructor(name: string, description: string, quantity: number) {
        this.id = randomBytes(20).toString('hex');
        this.name = name;
        this.description = description;
        this.quantity = quantity;
    }
}

export class PotionItem extends LootItem {
    HP: 100;
    CUR: { GOLD: 200 };
}

export class HiPotionItem extends LootItem {
    HP: 250;
    CUR: { GOLD: 500 };
}

export class MaxPotionItem extends LootItem {
    HP: 9999;
    CUR: { GOLD: 20000 };
}

export class RevivalPotionItem extends LootItem {
    status: 'revive';
    CUR: { GOLD: 1000 };
}

export enum EquipmentSlot {
    HEAD = 'Head',
    TORSO = 'Torso',
    BACK = 'Back',
    WRIST = 'Wrist',
    HAND = 'Hand',
    RING = 'Ring',
    LEG = 'Leg',
    FEET = 'Feet',
    MELEE = 'Melee',
    RANGED = 'Ranged'
}

export enum EquipmentType {
    WEAPON = 'Weapon',
    ARMOUR = 'Armour'
}

export abstract class EquipmentItem extends LootItem {
    slot: EquipmentSlot;
    ATK: number = 0;
    DEF: number = 0;
    STA: number = 0;
    ACC: number = 0;
    EVA: number = 0;
    SPD: number = 0;

    protected constructor(name: string, description: string, quantity: number, slot: EquipmentSlot) {
        super(name, description, quantity);
        this.slot = slot;
    }
}

export abstract class ArmourItem extends EquipmentItem {
    type: EquipmentType;

    protected constructor(name: string, description: string, quantity: number, slot: EquipmentSlot) {
        super(name, description, quantity, slot);
        this.type = EquipmentType.ARMOUR;
    }
}

export abstract class HeadArmourItem extends ArmourItem {
    slot: EquipmentSlot.HEAD;
}

export abstract class TorsoArmourItem extends ArmourItem {
    slot: EquipmentSlot.TORSO;
}

export abstract class BackArmourItem extends ArmourItem {
    slot: EquipmentSlot.BACK;
}

export abstract class WristArmourItem extends ArmourItem {
    slot: EquipmentSlot.WRIST;
}

export abstract class HandsArmourItem extends ArmourItem {
    slot: EquipmentSlot.HAND;
}

export abstract class RingArmourItem extends ArmourItem {
    slot: EquipmentSlot.RING;
}

export abstract class LegsArmourItem extends ArmourItem {
    slot: EquipmentSlot.LEG;
}

export abstract class FeetArmourItem extends ArmourItem {
    slot: EquipmentSlot.FEET;
}

export abstract class WeaponItem extends EquipmentItem {
    type: EquipmentType;
    protected constructor(name: string, description: string, quantity: number, slot: EquipmentSlot) {
        super(name, description, quantity, slot);
        this.type = EquipmentType.WEAPON;
    }
}

export abstract class MeleeWeaponItem extends WeaponItem {
    protected constructor(name: string, description: string, quantity: number) {
        super(name, description, quantity, EquipmentSlot.MELEE);
    }
}

export class Unarmed extends MeleeWeaponItem {
    constructor() {
        super('Unarmed', 'Your bare hands', 1);
        this.ATK = 1;
    }
}

export class WoodenSword extends MeleeWeaponItem {
    constructor() {
        super('Wooden Sword', 'A training sword made of wood.', 1);
        this.ATK = 3;
    }
}

export class IronSword extends MeleeWeaponItem {
    constructor() {
        super('Iron Sword', 'A poor quality metal sword made of iron.', 1);
        this.ATK = 6;
    }
}

export class SteelSword extends MeleeWeaponItem {
    constructor() {
        super('Steel Sword', 'A good quality metal sword made of steel.', 1);
        this.ATK = 12;
    }
}

export class LaserSword extends MeleeWeaponItem {
    constructor() {
        super('Laser Sword', 'A futuristic sword made of pure energy.', 1);
        this.ATK = 99;
    }
}

export class RangedWeaponItem extends WeaponItem {
    protected constructor(name: string, description: string, quantity: number) {
        super(name, description, quantity, EquipmentSlot.RANGED);
    }
}

export class Catapult extends RangedWeaponItem {
    constructor() {
        super('Catapult', 'A child\'s catapult.', 1);
        this.ATK = 1;
    }
}

export class ShortBow extends RangedWeaponItem {
    constructor() {
        super('Short Bow', 'A low powered small bow and arrows.', 1);
        this.ATK = 3;
    }
}

export class LongBow extends RangedWeaponItem {
    constructor() {
        super('Long Bow', 'A medium powered long bow and arrows.', 1);
        this.ATK = 6;
    }
}

export class CompoundBow extends RangedWeaponItem {
    constructor() {
        super('Compound Bow', 'A high powered compound bow and arrows.', 1);
        this.ATK = 12;
    }
}

export class TacticalNuke extends RangedWeaponItem {
    constructor() {
        super('Tactical Nuclear Missile', 'An unbelievable weapon of mass destruction', 1);
        this.ATK = 9999;
    }
}
