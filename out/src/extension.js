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
    var disposable = vscode.commands.registerCommand('extension.joinLines', function () {
        joinLines();
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function joinLines() {
    var editor = vscode.window.activeTextEditor;
    /** If editor is undefined just return */
    if (editor == undefined) {
        console.log('JoinLines: No editor');
        return;
    }
    var selection = editor.selection;
    var selectedLine = selection.start.line;
    var totalLines = editor.document.lineCount;
    var nextLineNum = selectedLine + 1;
    var lineAfterNextLineNum = nextLineNum + 1;
    var startLine = editor.document.lineAt(selection.end.line);
    var startText = _.trimRight(startLine.text);
    /** Return if there are no lines below the current selected one */
    if (lineAfterNextLineNum > totalLines) {
        console.log('JoinLines: No lines below to join');
        return;
    }
    /** Let the "joining" begin */
    editor.edit(function (editBuilder) {
        console.log('JoinLines: Joining lines');
        var nextLine = editor.document.lineAt(nextLineNum);
        var nextLineText = nextLine.text;
        joinThem(editor, editBuilder, selectedLine, nextLineText);
    }).then(function () {
        console.log('JoinLines: Lines joined. Setting selection');
        var startLineNum = selection.start.line;
        var cursorStartPos = startText.length + 1;
        var newSelection = new vscode.Selection(startLineNum, cursorStartPos, startLineNum, cursorStartPos);
        var tagSelections = [newSelection];
        editor.selections = tagSelections;
    }, function (err) {
        console.log('JoinLines: Line joined error:', err);
    });
}
function joinThem(editor, editBuilder, line, text) {
    var docLine = editor.document.lineAt(line);
    var docLineText = _.trimRight(docLine.text);
    var location = new vscode.Position(line, docLineText.length);
    var textToInsert = text === '' ? docLineText + text : docLineText + ' ' + text;
    var rangeToDelete = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line + 1, text.length));
    /** Join the lines using replace */
    editBuilder.replace(rangeToDelete, textToInsert);
}
/** this method is called when your extension is deactivated */
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map