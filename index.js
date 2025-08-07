const { handleKeypress, render } = require("./render");
const { GREEN, CLEAR } = require("./ansi");

function onFinish() {
    process.stdout.write(CLEAR);
    process.stdout.write(GREEN + "\n\n-> Done!\n");
    process.exit();
}

function init() {
    process.stdout.write(CLEAR);
    render();

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => handleKeypress(chunk, onFinish));

    process.on('SIGWINCH', () => {
        render();
    });
}

init();