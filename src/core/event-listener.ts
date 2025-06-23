import type { ClientEvents } from 'discord.js';

export abstract class EventListener<Event extends keyof ClientEvents = keyof ClientEvents> {
    public abstract readonly event: Event;

    public abstract execute(...args: ClientEvents[Event]): Promise<void>;
}

export function eventListener<Event extends keyof ClientEvents>(event: Event) {
    return class implements EventListener<Event> {
        public readonly event = event;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        public async execute(...args: ClientEvents[Event]) {
            //
        }
    };
}
