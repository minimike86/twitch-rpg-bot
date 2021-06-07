export interface TwitchContext {
    'badge-info': any,
    badges: any,
    'client-nonce': string,
    color: string,
    'display-name': string,
    emotes: any,
    flags: any,
    id: string,
    mod: boolean,
    'room-id': string,
    subscriber: boolean,
    'tmi-sent-ts': string,
    turbo: boolean,
    'user-id': string,
    'user-type': any,
    'emotes-raw': any,
    'badge-info-raw': any,
    'badges-raw': string,
    username: string,
    'message-type': string
}

export interface TwitchTmi {
    _links: any,
    chatter_count: number,
    chatters: TwitchChatters
}

export interface TwitchChatters {
    broadcaster: string[],
    vips: string[],
    moderators: string[],
    staff: string[],
    admins: string[],
    global_mods: string[],
    viewers: string[]
}