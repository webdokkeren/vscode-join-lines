// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Join lines extension activated!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	var disposable = vscode.commands.registerCommand('extension.joinLines', () => {
		// The code you place here will be executed every time your command is executed

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

    const selectedLine = editor.selection.start.line;
    const totalLines = editor.document.lineCount;
    const nextLineNum = selectedLine + 1;
    const lineAfterNextLineNum = nextLineNum + 1;

    /** Return if there are no lines below the current selected one */
    if(lineAfterNextLineNum > totalLines) {
        console.log('JoinLines: No lines below to join');
        return;
    }

    /** Let the "joining" begin */
    editor.edit((editBuilder) => {
        const nextLine = editor.document.lineAt(nextLineNum);
        const nextLineText = nextLine.text;

        joinThem(editor, editBuilder, selectedLine, nextLineText);

    }).then(() => {
        console.log('JoinLines: Line joined');
    }, (err) => {
        console.log('JoinLines: Line joint error:', err);
    });
}

function joinThem (editor, editBuilder, line, text){
    const docLine = editor.document.lineAt(line);
    const docLineText = docLine.text;
    const location = new vscode.Position(line, docLineText.length);
    const textToInsert = text === '' ? text : ' ' + text;

    const rangeToDelete = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line + 1, text.length));

    /** Append next lines text to the current one with a space between them */
    editBuilder.replace(rangeToDelete, docLineText + textToInsert);
}

/** this method is called when your extension is deactivated */
export function deactivate() {
}