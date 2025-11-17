// import { discordToken } from '../config.json';
// import { CursorBot } from './CursorBot';

import { Sudoku } from './modules/sudoku';

// void new CursorBot(discordToken).start();

const sudoku = Sudoku.fromString(
    '110020350390800760000000009000605090580004026000209583400508930001342608600107205',
);

console.log(sudoku.toString());
console.log('-----------------------------');

sudoku.solve();
console.log(sudoku.toString());
