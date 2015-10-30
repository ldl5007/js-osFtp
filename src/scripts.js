/**
 * @TODO - this fails for FTPing folders located in 'C:\Users\Dan\AppData\Roaming\Brackets\extensions\user\js-osFtp'
 *          - local directory is set to C:\System32 ?
 */

define(function (require, exports, module) {
	'use strict';


	/**
	 * Bracket modules
	 */
	var FileUtils = brackets.getModule('file/FileUtils');


	/**
	 * Extension modules
	 */
	var osFtpCommon = require('src/common');
	var Preferences = require("src/preferences");

	/**
	 * Exported functions
	 */
	exports.generateUploadScript = generateUploadScript;

	/**
	 * Build an FTP script based on the list files that was choosen and the site selected
	 * @param   {Object []} listFile  Array of selected file to be FTP
	 * @param   {Object}    site      Site object containing information about the site to use
	 * @returns {String}              Completed FTP script if input is valid
	 *                                Empty string when input in invalid.
	 */

	function generateUploadScript(listFile, site) {
		console.log("getneratUploadScript");

		// validating inputs
		if (listFile == undefined) {
			console.error('listFile is undefinded');
			return ''
		}
		if (site == undefined) {
			console.error('site is undefinded');
			return ''
		}

		var returnScriptString = '';
		var localRootDir = '';
		var newScript = [];
		var mkdirList = [];
		var putBinList = [];
		var putAsciiList = [];

		for (var i = 0; i < listFile.length; i++) {
			if (localRootDir == '') {
				localRootDir = FileUtils.stripTrailingSlash(listFile[i].rootDir);
			}

			mkdirList = generateMkDirList(mkdirList, listFile[i].relativeDir);

			if (isAsciiFileMode(listFile[i].relativePath)) {
				putAsciiList.push(listFile[i].relativePath);
			} else {
				putBinList.push(listFile[i].relativePath);
			}
		}

		//---------------------------------------------------------------------
		// Start generating the FTP script
		//---------------------------------------------------------------------

		// Generate logon command:
		newScript.push('OPEN ' + site.host);
		newScript.push('USER');
		newScript.push(site.user);
		newScript.push(site.pass);

		newScript.push('CD  ' + site.root);
		newScript.push('LCD ' + localRootDir);


		// Generate mkdir commands
		for (var i = 0; i < mkdirList.length; i++) {
			newScript.push('MKDIR ' + mkdirList[i]);
		}

		// Generate put ASCII commands
		newScript.push('ASCII');
		for (var i = 0; i < putAsciiList.length; i++) {
			newScript.push('PUT ' + '"' + FileUtils.convertToNativePath(putAsciiList[i]) + '"' +
				' ' + FileUtils.convertWindowsPathToUnixPath(putAsciiList[i]).split(' ').join('_'));
		}

		// Generate put Binary commands
		newScript.push('BIN');
		for (var i = 0; i < putBinList.length; i++) {
			newScript.push('PUT ' + '"' + FileUtils.convertToNativePath(putBinList[i]) + '"' +
				' ' + FileUtils.convertWindowsPathToUnixPath(putBinList[i]).split(' ').join('_'));
		}

		// End of script
		newScript.push('QUIT');

		for (var i = 0; i < newScript.length; i++) {
			returnScriptString = returnScriptString + newScript[i] + '\n';
		}

		//console.log(returnScriptString);

		return returnScriptString;
	}

	/**
	 * Generate a list of directory that may need to be created before PUT commands
	 * @param   {String []} currentList current list of the directory
	 * @param   {String}    dirPath     directory path to be consider
	 * @returns {String []} Return Updated version of currentList
	 */

	function generateMkDirList(currentList, dirPath) {
		var tempPath = FileUtils.convertWindowsPathToUnixPath(dirPath);
		var listNode = tempPath.split('/');

		console.log(listNode);

		var tempDir = ''
		for (var i = 0; i < listNode.length; i++) {
			if (listNode[i] != '') {
				if (tempDir == '') {
					tempDir = listNode[i];
				} else {
					tempDir = tempDir + '/' + listNode[i];
				}

				console.log(tempDir);
				if (currentList.indexOf(tempDir) == -1) {
					currentList.push(tempDir);
				}
			}
		}

		return currentList;
	}


	/**
	 * Check known extensions to see whether ftp should be done in ascii mode
	 * @param   {String}  InputFile file name including extension
	 * @returns {Boolean} Returns true if this extension should be ftp'ed as ascii
	 */

	function isAsciiFileMode(inputFile) {
		var returnStatus = false;

		// Getting list from preferences
		var asciiFileList = JSON.parse(Preferences.get('transferAsAsciiTable')).tableData;
		var noExtAsAscii  = Preferences.get('treatFileWithoutExtentionAsAscii');

		// Extract file extension.
		var fileExt = FileUtils.getFileExtension(inputFile);


		if (asciiFileList.indexOf(fileExt.toUpperCase()) != -1) {
			returnStatus = true;
		} else if (!osFtpCommon.isSet(fileExt)){
			if (noExtAsAscii){
				returnStatus = true;
			}
		}

		return returnStatus;
	}

});
