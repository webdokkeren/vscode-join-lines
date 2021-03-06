/**
 * Import modules
 * The module 'vscode' contains the VS Code extensibility API
 */
var vscode = require('vscode');
var _ = require('lodash');
var settings = {
    document: undefined,
    multiSelections: false
};
var whitespaceAtEndOfLine = /\s*$/;
/**
 * this method is called when the extension is activated
 * the extension is activated the very first time joinLines is executed
 */
function activate(context) {
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
    /** Create array for new selections */
    var newSelections = [];
    /** Let the "joining" begin */
    textEditor.edit(processSelections).then(postProcess);
    function processSelections(editBuilder) {
        var firstSelectionLine = textEditor.selections[0].end.line;
        var lastSeletionLine = textEditor.selections[textEditor.selections.length - 1].end.line;
        /** Determine if there are multiple selections */
        settings.multiSelections = firstSelectionLine != lastSeletionLine;
        /** Reverse selection if active cusor is not on first selection line */
        var editorSelections = firstSelectionLine > lastSeletionLine ? textEditor.selections.reverse() : textEditor.selections;
        /** Process each selection */
        editorSelections.forEach(processSelection);
        /** Process a single selection */
        function processSelection(selection) {
            /** No selection */
            if (noRangeOneLine(selection)) {
                return newSelections.push(joinSimple(selection, editBuilder));
            }
            if (rangeOneLine(selection)) {
                return newSelections.push(joinSelection(selection, editBuilder));
            }
        }
    }
    function postProcess() {
        /** Used to keep track of the charecter length */
        var previousSelections = {
            totalLength: 0
        };
        /** Process selections using the Array map function */
        var selections = newSelections.map(selectionPostProcessor);
        /** Set new selections in the editor */
        textEditor.selections = selections;
        /** Processes all selection and sets new selection for each one */
        function selectionPostProcessor(x, i) {
            var numLinesRemoved = x.numLinesRemoved, selection = x.selection, originalText = x.originalText, isRangeSelection = x.isRangeSelection;
            var numPreviousLinesRemoved = i;
            var activeLineChar;
            var anchorChar;
            if (numPreviousLinesRemoved != 0 && !isRangeSelection) {
                numPreviousLinesRemoved = newSelections.slice(0, i).map(function (x) { return x.numLinesRemoved; }).reduce(function (a, b) { return a + b; });
                anchorChar = previousSelections.totalLength + _.trim(originalText).length + 1;
                activeLineChar = previousSelections.totalLength + _.trim(originalText).length + 1;
                previousSelections.totalLength = activeLineChar;
            }
            else if (numPreviousLinesRemoved != 0 && isRangeSelection) {
                numPreviousLinesRemoved = newSelections.slice(0, i).map(function (x) { return x.numLinesRemoved; }).reduce(function (a, b) { return a + b; });
                anchorChar = previousSelections.totalLength + 1;
                activeLineChar = previousSelections.totalLength + _.trim(originalText).length + 1;
                previousSelections.totalLength = activeLineChar;
            }
            else {
                anchorChar = selection.start.character;
                activeLineChar = selection.end.character;
                previousSelections.totalLength = previousSelections.totalLength + activeLineChar;
            }
            var newLineNumber = selection.start.line - numPreviousLinesRemoved;
            /** Return new selection */
            return new vscode.Selection(newLineNumber, anchorChar, newLineNumber, activeLineChar);
        }
    }
}
/**
 * This function joins lines with any range selections
 */
function joinSimple(selection, editBuilder) {
    var currentLine = settings.document.lineAt(selection.start.line);
    var newSelectionEnd = currentLine.range.end.character - joinThem(selection.start.line, editBuilder).whitespaceLengthAtEnd;
    return {
        numLinesRemoved: 1,
        isRangeSelection: false,
        selection: new vscode.Selection(selection.start.line, newSelectionEnd, selection.end.line, newSelectionEnd),
        originalText: currentLine.text
    };
}
/**
 * This function joins lines with range selections
 */
function joinSelection(selection, editBuilder) {
    var newSelectionEnd = joinThem(selection.start.line, editBuilder).whitespaceLengthAtEnd;
    /** Create default joinedSelection object */
    var joinedSelection = {
        numLinesRemoved: 1,
        isRangeSelection: false,
        selection: selection,
        originalText: settings.document.lineAt(selection.start.line).text
    };
    /** Create new selection if there are multiple selections */
    if (settings.multiSelections) {
        joinedSelection.selection = new vscode.Selection(selection.start.line, selection.start.character, selection.end.line, newSelectionEnd);
        joinedSelection.isRangeSelection = true;
    }
    return joinedSelection;
}
/** Determines whether the input range only includes one line */
function rangeOneLine(range) {
    return range.start.line === range.end.line;
}
/** Determines whether the input range doesn't have a range and is on one line */
function noRangeOneLine(range) {
    return rangeOneLine(range) && range.start.character === range.end.character;
}
function joinThem(line, editBuilder) {
    var docLine = settings.document.lineAt(line);
    var nextLineNum = line + 1;
    var matchWhitespaceAtEnd = docLine.text.match(whitespaceAtEndOfLine);
    var whitespaceLength = matchWhitespaceAtEnd[0].length;
    var endRangeChar;
    var whitespaceLengthAtStart;
    var replacementText;
    /** End of the line, no more lines in the document */
    if ((settings.document.lineCount - 1) == line) {
        endRangeChar = docLine.range.end.character;
        whitespaceLengthAtStart = 0;
        replacementText = '';
    }
    else {
        var docNextLine = settings.document.lineAt(nextLineNum);
        endRangeChar = docNextLine.firstNonWhitespaceCharacterIndex;
        whitespaceLengthAtStart = docNextLine.firstNonWhitespaceCharacterIndex;
        replacementText = ' ';
    }
    var range = new vscode.Range(line, docLine.range.end.character - whitespaceLength, nextLineNum, endRangeChar);
    editBuilder.replace(range, replacementText);
    return {
        whitespaceLengthAtEnd: whitespaceLength - 1,
        whitespaceLengthAtStart: whitespaceLengthAtStart
    };
}
//# sourceMappingURL=extension.js.map