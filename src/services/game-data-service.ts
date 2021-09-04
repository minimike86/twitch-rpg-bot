import {Player} from "../models/player";

const Low = require('lowdb');
const JSONFileSync = require('lowdb/adapters/FileSync');


export class GameDataService {

    private adapter = new JSONFileSync('src/db.json');
    public db: any;

    constructor() {
        this.db = new Low(this.adapter);
        this.setDefaults();
    }

    // Set some defaults (required if your JSON file is empty)
    setDefaults() {
        this.db.defaults({ users: [], count: 0 }).write();
    }

    userExists(username: string): boolean {
        const users: Player[] = this.db.get('users')
            .filter({ 'username': username })
            .value();
        return users.length >= 1;
    }

}