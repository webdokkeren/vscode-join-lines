/**
 * Import modules
 * The module 'vscode' contains the VS Code extensibility API
 */
var vscode = require('vscode');
var settings = {
    document: undefined
};
var whitespaceAtEndOfLine = /\s*$/;
/**
 * this method is called when the extension is activated
 * the extension is activated the very first time joinLines is executed
 */
function activate(context) {
    /**
     * This following lines of code will only be executed once the extension is activated
     */
    console.log('Join lines extension activated!');
    /**
     * The command has been defined in the package.json file
     * Now we provide the implementation of the command with registerCommand
     * The commandId parameter must match the command field in package.json
     */
    var disposable = vscode.commands.registerTextEditorCommand('joinLines.joinLines', joinLines);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function joinLines(textEditor) {
    /** If editor is undefined just return */
    if (textEditor == undefined) {
        return;
    }
    settings.document = textEditor.document;
    var newSelections = [];
    /** Let the "joining" begin */
    textEditor.edit(processSelections).then(postProcess);
    function processSelections(editBuilder) {
        /** Process each selection */
        textEditor.selections.forEach(processSelection);
        function processSelection(selection) {
            if (noRangeOneLine(selection)) {
                return newSelections.push(joinSimple(selection, editBuilder));
            }
            if (rangeOneLine(selection)) {
                //TODO: Does not work properly with multiline
                joinThem(selection.start.line, editBuilder);
                return newSelections.push({ numLinesRemoved: 1, selection: selection });
            }
            var numberOfCharactersOnFirstLine = settings.document.lineAt(selection.start.line).range.end.character;
            var endCharacterOffset = 0;
            for (var lineIndex = selection.start.line; lineIndex <= selection.end.line - 1; lineIndex++) {
                var charactersInLine = lineIndex == selection.end.line - 1 ? selection.end.character + 1 : settings.document.lineAt(lineIndex + 1).range.end.character + 1;
                var whitespaceLengths = joinThem(lineIndex, editBuilder);
                endCharacterOffset += charactersInLine - whitespaceLengths.whitespaceLengthAtEnd - whitespaceLengths.whitespaceLengthAtStart;
            }
            return newSelections.push({
                numLinesRemoved: selection.end.line - selection.start.line,
                selection: new vscode.Selection(selection.start.line, selection.start.character, selection.start.line, numberOfCharactersOnFirstLine + endCharacterOffset)
            });
        }
    }
    function postProcess() {
        var selections = newSelections.map(selectionPostProcessor);
        textEditor.selections = selections;
        function selectionPostProcessor(x, i) {
            var numLinesRemoved = x.numLinesRemoved, selection = x.selection;
            var numPreviousLinesRemoved = i;
            if (numPreviousLinesRemoved != 0) {
                numPreviousLinesRemoved = newSelections.slice(0, i).map(function (x) { return x.numLinesRemoved; }).reduce(function (a, b) { return a + b; });
            }
            var newLineNumber = selection.start.line - numPreviousLinesRemoved;
            return new vscode.Selection(newLineNumber, selection.start.character, newLineNumber, selection.end.character);
        }
    }
}
function joinSimple(selection, editBuilder) {
    //TODO: Does not work with a cursor on last line
    //TODO: Dees not work when cursors following the first are not at the start line
    //TODO: Does not work multiple cursors on one line
    var newSelectionEnd = settings.document.lineAt(selection.start.line).range.end.character - joinThem(selection.start.line, editBuilder).whitespaceLengthAtEnd;
    return {
        numLinesRemoved: 1,
        selection: new vscode.Selection(selection.start.line, newSelectionEnd, selection.end.line, newSelectionEnd)
    };
}
function rangeOneLine(range) {
    return range.start.line === range.end.line;
}
function noRangeOneLine(range) {
    return rangeOneLine(range) && range.start.character === range.end.character;
}
function joinThem(line, editBuilder) {
    var docLine = settings.document.lineAt(line);
    var nextLineNum = line + 1;
    var matchWhitespaceAtEnd = docLine.text.match(whitespaceAtEndOfLine);
    var whitespaceLength = matchWhitespaceAtEnd[0].length;
    var range;
    /** End of the line */
    if ((settings.document.lineCount - 1) == line) {
        range = new vscode.Range(line, docLine.range.end.character - whitespaceLength, nextLineNum, docLine.range.end.character);
        editBuilder.replace(range, '');
        return {
            whitespaceLengthAtEnd: whitespaceLength,
            whitespaceLengthAtStart: 0
        };
    }
    var docNextLine = settings.document.lineAt(nextLineNum);
    range = new vscode.Range(line, docLine.range.end.character - whitespaceLength, nextLineNum, docNextLine.firstNonWhitespaceCharacterIndex);
    editBuilder.replace(range, ' ');
    return {
        whitespaceLengthAtEnd: whitespaceLength - 1,
        whitespaceLengthAtStart: docNextLine.firstNonWhitespaceCharacterIndex
    };
}
//# sourceMappingURL=extension.js.map