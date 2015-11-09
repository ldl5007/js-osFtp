define(function (require, exports) {
	'use strict';


	/**
	 * Bracket modules
	 */
	var CommandManager = brackets.getModule('command/CommandManager');
	var Dialog = brackets.getModule('widgets/Dialogs');
	var PreferencesManager = brackets.getModule('preferences/PreferencesManager');


	/**
	 * Extension modules
	 */
	var osFtpCommon = require('src/common');
	var osFtpDialog = require('src/dialog');
	var osFtpHandlers = require('src/handlers');
	var osFtpMenu = require('src/menu');
	var osFtpScripts = require('src/scripts');
	var osFtpStrings = require('strings');
	var osFtpSitesManager = require('src/sitesManager');
	var osFtpGlobals = require('src/globals');
	var osFtpDomain  = require('src/domain');

	/**
	 * Global variables
	 */
	var osFtpPreferences;

	/**
	 * Exported functions
	 */

	exports.addSite    = addSite;
	exports.removeSite = removeSite;
	exports.enableEditSite = enableEditSite;
	exports.disableEditSite = disableEditSite;
	exports.disableGetFromSite = disableGetFromSite;
	exports.invokeFtpScript = invokeFtpScript;
	exports.uploadDirectory = uploadDirectory;
	exports.handleCancel = handleCancel;
	exports.handleEscape = handleEscape;
	exports.disableListeners = disableListeners;
	exports.setAndSavePref = setAndSavePref;


	/**
	 * Add a site by registering the site as a command and adding it to the context menus
	 * @param {Object} site Site object containing information about this site
	 */
	function addSite(site) {

		//log this call
		console.log('addSite(' + site.name + ');');

		if (osFtpSitesManager.getSitesArray().length > 0){
			enableEditSite();
		}

		var cmdId    = site.getCommandId();
		var cmdLabel = site.getCommandLabel();

		//register command and add a context menu to create a site
		CommandManager.register(cmdLabel, cmdId, osFtpHandlers.handleRunSite);
		osFtpMenu.addToContextMenus(cmdId, false, osFtpGlobals.COMMAND_EDIT_SITE_ID, false);
	}

	/**
	 * Remove a site from menu
	 *
	 */

	function removeSite(site) {
		console.log('remove(' + site.name + ')');

		//remove site from context menu
		var cmdId = site.getCommandId();
		osFtpMenu.removeFromContextMenus(cmdId);

		if (osFtpSitesManager.getSitesArray().length == 0){
			disableEditSite();
		}
	}


	/**
	 * Enables the edit command for an added site
	 */
	function enableEditSite() {

		//log this call
		console.log('enableEditSite();');

		//register command and add a context menu to create a site
		CommandManager.register(osFtpStrings.COMMAND_EDIT_SITE_LABEL, osFtpGlobals.COMMAND_EDIT_SITE_ID, osFtpHandlers.handleEditSite);
		osFtpMenu.addToContextMenus(osFtpGlobals.COMMAND_EDIT_SITE_ID, false, osFtpGlobals.COMMAND_NEW_SITE_ID, false);
	}


	/**
	 * Disables the get command for sites (cannot deregister the command)
	 */
	function disableGetFromSite() {

		//log this call
		console.log('disableGetFromSite();');

		//remove from the menu
		osFtpMenu.removeFromContextMenus(osFtpGlobals.COMMAND_GET_FROM_SITE_ID);

	}


	/**
	 * Disables the edit command for sites (cannot deregister the command)
	 */
	function disableEditSite() {

		//log this call
		console.log('disableEditSite();');

		//remove from the menu
		osFtpMenu.removeFromContextMenus(osFtpGlobals.COMMAND_EDIT_SITE_ID);

	}


	/**
	 * [[Description]]
	 * @param {Object} site Object representing the site to upload to
	 */
	function invokeFtpScript(ftpScript) {

		//if the script is defined
		if (osFtpCommon.isSet(ftpScript)) {

			//select the file name we want to create
			var scriptFileName = osFtpGlobals.FTP_SCRIPT_FILE_NAME + osFtpGlobals.FTP_SCRIPT_FILE_EXTENSION;

			//invoke node js to build and run our ftp script file
			osFtpDomain.runFtpCommandStdin(scriptFileName, ftpScript);

		}
	}


	/**
	 * [[Description]]
	 * @param {Object} site Object representing the site to upload to
	 */
	function uploadDirectory(site, fileList) {

		//show dialog
		var confirmDialog = osFtpDialog.showConfirmDirectoryUpload(site);

		//listen for escape key
		handleEscape(confirmDialog);

		//handle cancel button
		handleCancel(confirmDialog);

		//listen for ok
		$('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').click(function () {

			//log that we are saving this site
			console.log('Dialog closed with save');

			//turn off listeners
			disableListeners();

			//close the dialog
			confirmDialog.close();

			//build our ftp script
			var ftpScript = osFtpScripts.generateUploadScript(fileList, site);

			//invoke script
			invokeFtpScript(ftpScript);

		});


		//listen for dialog done
		confirmDialog.done(function () {

			//log that the modal is gone
			console.log('Dialog modal is dismissed');

		});

	}


	/**
	 * Handle CANCEL button for all dialogs
	 * @param {Object} dialog Dialog object
	 */
	function handleCancel(dialog) {

		//listen for cancel (modal doesnt have standard id= attribute, it's data-button-id
		$('button[data-button-id="' + Dialog.DIALOG_BTN_CANCEL + '"').click(function () {

			//log that the user wants to close
			console.log('Dialog closed without save');

			//turn off listeners
			disableListeners();

			//close the dialog
			dialog.close();

		});

	}


	/**
	 * Handle escape button for all dialogs
	 * @param {Object} dialog Dialog object
	 */
	function handleEscape(dialog) {

		//listener for escape key
		$(document).keyup(function (event) {

			//close if escape key is pressed
			if (event.which == osFtpGlobals.ESCAPE_KEY) {

				//log that the user wants to close
				console.log('Dialog escaped without save');

				//turn off listeners
				disableListeners();

				//close the dialog
				dialog.close();

			}

		});

	}


	/**
	 * Disable all active listeners
	 */
	function disableListeners() {

		//turn off OK listener
		$('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').off('click');

		//turn off ESCAPE listener
		$(document).off('keyup');

		//turn off CANCEL listener
		$('button[data-button-id="' + Dialog.DIALOG_BTN_CANCEL + '"').off('click');

	}


	/**
	 * Set a preference value with its key and save
	 * @param {String} prefFile Preference file
	 * @param {String} key      Preference key value
	 * @param {Object} value    Any variable type associated with the key
	 */
	function setAndSavePref(prefFile, key, value) {

		//set in preferences
		osFtpPreferences.set(key, value);

		//save
		osFtpPreferences.save(prefFile);
	}


});
