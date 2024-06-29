// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { exec } = require('child_process');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function runPdflatex(filePath) {
    exec(`pdflatex ${filePath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        vscode.window.showInformationMessage('pdflatex completed!');
        console.log(`stdout: ${stdout}`);
    });
}

function runPdflatexInTerminal(filePath) {
    const terminal = vscode.window.createTerminal(`pdflatex: ${filePath}`);

    terminal.show(true); // this argument brings the terminal to focus
    terminal.sendText('cd $(dirname ' +  `${filePath}` + ')');
    // strip .tex 
    let filePathStrip = filePath.replace('.tex', '');

    terminal.sendText(`biber $(basename "${filePathStrip}")`);
    terminal.sendText(`pdflatex $(basename "${filePath}")`);
}


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const disposable = vscode.commands.registerCommand('latextricks.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from latextricks!');
	});
	context.subscriptions.push(disposable);


    let disposable2 = vscode.commands.registerCommand('latextricks.replaceWithCitation', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No editor is active');
            return;
        }


        const position = editor.selection.active;
        const wordRange = editor.document.getWordRangeAtPosition(position);

        if (!wordRange) {
            vscode.window.showInformationMessage('No word under cursor');
            return;
        }

        const word = editor.document.getText(wordRange);
        const replacedText = `\\parencite{${word}}`;
        
        editor.edit(editBuilder => {
            editBuilder.replace(wordRange, replacedText);
        });
        
    });

    context.subscriptions.push(disposable2);

    let disposable3 = vscode.commands.registerCommand('latextricks.replaceWithFootnote', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No editor is active');
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        if (selectedText) {
            const replacedText = `\\footnote{${selectedText}}`;
            editor.edit(editBuilder => {
                editBuilder.replace(selection, replacedText);
            });
        } else {
            vscode.window.showInformationMessage('No text is selected');
        }
    });

    context.subscriptions.push(disposable3);

    let disposable4 = vscode.commands.registerCommand('latextricks.runPdfLatex', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor!');
            return;
        }

        const document = editor.document;

        // Save the document first
        document.save().then(success => {
            if (success) {
                const filePath = document.fileName;
                runPdflatexInTerminal(filePath);
            } else {
                vscode.window.showInformationMessage('Failed to save the file!');
            }
        });
    });

    context.subscriptions.push(disposable4);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
