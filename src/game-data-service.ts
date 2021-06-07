const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

export class GameDataService {

    private adapter = new FileSync('src/db.json');
    public db: any;

    constructor() {
        this.db = low(this.adapter);
        this.setDefaults();
    }

    // Set some defaults (required if your JSON file is empty)
    setDefaults() {
        this.db.defaults({ users: [], count: 0 }).write();
    }

    userExists(username: string): boolean {
        const users = this.db.get('users')
            .filter({ 'username': username })
            .value();
        return users.length >= 1;
    }

}