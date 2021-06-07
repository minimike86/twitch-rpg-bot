import {Player} from './player';


export class AdventuringParty {
    public partyMembers: Player[];
    public maxPartyMembers: number;
    public isForming: boolean;
    public isActive: boolean;

    constructor(partyMembers: Player[], maxPartyMembers: number, isForming: boolean, isActive: boolean) {
        this.partyMembers = partyMembers;
        this.maxPartyMembers = maxPartyMembers;
        this.isForming = isForming;
        this.isActive = isActive;
    }

}