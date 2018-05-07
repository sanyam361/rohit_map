/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("sap.zzem.fo.visibility.util.formatter"); 
/**
 @class formatter
 @public
 @type {Object}
 */
sap.zzem.fo.visibility.util.formatter = {};

/**
 * Inits the formatter
 * @param {Object} oResourceBundle ResouceBundle from model
 */
sap.zzem.fo.visibility.util.formatter.init = function(oResourceBundle) {
    sap.zzem.fo.visibility.util.formatter._oBundle = oResourceBundle;
    jQuery.sap.require("sap.ui.core.format.DateFormat");
    sap.zzem.fo.visibility.util.formatter.LocalDateFormatter = sap.ui.core.format.DateFormat.getDateInstance();
    sap.zzem.fo.visibility.util.formatter.LocalTimeFormatter = sap.ui.core.format.DateFormat.getTimeInstance();
    sap.zzem.fo.visibility.util.formatter.EventMessageDateFormatter = sap.ui.core.format.DateFormat.getDateInstance({
        pattern: "yyyyMMdd"
    });
    sap.zzem.fo.visibility.util.formatter.EventMessageTimeFormatter = sap.ui.core.format.DateFormat.getTimeInstance({
        pattern: "hhmmss"
    });
};

/**
 * Formates an address
 * @param {string} adress Address field from backend with slashes
 * @returns {string} The formatted address.
 */
sap.zzem.fo.visibility.util.formatter.AddressFormatter = function(adress) {
    if (adress) {
        return adress.replace(/\//g, "\n");
    }
    return "";
};

/**
 * Formatter for ID(Description)
 * @param {string} ID first property
 * @param {string} Description second property
 * @returns {string} The formatted string.
 */
sap.zzem.fo.visibility.util.formatter.ObjectFormatter = function(ID, Description) {
    if (Description) {
        if (ID) {
            return ID + " (" + Description + ")";
        }
        return Description;
    }
    if (ID) {
        return ID;
    }
    return "";
};

/**
 * Formatter for ID - Description
 * @param {string} ID first property
 * @param {string} Description second property
 * @returns {string} The formatted string.
 */
sap.zzem.fo.visibility.util.formatter.MinusFormatter = function(ID, Description) {
    if (Description) {
        if (ID) {
            return ID + " - " + Description;
        }
        return Description;
    }
    if (ID) {
        return ID;
    }
    return "";
};

/**
 * Formatter for icons
 * @param {int} eventStatus Extended eventStatus
 * @returns {string} The icon url.
 */
sap.zzem.fo.visibility.util.formatter.iconFormatter = function(eventStatus) {
    switch (eventStatus) {
        case "01":
            return "accept";
        case "02":
            return "alert";
        case "03":
            return "future";
        case "04":
            return "status-inactive";
        case "05":
            return "warning2";
        case "06":
        case "07":
            return "lateness";
        default:
            return "";
    }
};

/**
 * Formatter for icon tooltips
 * @param {int} eventStatus Extended eventStatus
 * @returns {string} The icon tooltip.
 */
sap.zzem.fo.visibility.util.formatter.iconTooltipFormatter = function(eventStatus) {
    var sEventStatus = "";
    switch (eventStatus) {
        case "01":
            sEventStatus = sap.zzem.fo.visibility.util.formatter._oBundle.getText("EVENT_STATUS_REPORTED");
            break;
        case "02":
            sEventStatus = sap.zzem.fo.visibility.util.formatter._oBundle.getText("EVENT_STATUS_OVERDUE");
            break;
        case "03":
            sEventStatus = sap.zzem.fo.visibility.util.formatter._oBundle.getText("EVENT_STATUS_UNREP_DATE");
            break;
        case "04":
            sEventStatus = sap.zzem.fo.visibility.util.formatter._oBundle.getText("EVENT_STATUS_UNREP");
            break;
        case "05":
            sEventStatus = sap.zzem.fo.visibility.util.formatter._oBundle.getText("EVENT_STATUS_UNEXPECTED");
            break;
        case "06":
            sEventStatus = sap.zzem.fo.visibility.util.formatter._oBundle.getText("EVENT_STATUS_REPORTED_EARLY");
            break;
        case "07":
            sEventStatus = sap.zzem.fo.visibility.util.formatter._oBundle.getText("EVENT_STATUS_REPORTED_LATE");
            break;
        default:
            sEventStatus = "";
    }
    return sEventStatus;
};

/**
 * Formatter for datetime in Forms
 * @param {Object} date The date of the event
 * @param {string} timeZone the timezone of the event
 * @returns {string} The local formatted DateTime.
 */
sap.zzem.fo.visibility.util.formatter.DateTimeFormatter = function(date, timeZone) {
    if (!timeZone) {
        timeZone = "";
    }
    if (date) {
        var utcDate = new Date(date.getUTCFullYear().toString(), date.getUTCMonth().toString(), date.getUTCDate().toString(),
            date.getUTCHours().toString(), date.getUTCMinutes().toString(), date.getUTCSeconds().toString());
        return sap.zzem.fo.visibility.util.formatter.LocalDateFormatter.format(utcDate) + "\n " + sap.zzem.fo.visibility.util.formatter.LocalTimeFormatter.format(utcDate) + " " + timeZone;
    }
    return " ";
};

/**
 * Formatter for datetime in Tables
 * @param {Object} date The date of the event
 * @param {string} timeZone the timezone of the event
 * @returns {string} The local formatted DateTime.
 */
sap.zzem.fo.visibility.util.formatter.DateTimeDialogFormatter = function(date, timeZone) {
    if (!timeZone) {
        timeZone = "";
    }
    if (date) {
        var utcDate = new Date(date.getUTCFullYear().toString(), date.getUTCMonth().toString(), date.getUTCDate().toString(),
            date.getUTCHours().toString(), date.getUTCMinutes().toString(), date.getUTCSeconds().toString());
        return sap.zzem.fo.visibility.util.formatter.LocalDateFormatter.format(utcDate) + " " + sap.zzem.fo.visibility.util.formatter.LocalTimeFormatter.format(utcDate) + " " + timeZone;
    }
    return " ";
};

/**
 * Formatter for the count in tabs
 * @param {string} count Count from Backend
 * @returns {int|string} The formatted value.
 */
sap.zzem.fo.visibility.util.formatter.countFormatter = function(count) {
    try {
        var newCount = parseInt(count, 10);
    } catch (e) {
        return 0;
    }
    if (newCount > 999) {
        return ">1k";
    }
    if (isNaN(newCount)) {
        return 0;
    }
    return newCount;
};

/**
 * ReFormatter for ValueState
 * @param {string} valueState ValueState for Status
 * @returns {string} The formatted value.
 */
sap.zzem.fo.visibility.util.formatter.valueStateFormatter = function(valueState) {
    if (!valueState || valueState.indexOf("ValueState") !== -1) {
        return sap.ui.core.ValueState.None;
    }
    if (valueState === "None" || valueState === "Error" || valueState === "Success" || valueState === "Warning") {
        return valueState;
    }
    return sap.ui.core.ValueState.None;
};

/**
 * Enable Fomatter for reporting
 * @param {string} eventStatusExtended Integer determing if reporting is enabled
 * @returns {Boolean} true or false.
 */
sap.zzem.fo.visibility.util.formatter.reportEventFormatter = function(eventStatusExtended) {
    if (eventStatusExtended === "05") {
        return false;
    }
    return true;
};