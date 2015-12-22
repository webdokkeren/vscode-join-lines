/**
 * Import modules
 * The module 'vscode' contains the VS Code extensibility API
 */
var vscode = require('vscode');
var _ = require('lodash');
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
    var document = textEditor.document;
    var selection = textEditor.selection;
    var selectedLine = selection.start.line;
    var totalLines = document.lineCount;
    var nextLineNum = selectedLine + 1;
    var lineAfterNextLineNum = nextLineNum + 1;
    var startLine = document.lineAt(selection.end.line);
    var startText = _.trimRight(startLine.text);
    /** Return if there are no lines below the current selected one */
    if (lineAfterNextLineNum > totalLines) {
        return;
    }
    /** Let the "joining" begin */
    textEditor.edit(function (editBuilder) {
        var nextLine = document.lineAt(nextLineNum);
        var nextLineText = nextLine.text;
        joinThem(document, editBuilder, selectedLine, nextLineText);
    }).then(function () {
        var startLineNum = selection.start.line;
        var cursorStartPos = startText.length + 1;
        var newSelection = new vscode.Selection(startLineNum, cursorStartPos, startLineNum, cursorStartPos);
        var tagSelections = [newSelection];
        textEditor.selections = tagSelections;
    });
}
/**
 * Joines two lines.
 * Trims the second line (text) in the process removing any whitespace before and after the second text (text)
 * @param {vscode.TextEditor} editor            instance of the active editor
 * @param {vscode.TextEditorEdit} editBuilder
 * @param {number} line                         linenumber of the currently selected line
 * @param {string} text                         text from the line below the currently selected on
 */
function joinThem(document, editBuilder, line, text) {
    var nextLineText = _.trim(text);
    var firstLine = document.lineAt(line);
    var firstLineText = _.trimRight(firstLine.text);
    var location = new vscode.Position(line, firstLineText.length);
    var textToInsert = nextLineText === '' ? firstLineText + nextLineText : firstLineText + ' ' + nextLineText;
    var rangeToDelete = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line + 1, text.length));
    /** Join the lines using replace */
    editBuilder.replace(rangeToDelete, textToInsert);
}
//# sourceMappingURL=extension.js.map