/**
 * Import modules
 * The module 'vscode' contains the VS Code extensibility API
 */
import * as vscode from 'vscode';
import _ = require('lodash');

/**
 * this method is called when the extension is activated
 * the extension is activated the very first time joinLines is executed
 */
export function activate(context: vscode.ExtensionContext) {

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

function joinLines (textEditor) {

    /** If editor is undefined just return */
    if(textEditor == undefined) {
        console.log('JoinLines: No editor');
        return;
    }

    const selection = textEditor.selection;
    const selectedLine = selection.start.line;
    const totalLines = textEditor.document.lineCount;
    const nextLineNum = selectedLine + 1;
    const lineAfterNextLineNum = nextLineNum + 1;

    const startLine = textEditor.document.lineAt(selection.end.line);
    const startText = _.trimRight(startLine.text);

    /** Return if there are no lines below the current selected one */
    if(lineAfterNextLineNum > totalLines) {
        console.log('JoinLines: No lines below to join');
        return;
    }

    /** Let the "joining" begin */
    textEditor.edit((editBuilder) => {
        console.log('JoinLines: Joining lines');
        const nextLine = textEditor.document.lineAt(nextLineNum);
        const nextLineText = nextLine.text;

        joinThem(textEditor, editBuilder, selectedLine, nextLineText);
    }).then(() => {
        console.log('JoinLines: Lines joined. Setting selection');

        const startLineNum = selection.start.line;
        const cursorStartPos = startText.length + 1;

        const newSelection: vscode.Selection = new vscode.Selection(startLineNum, cursorStartPos, startLineNum, cursorStartPos);
        const tagSelections: vscode.Selection[] = [newSelection];

        textEditor.selections = tagSelections;
    }, (err) => {
        console.log('JoinLines: Line joined error:', err);
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
function joinThem (editor, editBuilder, line, text){
    const nextLineText = _.trim(text);
    const firstLine = editor.document.lineAt(line);
    const firstLineText = _.trimRight(firstLine.text);
    const location = new vscode.Position(line, firstLineText.length);
    const textToInsert = nextLineText === '' ? firstLineText + nextLineText : firstLineText + ' ' + nextLineText;

    const rangeToDelete = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line + 1, text.length));

    /** Join the lines using replace */
    editBuilder.replace(rangeToDelete, textToInsert);
}