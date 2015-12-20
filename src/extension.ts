// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	var disposable = vscode.commands.registerCommand('extension.sayHello', () => {
		// The code you place here will be executed every time your command is executed

        const editor = vscode.window.activeTextEditor;

        if(editor != undefined){
            const selection = editor.selection;
            const selectionEnd = selection.end;
            const selectedLine = selectionEnd.line;

            editor.edit((editBuilder) => {

                const specificLine = editor.document.lineAt(1);
                const specificLineText = specificLine.text;
                const specificLineTextLength = specificLineText.length;

                const lineToDelete = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(1, 0));
                editBuilder.delete(lineToDelete);

            }).then(() => {
                console.log('Line joined');
            }, (err) => {
                console.log('Line joint error:', err);
            });

            // Display a message box to the user
            vscode.window.showInformationMessage('I SHALL JOIN YOU! THE LINE IS:' + selectedLine);
        } else {
            // Display a message box to the user
            vscode.window.showInformationMessage('Y U NO EDITOR!');
        }

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}