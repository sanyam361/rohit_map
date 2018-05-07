/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("zzem.fo.visibility.util.parameter");
jQuery.sap.declare("zzem.fo.visibility.util.eventmessage");
/**
 @class EventMessage
 @public
 @type {Object}
 */
sap.zzem.fo.visibility.util.EventMessage = function () {
    this.EventCounter = "1";
    this.EventCode = "";
    this.TrackingIDType = "TOR_TEC";
    this.TrackingID = "";
    this.EventDateTime = "";
    this.EventDate = "";
    this.EventTime = "";
    this.EventTimeZone = "";
    this.EventReasonText = "";
    this.EventMessageSourceType = "I";
    this.ToEventMessageParameter = [];
    this.ToEventMessageLocation = [
        {
            EventCounter:    "1",
            EventLocation :     ""
        }
    ];
};