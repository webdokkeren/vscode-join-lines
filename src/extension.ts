/**
 * Import modules
 * The module 'vscode' contains the VS Code extensibility API
 */
import * as vscode from 'vscode';
import _ = require('lodash');

const settings: { document: vscode.TextDocument } = {
    document: undefined
};

const whitespaceAtEndOfLine = /\s*$/;

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

function joinLines (textEditor: vscode.TextEditor) {

    /** If editor is undefined just return */
    if(textEditor == undefined) {
        return;
    }

    settings.document = textEditor.document;
    const newSelections: { numLinesRemoved: number, selection: vscode.Selection }[] = [];

    /** Let the "joining" begin */
    textEditor.edit(processSelections).then(postProcess);

    function processSelections(editBuilder: vscode.TextEditorEdit) {
        /** Process each selection */
        textEditor.selections.forEach(processSelection);

        function processSelection(selection: vscode.Selection){
            if (noRangeOneLine(selection)) {
                return newSelections.push(joinSimple(selection, editBuilder));
            }

            if (rangeOneLine(selection)) {
                //TODO: Does not work properly with multiline
                joinThem(selection.start.line, editBuilder);

                return newSelections.push({ numLinesRemoved: 1, selection });
            }

            const numberOfCharactersOnFirstLine = settings.document.lineAt(selection.start.line).range.end.character;
            let endCharacterOffset = 0;
            for (let lineIndex = selection.start.line; lineIndex <= selection.end.line - 1; lineIndex++) {
                const charactersInLine = lineIndex == selection.end.line - 1 ? selection.end.character + 1 : settings.document.lineAt(lineIndex + 1).range.end.character + 1;
                const whitespaceLengths = joinThem(lineIndex, editBuilder);
                endCharacterOffset += charactersInLine - whitespaceLengths.whitespaceLengthAtEnd - whitespaceLengths.whitespaceLengthAtStart;
            }
            return newSelections.push({
                numLinesRemoved: selection.end.line - selection.start.line,
                selection: new vscode.Selection(
                    selection.start.line, selection.start.character,
                    selection.start.line, numberOfCharactersOnFirstLine + endCharacterOffset)
            });
        }
    }

    function postProcess(){
        const selections = newSelections.map(selectionPostProcessor);

        textEditor.selections = selections;

        function selectionPostProcessor(x, i){
            const { numLinesRemoved, selection } = x;

            let numPreviousLinesRemoved = i;

            if(numPreviousLinesRemoved != 0 ) {
                numPreviousLinesRemoved = newSelections.slice(0, i).map(x => x.numLinesRemoved).reduce((a, b) => a + b);
            }

            const newLineNumber = selection.start.line - numPreviousLinesRemoved;

            return new vscode.Selection(
                newLineNumber,
                selection.start.character,
                newLineNumber,
                selection.end.character
            );
        }
    }
}

function joinSimple(selection: vscode.Selection, editBuilder: vscode.TextEditorEdit){
    //TODO: Does not work with a cursor on last line
    //TODO: Dees not work when cursors following the first are not at the start line
    //TODO: Does not work multiple cursors on one line
    const newSelectionEnd = settings.document.lineAt(selection.start.line).range.end.character - joinThem(selection.start.line, editBuilder).whitespaceLengthAtEnd;

    return {
        numLinesRemoved: 1,
        selection: new vscode.Selection(
            selection.start.line,
            newSelectionEnd,
            selection.end.line,
            newSelectionEnd
        )
    }
}

function rangeOneLine(range: vscode.Range): boolean {
    return range.start.line === range.end.line;
}

function noRangeOneLine(range: vscode.Range): boolean {
    return rangeOneLine(range) && range.start.character === range.end.character;
}

function joinThem(line: number, editBuilder: vscode.TextEditorEdit): { whitespaceLengthAtEnd: number, whitespaceLengthAtStart: number } {
    const docLine = settings.document.lineAt(line);
    const nextLineNum = line + 1;
    const matchWhitespaceAtEnd = docLine.text.match(whitespaceAtEndOfLine);
    const whitespaceLength = matchWhitespaceAtEnd[0].length;

    let range;

    /** End of the line */
    if((settings.document.lineCount - 1) == line){
        range = new vscode.Range(
            line,
            docLine.range.end.character - whitespaceLength,
            nextLineNum,
            docLine.range.end.character
        );

        editBuilder.replace(range, '');

        return {
            whitespaceLengthAtEnd: whitespaceLength,
            whitespaceLengthAtStart: 0
        }
    }

    const docNextLine = settings.document.lineAt(nextLineNum);
    range = new vscode.Range(
        line,
        docLine.range.end.character - whitespaceLength,
        nextLineNum,
        docNextLine.firstNonWhitespaceCharacterIndex
    );

    editBuilder.replace(range, ' ');

    return {
        whitespaceLengthAtEnd: whitespaceLength - 1,
        whitespaceLengthAtStart: docNextLine.firstNonWhitespaceCharacterIndex
    }
}