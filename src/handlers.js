define(function (require, exports, module) {
    'use strict';


  /**
   * Bracket modules
   */
  var CommandManager      = brackets.getModule('command/CommandManager');
  var Dialog              = brackets.getModule('widgets/Dialogs');
  var ExtensionUtils      = brackets.getModule('utils/ExtensionUtils');
  var File                = brackets.getModule('file/FileUtils');
  var PreferencesManager  = brackets.getModule('preferences/PreferencesManager');
  var Project             = brackets.getModule('project/ProjectManager');


  /**
   * Extension modules
   */
  var osFtpCommon       = require('src/common');
  var osFtpDialog       = require('src/dialog');
  var osFtpDomain       = require('src/domain');
  var osFtpGlobals      = require('src/globals');
  var osFtpHandlers     = require('src/handlers');
  var osFtpMenu         = require('src/menu');
  var osFtpScripts      = require('src/scripts');
  var osFtpStrings      = require('strings');
  var osFtpSite         = require('src/site');
  var osFtpSitesManager = require('src/sitesManager');


  /**
   * Global variables
   */
  var osFtpPreferences = PreferencesManager.getExtensionPrefs(osFtpGlobals.PREF);


  /**
   * Exported functions
   */
  exports.handleEditSite      = handleEditSite;
  exports.handleGetFromSite   = handleGetFromSite;
  exports.handleNewOrEditSite = handleNewOrEditSite;
  exports.handleRunScript     = handleRunScript;
  exports.handleRunSite       = handleRunSite;
  exports.init                = init;


  /**
   * Add a site by registering the site as a command and adding it to the context menus
   * @param {Object} site Site object containing information about this site
   */
  function addSite(site) {

    //log this call
    console.log('addSite(' + site.name + ');');

    //setup labels
    var COMMAND_RUN_SITE_LABEL = site.name;
    var COMMAND_RUN_SITE_ID    = osFtpGlobals.COMMAND_RUN_SITE_BASE_ID + site.name;

    //register command and add a context menu to create a site
    CommandManager.register(COMMAND_RUN_SITE_LABEL, COMMAND_RUN_SITE_ID, osFtpHandlers.handleRunSite);
    osFtpMenu.addToContextMenus(COMMAND_RUN_SITE_ID, false, osFtpGlobals.COMMAND_GET_FROM_SITE_ID, false);

  }


  /**
   * Enables the get command for an added site
   */
  function enableGetFromSite() {

    //log this call
    console.log('enableGetFromSite();');

    //register command and add a context menu to create a site
    CommandManager.register(osFtpStrings.COMMAND_GET_FROM_SITE_LABEL, osFtpGlobals.COMMAND_GET_FROM_SITE_ID, handleGetFromSite);
    osFtpMenu.addToContextMenus(osFtpGlobals.COMMAND_GET_FROM_SITE_ID, false, osFtpGlobals.COMMAND_NEW_SITE_ID, false);

  }


  /**
   * Enables the edit command for an added site
   */
  function enableEditSite() {

    //log this call
    console.log('enableEditSite();');

    //register command and add a context menu to create a site
    CommandManager.register(osFtpStrings.COMMAND_EDIT_SITE_LABEL, osFtpGlobals.COMMAND_EDIT_SITE_ID, handleEditSite);
    osFtpMenu.addToContextMenus(osFtpGlobals.COMMAND_EDIT_SITE_ID, false, osFtpGlobals.COMMAND_NEW_SITE_ID, false);

  }


  /**
   * Disables the get command for sites
   */
  function disableGetFromSite() {

    //log this call
    console.log('disableGetFromSite();');

    //remove from the menu
    osFtpMenu.removeFromContextMenus(osFtpGlobals.COMMAND_GET_FROM_SITE_ID);

  }


  /**
   * Disables the edit command for sites
   */
  function disableEditSite() {

    //log this call
    console.log('disableEditSite();');

    //remove from the menu
    osFtpMenu.removeFromContextMenus(osFtpGlobals.COMMAND_EDIT_SITE_ID);

  }


  /**
   * Handler for editting an added site
   */
  function handleEditSite() {

    //log that we were called
    console.log('handleEditSite()');

    //radio button site name
    var RADIO_SITE_NAME = 'site';

    //show dialog
    var selectDialog = osFtpDialog.showSiteSelectDialog(osFtpGlobals.sites, RADIO_SITE_NAME);

    var selectedSiteIndex;

    //listen for escape key
    handleEscape(selectDialog);

    //handle cancel button
    handleCancel(selectDialog);

    //listen for ok
    $('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').click(function () {

      //get the site that was checked
      selectedSiteIndex = $('input[name=' + RADIO_SITE_NAME + ']:checked').val();

      //if no option was choosen
      if (!osFtpCommon.isSet(selectedSiteIndex))
        console.log('No site was selected');

      //log that we are closing
      console.log('Dialog closed with save');

      //close the dialog
      selectDialog.close();

      //turn off listeners
      disableListeners();

    });


    //listen for dialog done
    selectDialog.done(function () {

      //log that the modal is gone
      console.log('Dialog modal is dismissed');

      //if edit site index was set
      if (osFtpCommon.isSet(selectedSiteIndex))
        CommandManager.execute(osFtpGlobals.COMMAND_NEW_SITE_ID, selectedSiteIndex);

    });

  }


  /**
   * Handler for getting from an added site
   */
  function handleGetFromSite() {

    //log that we were called
    console.log('handleGetFromSite()');

    //radio button site name
    var RADIO_SITE_NAME = 'site';

    //show dialog
    var selectDialog = osFtpDialog.showSiteSelectDialog(osFtpGlobals.sites, RADIO_SITE_NAME);

    var selectedSiteIndex;

    //listen for escape key
    handleEscape(selectDialog);

    //handle cancel button
    handleCancel(selectDialog);

    //listen for ok
    $('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').click(function () {

      //get the site that was checked
      selectedSiteIndex = $('input[name=' + RADIO_SITE_NAME + ']:checked').val();

      //if no option was choosen
      if (!osFtpCommon.isSet(selectedSiteIndex))
        console.log('No site was selected');

      //log that we are closing
      console.log('Dialog closed with save');

      //close the dialog
      selectDialog.close();

      //turn off listeners
      disableListeners();

    });


    //listen for dialog done
    selectDialog.done(function () {

      //log that the modal is gone
      console.log('Dialog modal is dismissed');

      //if edit site index was set
      if (osFtpCommon.isSet(selectedSiteIndex))
        osFtpDialog.showGetDialog(osFtpGlobals.sites[selectedSiteIndex]);

    });


  }


  /**
   * Handler function for when a new site is added or an existing site is updated
   * @param {Number} oldSiteIndex Index into sites array
   */
  function handleNewOrEditSite(oldSiteIndex) {

    //log that we were called
    console.log('handleNewOrEditSite()');

    //assume a new site
    var oldSite = false;

    var nameVal = '';
    var hostVal = '';
    var rootVal = '';
    var userVal = '';
    var passVal = '';

    //build input html ids
    var name_id = 'input-name';
    var host_id = 'input-host';
    var root_id = 'input-root';
    var user_id = 'input-user';
    var pass_id = 'input-pass';

    var errorContainer = 'input-error';

    var nameTitle;

    //if old site object is passed
    if (osFtpCommon.isSet(oldSiteIndex)) {

      //log this
      console.log('Old site presented');

      //indicate that this is an old site
      oldSite = true;

      nameVal = osFtpGlobals.sites[oldSiteIndex].name;
      hostVal = osFtpGlobals.sites[oldSiteIndex].host;
      rootVal = osFtpGlobals.sites[oldSiteIndex].root;
      userVal = osFtpGlobals.sites[oldSiteIndex].user;
      passVal = osFtpGlobals.sites[oldSiteIndex].pass;

      //set the name time
      nameTitle =  nameVal;

    }

    //build html input object
    var inputFields = [];

    if (!oldSite)
      inputFields.push({label: osFtpStrings.DIALOG_INPUT_NAME, id: name_id, value: nameVal, type: 'text'});

    inputFields.push({label: osFtpStrings.DIALOG_INPUT_HOST, id: host_id, value: hostVal, type: 'text'});
    inputFields.push({label: osFtpStrings.DIALOG_INPUT_ROOT, id: root_id, value: rootVal, type: 'text'});
    inputFields.push({label: osFtpStrings.DIALOG_INPUT_USER, id: user_id, value: userVal, type: 'text'});
    inputFields.push({label: osFtpStrings.DIALOG_INPUT_PASSWORD, id: pass_id, value: passVal, type: 'password'});

    //show dialog
    var inputDialog = osFtpDialog.showSiteDialog(inputFields, nameTitle, errorContainer);

    //hide error area
    $('#' + errorContainer).hide();

    //listen for escape key
    handleEscape(inputDialog);

    //handle cancel button
    handleCancel(inputDialog);

    //if old session
    if (oldSite) {

      //listen for delete (modal doesnt have standard id= attribute, it's data-button-id
      $('button[data-button-id="' + Dialog.DIALOG_BTN_DONTSAVE + '"').click(function () {

        //setup labels
        var COMMAND_RUN_SITE_ID = osFtpGlobals.COMMAND_RUN_SITE_BASE_ID + osFtpGlobals.sites[oldSiteIndex].name;

        //remove old site from array
        osFtpGlobals.sites.splice(oldSiteIndex, 1);

        //remove site from context menu
        osFtpMenu.removeFromContextMenus(COMMAND_RUN_SITE_ID);

        //set and save this preference
        setAndSavePref(osFtpGlobals.PREF, osFtpGlobals.PREF_SITES, osFtpGlobals.sites);

        //disable extra options if we have no more sites
        if (osFtpGlobals.sites.length == 0) {

          //remove edit option
          disableEditSite();

          //remove get option
          disableGetFromSite();
        }

        //log that the user wants to close
        console.log('Dialog closed to delete site');

        //close the dialog
        inputDialog.close();

        //turn off listeners
        disableListeners();

      });
    }

    //listen for ok
    $('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').click(function () {

      var oldSitesLength = osFtpGlobals.sites.length;

      var name = nameVal;

      //get input fields
      if (!oldSite)
        name = $('#' + name_id).val();

      var host = $('#' + host_id).val();
      var root = $('#' + root_id).val();
      var user = $('#' + user_id).val();
      var pass = $('#' + pass_id).val();

      //log input
      console.log(
        'Dialog inputs are:  ' +
        'name - ' + name + ', ' +
        'host - ' + host + ', ' +
        'root - ' + root + ', ' +
        'user - ' + user + ', ' +
        'pass - ' + '********'//pass
      );

      //force out any spaces in the name
      if (!oldSite)
        name = name.replace(/ /g, '_');

      //build site object
      var site = {
        name: name,
        host: host,
        root: root,
        user: user,
        pass: pass
      };

      //if the input is valud
      if (isValid(site, oldSite, errorContainer)) {

        // LDL5007 testing
        var newSite = new osFtpSite.Site(name, host, root, user, pass);
        osFtpSitesManager.registerSite(newSite);

        //if old site, delete its contents
        if (oldSite)
          osFtpGlobals.sites.splice(oldSiteIndex, 1);

        //save this site
        osFtpGlobals.sites.push(site);

        //set and save this preference
        setAndSavePref(osFtpGlobals.PREF, osFtpGlobals.PREF_SITES, osFtpGlobals.sites);

        //enable extra options if we have at least one site
        if (osFtpGlobals.sites.length > 0 && oldSitesLength == 0) {

          //add getting from a site
          enableGetFromSite();

          //add editing of site
          enableEditSite();

        }

        //add new site if this didnt exist before
        if (!oldSite)
          addSite(site);

        //log that we are saving this site
        console.log('Dialog closed with save');

        //close the dialog
        inputDialog.close();

        //turn off listeners
        disableListeners();

      }

    });

    //listen for dialog done
    inputDialog.done(function () {

      //log that the modal is gone
      console.log('Dialog modal is dismissed');

    });

  }


  /**
   * Validates and issues error messages for user input
   * @param   {Object}  site The inputted site
   * @returns {Boolean} Returns whether or not this site input is valid
   */
  function isValid(site, bypassName, errorContainer) {

    var isValid = true;
    var validateResponses = [];

    var errorHtml = '';

    //collect validation of each field
    if (!bypassName)
      validateResponses.push(validateSiteName(site.name));

    validateResponses.push(validateHostName(site.host));

    //process all responses
    validateResponses.forEach(function  (validateResponse) {

      //if there is one failure
      if (!validateResponse.isValid) {

        //mark this input as invalud
        isValid = false

        errorHtml += '<p class="osftp-status-error">';
        errorHtml += validateResponse.msg;
        errorHtml += '</p>';
      }

    });

    //show error area
    $('#' + errorContainer).html(errorHtml);

    //show error area
    $('#' + errorContainer).show();

    //return indicator
    return isValid;
  }


  /**
   * Validates the site name field
   * @param   {String} name Name of the site
   * @returns {Object} Contains a boolean indicator and error message if invalid
   */
  function validateSiteName(name) {

    //assume valid
    var validateResponse = {
      isValid: true,
      msg: ''
    };


    //verify at minimum a host is set
    if (!osFtpCommon.isSet(name)) {

      //this is required
      validateResponse.isValid = false;
      validateResponse.msg = osFtpStrings.DIALOG_ERROR_SITE_INVALID;
    }

    else {

      //locate the site object based on site name
      osFtpGlobals.sites.forEach(function(site) {

        //if we match on name this is an error
        if (site.name == name) {

          //site already exists
          validateResponse.isValid = false;
          validateResponse.msg = osFtpStrings.DIALOG_ERROR_SITE_EXISTS;

        }

      });
    }

    //return object
    return validateResponse;

  }


  /**
   * Validates the site host field
   * @param   {String} host Host for the site
   * @returns {Object} Contains a boolean indicator and error message if invalid
   */
  function validateHostName(host) {

    //assume valid
    var validateResponse  = {
      isValid: true,
      msg: ''
    };

    //verify at minimum a host is set
    if (!osFtpCommon.isSet(host)) {

      //this is required
      validateResponse.isValid = false;
      validateResponse.msg = osFtpStrings.DIALOG_ERROR_HOST_INVALID;
    }

    //return object
    return validateResponse;

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


  /**
   * Function driven when a file is called to be executed as an FTP script
   */
  function handleRunScript() {

    //log that we were called
    console.log('handleRunScript();');

    //get the full path to the item that was selected
    var itemFullPath = Project.getSelectedItem().fullPath;

    //determine if the file choosen is a directory or an individual file
    if (File.getDirectoryPath(itemFullPath) == itemFullPath) {

      //@TODO all for processing and ftp'ing an entire directory
      //for now, log message if an attempt is made to ftp a directory
      console.log('Select FTP script file - not a directory');

    //an individual file was choose, build a script string and invoke node to run FTP and this script
    } else {

      //invoke node js to run our ftp script file
      osFtpDomain.runFtpCommand(Project.getSelectedItem().fullPath);

    }
  }


  /**
   * Handler for executing an added site
   */
  function handleRunSite() {

    //log that we were called
    console.log('handleRunSite();');

    //get the command name
    var name = this.getName();

    //site object associated with this command name
    var thisSite;

    //locate the site object based on site name
    osFtpGlobals.sites.forEach(function(site) {

      //if we match on name this is the site we want
      if (site.name == name)
        thisSite = site;

    });

    // get the list of the selected file
    var selectedFiles = osFtpCommon.getSelectedFiles();

    //determine if the file choosen is a directory or an individual file
    if (Project.getSelectedItem().isDirectory) {

      //upload this directory
      uploadDirectory(thisSite, selectedFiles);

    //an individual file was choose, build a script string and invoke node to run FTP and this script
    } else {

      //build our ftp script
      var ftpScript = osFtpScripts.generateUploadScript(selectedFiles, thisSite);
      invokeFtpScript(ftpScript);
    }

  }


  /**
   * Initialize saved handlers and globals
   */
  function init() {

    //get saved preferences
    osFtpGlobals.sites = osFtpPreferences.get(osFtpGlobals.PREF_SITES) || [];

    //load our style sheet
    ExtensionUtils.loadStyleSheet(module, '../css/osFtp.css');

    //enable extra options if we have at least one site
    if (osFtpGlobals.sites.length > 0) {

      //add getting from a site
      enableGetFromSite();

      //add editing of site
      enableEditSite();

    }

    //add back saved sites
    osFtpGlobals.sites.forEach(function (site) {
      addSite(site);

    });

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

      //build our ftp script
      var ftpScript = osFtpScripts.generateUploadScript(fileList, site);
      invokeFtpScript(ftpScript);

      //log that we are saving this site
      console.log('Dialog closed with save');

      //close the dialog
      confirmDialog.close();

      //turn off listeners
      disableListeners();

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

      //close the dialog
      dialog.close();

      //turn off listeners
      disableListeners();

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

        //close the dialog
        dialog.close();

        //turn off listeners
        disableListeners();

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

});
