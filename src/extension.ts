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
                const totalLines = editor.document.lineCount;
                const nextLineNum = selectedLine + 1;
                const lineAfterNextLineNum = nextLineNum + 1;

                if(lineAfterNextLineNum > totalLines) {
                    vscode.window.showInformationMessage('NO LINES BENEETH');
                    return;
                }

                const nextLine = editor.document.lineAt(nextLineNum);
                const nextLineText = nextLine.text;

                const nextLinePos = new vscode.Position(nextLineNum, 0);
                let lineAfterNextPost;

                if(lineAfterNextLineNum === totalLines){
                    lineAfterNextPost = new vscode.Position(nextLineNum, nextLineText.length);
                } else {
                    lineAfterNextPost = new vscode.Position(lineAfterNextLineNum, 0);
                }

                const rangeToDelete = new vscode.Range(nextLinePos, lineAfterNextPost);

                var hep = editor.document.lineAt(selectedLine);
                var hepi = hep.text;
                var heo = hepi.length;

                // Insert line
                let location = new vscode.Position(selectedLine, heo);

                editBuilder.delete(rangeToDelete);
                editBuilder.insert(location, ' ' + nextLineText);

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