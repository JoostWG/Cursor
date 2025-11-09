import { discordToken } from '../config.json';
import { CursorBot } from './CursorBot';

void new CursorBot(discordToken).start();
