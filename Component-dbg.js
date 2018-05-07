/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("zzem.fo.visibility.Component");
jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
jQuery.sap.require("zzem.fo.visibility.util.formatter");
sap.ui.core.UIComponent.extend("zzem.fo.visibility.Component", {
    
    _oResourceBundle : null,
    
	metadata : {
		"name" : "Event Management Transactional APP",
		"version" : "1.0",
		"includes" : [],
 
		"dependencies" : {
			"libs" : ["sap.m", "sap.me", "sap.ushell"],
			"components" : []
		},
		"config" : {
			"resourceBundle" : "i18n/i18n.properties",
			"titleResource" : "SHELL_TITLE",
			
			serviceConfig : {
				name: "EM_SRV",
				serviceUrl: "/sap/opu/odata/saptrx/EM_SRV/"
			}
		},
		routing: {
			config: {
				viewType : "XML",
				viewPath: "zzem.fo.visibility.view",  // common prefix
				targetAggregation: "detailPages",
				clearTarget: false
			},
			routes:
				[{
					pattern: "",
					name : "master",
					view : "Master",
					targetAggregation : "masterPages",
					preservePageInSplitContainer : true,
					targetControl: "fioriContent",
					subroutes : [
									{
										pattern : "/", // will be the url and from has to be provided in the data
										view : "NoData",
										name : "NoData" // name used for listening or navigating to this route
									},{
										pattern : "Detail/{contextPath}", // will be the url and from has to be provided in the data
										view : "Detail",
										name : "Detail" // name used for listening or navigating to this route
									},
									{
                                        pattern : "EVMExpectedDetail/{contextPath}", // will be the url and from has to be provided in the data
										view : "EVMExpectedDetail",
										name : "EVMExpectedDetail" // name used for listening or navigating to this route
									},{
                                        pattern : "EVMUnexpectedDetail/{contextPath}", // will be the url and from has to be provided in the data
										view : "EVMUnexpectedDetail",
										name : "EVMUnexpectedDetail" // name used for listening or navigating to this route
									}]
				}]
		}
	},
    
    getResourceBundle: function() {
        return this._oResourceBundle;
    },

	init : function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		
        var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
	    oHashChanger.replaceHash("");
	    
		this._oRouteMatchedHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter());
		// this component should automatically initialize the router
		this.getRouter().initialize();
		
		var oMetadataConfig = this.getMetadata().getConfig();
		var oServiceConfig = oMetadataConfig.serviceConfig;
		var sServiceUrl = oServiceConfig.serviceUrl;
		// always use absolute paths relative to our own component
		// (relative paths will fail if running in the Fiori Launchpad)
		var rootPath = jQuery.sap.getModulePath("zzem.fo.visibility");
		// if proxy needs to be used for local testing...
		var sProxyOn = jQuery.sap.getUriParameters().get("proxyOn");
		var bUseProxy = (sProxyOn === "true");
		if (bUseProxy) {
			sServiceUrl = rootPath + "/proxy" + sServiceUrl;
		} 
		// start mock server if required
		var responderOn = jQuery.sap.getUriParameters().get("responderOn");
		var bUseMockData = (responderOn === "true");
		// var bUseMockData = true;
		if (bUseMockData) {
			jQuery.sap.require("sap.ui.core.util.MockServer");
			var oMockServer = new sap.ui.core.util.MockServer({
				rootUri: sServiceUrl.replace(/\/?$/, "/")
			});
			oMockServer.simulate(rootPath + "/model/metadata.xml", rootPath + "/model/");
			oMockServer.start();
			var msg = "Running in demo mode with mock data."; // not translated because only for development scenario
			jQuery.sap.require("sap.m.MessageToast");
			sap.m.MessageToast.show(msg, {
				duration: 4000
			});
		}
		
		// set i18n model
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl : rootPath + "/i18n/i18n.properties"
		});
		this.setModel(i18nModel, "i18n");
		
        this._oResourceBundle = jQuery.sap.resources({url: rootPath + "/i18n/i18n.properties", locale: sap.ui.getCore().getConfiguration().getLanguage()});
        sap.zzem.fo.visibility.util.formatter.init(this._oResourceBundle);
        
		// set data model
		var m = new sap.ui.model.odata.ODataModel(sServiceUrl, {json: true,loadMetadataAsync: true, useBatch: true});
		m.setDefaultCountMode(sap.ui.model.odata.CountMode.Inline);
		m.attachRequestFailed(function(oError) {
            jQuery.sap.require("sap.ca.ui.message.message");
			sap.ca.ui.message.showMessageBox({ 
                type : sap.ca.ui.message.Type.ERROR, 
                message : jQuery.sap.parseJS(oError.getParameter("responseText")).error.message.value
			});
		});
		
		m.attachMetadataFailed(function(oError) {
            jQuery.sap.require("sap.ca.ui.message.message");
			sap.ca.ui.message.showMessageBox({ 
                type : sap.ca.ui.message.Type.ERROR, 
                message : jQuery.sap.parseXML(oError.getParameter("responseText")).getElementsByTagName("message")[0].childNodes[0].nodeValue
			});
		});
		
		this.setModel(m);
		
		// set device model
		var deviceModel = new sap.ui.model.json.JSONModel({
			isTouch : sap.ui.Device.support.touch,
			isNoTouch : !sap.ui.Device.support.touch,
			isPhone : sap.ui.Device.system.phone,
			isNoPhone : !sap.ui.Device.system.phone,
			listMode : (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster",
					listItemType : (sap.ui.Device.system.phone) ? "Active" : "Inactive"
		});
		deviceModel.setDefaultBindingMode("OneWay");
		this.setModel(deviceModel, "device");
	},
	/**
	 * Initialize the application
	 * 
	 * @returns {sap.ui.core.Control} the content
	 */
	createContent : function() {
		var oViewData = {
			component : this
		};
		return sap.ui.view({
			viewName : "zzem.fo.visibility.view.App",
			type : sap.ui.core.mvc.ViewType.XML,
			viewData : oViewData
		});
	}
});