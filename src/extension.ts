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
	var disposable = vscode.commands.registerCommand('joinLines.joinLines', () => {
        joinLines();
	});

	context.subscriptions.push(disposable);
}

function joinLines () {
    const editor = vscode.window.activeTextEditor;

    /** If editor is undefined just return */
    if(editor == undefined) {
        console.log('JoinLines: No editor');
        return;
    }

    const selection = editor.selection;
    const selectedLine = selection.start.line;
    const totalLines = editor.document.lineCount;
    const nextLineNum = selectedLine + 1;
    const lineAfterNextLineNum = nextLineNum + 1;

    const startLine = editor.document.lineAt(selection.end.line);
    const startText = _.trimRight(startLine.text);

    /** Return if there are no lines below the current selected one */
    if(lineAfterNextLineNum > totalLines) {
        console.log('JoinLines: No lines below to join');
        return;
    }

    /** Let the "joining" begin */
    editor.edit((editBuilder) => {
        console.log('JoinLines: Joining lines');
        const nextLine = editor.document.lineAt(nextLineNum);
        const nextLineText = nextLine.text;

        joinThem(editor, editBuilder, selectedLine, nextLineText);
    }).then(() => {
        console.log('JoinLines: Lines joined. Setting selection');

        const startLineNum = selection.start.line;
        const cursorStartPos = startText.length + 1;

        const newSelection: vscode.Selection = new vscode.Selection(startLineNum, cursorStartPos, startLineNum, cursorStartPos);
        const tagSelections: vscode.Selection[] = [newSelection];

        editor.selections = tagSelections;
    }, (err) => {
        console.log('JoinLines: Line joined error:', err);
    });
}

function joinThem (editor, editBuilder, line, text){
    const docLine = editor.document.lineAt(line);
    const docLineText = _.trimRight(docLine.text);
    const location = new vscode.Position(line, docLineText.length);
    const textToInsert = text === '' ? docLineText + text : docLineText + ' ' + text;

    const rangeToDelete = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line + 1, text.length));

    /** Join the lines using replace */
    editBuilder.replace(rangeToDelete, textToInsert);
}

/** this method is called when your extension is deactivated */
export function deactivate() {
}