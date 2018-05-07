/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
sap.ui.core.mvc.Controller.extend("zzem.fo.visibility.view.EVMUnexpectedDetail",{onInit:function(){sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(this.fnHandleRouteMatched,this)},openActionSheet:function(){if(!this._oActionSheet){this._oActionSheet=new sap.m.ActionSheet({buttons:new sap.ushell.ui.footerbar.AddBookmarkButton()});this._oActionSheet.setShowCancelButton(true);this._oActionSheet.setPlacement(sap.m.PlacementType.Top)}this._oActionSheet.openBy(this.getView().byId("actionButton"))},onExit:function(){if(this._oActionSheet){this._oActionSheet.destroy();this._oActionSheet=null}},handleNavButtonPress:function(){window.history.go(-1)},fnHandleRouteMatched:function(e){if(e.getParameter("name")==="EVMUnexpectedDetail"){var c=new sap.ui.model.Context(this.getView().getModel(),"/"+e.getParameter("arguments").contextPath);var h=this.getView().byId("evmUnexpectedDetailHeader");h.setBindingContext(c);var g=c.getProperty("EventHandlerUUID");var E=c.getProperty("EventMessageUUID");var s=c.getProperty("ExpectedEventSequenceNumber");this.fnBindContainers(g,E,s)}},fnBindContainers:function(g,e,E){var f=[new sap.ui.model.Filter("EventHandlerUUID",sap.ui.model.FilterOperator.EQ,g,null),new sap.ui.model.Filter("ExpectedEventSequenceNumber",sap.ui.model.FilterOperator.EQ,E,null)];var a=e?new sap.ui.model.Filter("EventMessageUUID",sap.ui.model.FilterOperator.EQ,e,null):new sap.ui.model.Filter("ExpectedEventSequenceNumber",sap.ui.model.FilterOperator.EQ,E,null);f.push(a);var F=this.getView().byId("evmUnexpectedForm").clone();this.getView().byId("evmUnexpectedDetailContainer").bindAggregation("items",{path:"/FreightOrderEventMessageDetailsS",filters:f,factory:function(k,c){F.setBindingContext(c);return F}})}});