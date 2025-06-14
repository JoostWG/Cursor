import type { ClientEvents } from 'discord.js';

export abstract class EventListener<Event extends keyof ClientEvents = keyof ClientEvents> {
    public abstract readonly event: Event;

    public abstract execute(...args: ClientEvents[Event]): Promise<void>;
}
