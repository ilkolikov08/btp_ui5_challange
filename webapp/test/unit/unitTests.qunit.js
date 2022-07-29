/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sapbtp/ui5_challange/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
