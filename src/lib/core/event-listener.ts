import type { ClientEvents } from 'discord.js';

export abstract class EventListener<Event extends keyof ClientEvents = keyof ClientEvents> {
    public abstract readonly event: Event;

    public abstract handle(...args: ClientEvents[Event]): Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function eventListener<Event extends keyof ClientEvents>(event: Event) {
    return class implements EventListener<Event> {
        public readonly event = event;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        public async handle(...args: ClientEvents[Event]): Promise<void> {
            //
        }
    };
}
