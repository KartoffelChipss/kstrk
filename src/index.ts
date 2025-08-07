import { Command } from 'commander';
import helpConfig from './util/helpConfig';
import { startGame } from './game';

const VERSION = '1.0.0';

const program = new Command();

program
    .name('kstrk')
    .version(VERSION)
    .action(() => program.help())
    .configureHelp(helpConfig)
    .option('-t, --time <time>', 'Set the max time in seconds', parseInt)
    .option(
        '-i --infinite',
        'Run indefinitely until interrupted (Ctrl+D or Ctrl+C)'
    )
    .action(() => startGame(program));

program.parse(process.argv);
