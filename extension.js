// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs')
const axios = require('axios');

//const { text } = require('stream/consumers');

const token = fs.readFile('token.txt', function (err, token) {
	if (err) {
	   return console.error(err);
	}
	//console.log(token.toString()) This confirms that the key was read correctly
	return token.toString()
 });

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, supertranslator is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let setAPIK = vscode.commands.registerCommand('supertranslator.SetAPIkey', function(){
		const editor = vscode.window.activeTextEditor
		const selection = editor.selection
		const text = selection.isEmpty ? editor.document.getText() : editor.document.getText(editor.selection);

		if (text == null){
			vscode.window.showErrorMessage("Select the api key and run this command.")
		}

		fs.open("token.txt", "w",function (err, f) {
			if (err === null){
				fs.write(Number(f), text, (err)=>{
					if (err === null){
						console.log("Token written");
					}
					fs.close(f)
				})
				console.log("Token saved");
			}
		  })


	})

	let disposable = vscode.commands.registerCommand('supertranslator.Translate', function () {
		const editor = vscode.window.activeTextEditor
		const selection = editor.selection
		const text = selection.isEmpty ? editor.document.getText() : editor.document.getText(editor.selection);
		console.log(text)

		const options = {
		  method: 'POST',
		  url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
		  params: {'api-version': '3.0', to: 'en', textType: 'plain', profanityAction: 'NoAction'},
		  headers: {
			'content-type': 'application/json',
			'x-rapidapi-host': 'microsoft-translator-text.p.rapidapi.com',
			'x-rapidapi-key': String(token).toString()
		  },
		  data: [{Text: text}]
		};
		//console.log(options.headers[2]) It returns undefined
		
		// @ts-ignore
		axios.request(options).then(function (response) {
			if (response.data[0].detectedLanguage.language == "en"){
				vscode.window.showInformationMessage("That's already in english!!")
			}else {
				vscode.window.showInformationMessage(response.data[0].translations[0].text);
			}
			
		}).catch(function (error) {
			console.error(error);
		});
})

	context.subscriptions.push(disposable);
	context.subscriptions.push(setAPIK)
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
