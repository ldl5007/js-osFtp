/**
 *  Sites Manager
 */


define(function (require, exports, module) {
  'use strict';

	/**
	 * Exetension modules
	 */

	var osFtpGlobals = require('src/globals');
	var osFtpCommon  = require('src/common');
	var osFtpSite    = require('src/site');

	exports.getAllSites = getAllSites;
	exports.registerSite = registerSite;
	exports.removeSite   = removeSite;

	var sitesList = [];

	function registerSite(newSite){
		var returnStatus = false;

		if (osFtpSite.validateSite(newSite)){
			var tempSite = getSiteByName(newSite.name);

			if (osFtpCommon.isSet(tempSite)){
				var index = sitesList.indexOf(tempSite);
				sitesList[index] = newSite;
			 }
			 else{
				sitesList.push(newSite);
			}

			returnStatus = true;

        }

        console.log(sitesList);

		return returnStatus;
	}


	function removeSite(siteName){
		var returnStatus = false;

		var Site = getSiteByName(siteName);
		if (osFtpSite.validateSite(Site)){
			var index = sitesList.indexOf(Site);
			sitesList.splice(index, 1);

			returnStatus = true;
		}

		return returnStatus;
	}


	function getSiteByName(name){
		var returnSite = undefined;

		for (var i = 0; i < sitesList.length; i++){
			if (sitesList[i].name == name){
				returnSite = sitesList[i];
				break;
			}
		}

		return returnSite;
	}



	function getAllSites(){
		return sitesList;
	}

});
