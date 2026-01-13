const severityMap = [undefined, 'warning', 'error'];

/**
 * @param {string} path
 */
function getPath(path) {
    const parts = path.split(/\/|\\/ug); // '/' or '\'

    return parts.splice(parts.indexOf('src')).join('/');
}

/**
 *
 * @param {'warning' | 'error'} severity
 * @param {string} file
 * @param {number} line
 * @param {number} column
 * @param {string} message
 */
function annotation(severity, file, line, column, message) {
    return `::${severityMap[severity]} file=${getPath(file)},line=${line},col=${column}::${message}`;
}

/**
 * @param {import('eslint').ESLint.LintResult[]} results
 * @param {any} context
 */
module.exports = function (results, context) {
    const lines = [];

    for (const result of results) {
        for (const message of result.messages) {
            lines.push(annotation(message.severity, result.filePath, message.line, message.column, message.message));
        }
    }

    return lines.join('\n');
}
