/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("zzem.fo.visibility.util.eventmessage");
sap.ui.core.mvc.Controller.extend("zzem.fo.visibility.view.Detail", {
    _EventMessage : undefined,
	_oItemTemplate : undefined,
	_oReportEventDialog : undefined,
	_oDelayEventDialog: undefined,
		
	_getReportEventDialog: function(createNew) {
		if(!this._oReportEventDialog || createNew) {
			this._oReportEventDialog = sap.ui.xmlfragment("zzem.fo.visibility.fragments.ReportDialog", this);
		}
		return this._oReportEventDialog;
	},
		
	_getDelayEventDialog: function(createNew) {
		if(!this._oDelayEventDialog || createNew) {
			this._oDelayEventDialog = sap.ui.xmlfragment("zzem.fo.visibility.fragments.ReportUnexpectedDialog", this); 
		}
		return this._oDelayEventDialog;
	},
		
	onInit: function() {
		sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(this.fnHandleRouteMatched, this);
	},
		
	openActionSheet: function() {
		var that = this;
		if (!this._oActionSheet) {
			var oShareButton = new sap.m.Button({icon: "sap-icon://share-2", text: that.getOwnerComponent().getResourceBundle().getText("SHARE_WITH_JAM")});
			oShareButton.attachPress(this.onShare, this);
			
			this._oActionSheet = new sap.m.ActionSheet({
				buttons: oShareButton 
			});
			this._oActionSheet.setShowCancelButton(true);
			this._oActionSheet.setPlacement(sap.m.PlacementType.Top);
		}
		
		this._oActionSheet.openBy(this.getView().byId("actionButton"));
	},
        	    
    getShareValues: function(oHeaderClone) {
        var aShareValues = [];
        var oContext = oHeaderClone.getBindingContext();
        
         aShareValues.push(
                oContext.getProperty("/#FreightOrderEventHandlerOverview/" + oHeaderClone.getBindingInfo("title").parts[0].path + "/@sap:label")
                + ": " +
                oContext.getProperty(oHeaderClone.getBindingInfo("title").parts[0].path)
            );        
            
         aShareValues.push(
                oContext.getProperty("/#FreightOrderEventHandlerOverview/" + oHeaderClone.getBindingInfo("title").parts[2].path + "/@sap:label")
                + ": " +
                oContext.getProperty(oHeaderClone.getBindingInfo("title").parts[2].path)
            );                    
        
         
        aShareValues.push(
            oContext.getProperty("/#FreightOrderEventHandlerOverview/" + oHeaderClone.getBindingPath("number") + "/@sap:label")
            + ": " +
            oContext.getProperty(oHeaderClone.getBindingPath("number"))
        );
        
        oHeaderClone.getAttributes().forEach(function(element) {
            aShareValues.push(
              oContext.getProperty("/#FreightOrderEventHandlerOverview/TransportationOrder/@sap:label")
                + ": " + oHeaderClone.getBindingContext().getProperty("TransportationOrder")
            );
        });
        
        oHeaderClone.getStatuses().forEach(function(element) {
            aShareValues.push(
                oContext.getProperty("/#FreightOrderEventHandlerOverview/" + element.getBindingPath("text") + "/@sap:label")
                + ": " +
                oContext.getProperty(element.getBindingPath("text"))
            );
        });
        
        aShareValues.push(
        oContext.getProperty("/#FreightOrderEventHandlerOverview/Carrier/@sap:label")
        + ": " + 
        oContext.getProperty("CarrierDescription") + " (" + oContext.getProperty("Carrier") + ")"
        );   
        
        aShareValues.push(
        oContext.getProperty("/#FreightOrderEventHandlerDetails/TransportationStatus/@sap:label")
        + ": " + 
        this.getView().byId("EventHandlerIconTabBar").getContent()[0].getBindingContext().getProperty("TransportationStatus")
        );
        
        aShareValues.push(
        oContext.getProperty("/#FreightOrderEventHandlerDetails/BlockStatus/@sap:label")
        + ": " + 
        this.getView().byId("EventHandlerIconTabBar").getContent()[0].getBindingContext().getProperty("BlockStatus")
        );
        return aShareValues;
    },  
        	
	onShare: function() {
        var oHeader = this.getView().byId("detailHeader");
        var oHeaderClone = oHeader.clone();
        oHeaderClone.setModel(this.getView().getModel());
        var aShareValues = this.getShareValues(oHeaderClone);
        
        var oShareDialog = sap.ui.getCore().createComponent({
            name: "sap.collaboration.components.fiori.sharing.dialog",
            settings: {
                object:{
                    display: oHeaderClone,
                    /* eslint-disable */
                    id:  window.location.href,
                    /* eslint-enable */
                    share: aShareValues.join("\n")
                }
            }
        });
        oShareDialog.open();
	},
		
	onExit: function() {
		if (this._oActionSheet) {
			this._oActionSheet.destroy();
			this._oActionSheet = null;
		}
	},
		
    fnHandleRouteMatched: function(oEvent) {
        if (oEvent.getParameter("name") === "Detail") {
            this._EventMessage = new sap.zzem.fo.visibility.util.EventMessage();
            var context = new sap.ui.model.Context(this.getView().getModel(), "/" + oEvent.getParameter("arguments").contextPath);
            
            var oHeader = this.getView().byId("detailHeader");
            oHeader.setBindingContext(context);
            
            var sGuid = context.getProperty("EventHandlerUUID");
            this._EventMessage.TrackingID = context.getProperty("MasterTrackingID");
            this._EventMessage.TrackingIDType = context.getProperty("MasterTrackingIDType");
            
            var aCounts = [];
            
            aCounts.push(context.getProperty("NumberOfAssignedFreightUnits"));
            
            aCounts.push(context.getProperty("NumberOfRelatedSalesOrders"));
            
            this.fnAddTabCounts(aCounts);
            
            if (sGuid) {
                this.fnBindContainers(sGuid);
            }
            
            if (this.getView().byId("EventHandlerIconTabBar").getSelectedKey() !== "EventHandlerDetails") {
                this.getView().byId("EventHandlerIconTabBar").setSelectedKey("EventHandlerDetails");
            }
        }
    },
      
    fnAddTabCounts : function(aCounts) {
        for(var i = 1; i < this.getView().byId("EventHandlerIconTabBar").getItems().length; i++) {
            this.getView().byId("EventHandlerIconTabBar").getItems()[i].setCount(sap.zzem.fo.visibility.util.formatter.countFormatter(aCounts[i - 1]));
        } 
    },  
        
    fnBindContainers: function(sGuid, bRefresh) {
        var oFilter = new sap.ui.model.Filter("EventHandlerUUID", sap.ui.model.FilterOperator.EQ, sGuid, null);
        var oEventDetailFragment = sap.ui.xmlfragment("zzem.fo.visibility.fragments.DetailPropertiesForm", this);
        var oEventMessageOverviewFragment = this.getView().byId("EventMessageTable");
        var that = this;
        
        if(bRefresh) {
        	this.getOwnerComponent().getEventBus().publish("zzem.fo.visibility", "refresh");
        	return;
        }
        
        this.getView().byId("EventHandlerIconTabBar").bindAggregation("content", {
            path: "/FreightOrderEventHandlerDetailsS",
            parameters: {
                expand: "ToEventMessageOverview"
            },
            filters: [oFilter],
            factory: function(key, oContext) {
                oEventDetailFragment.setBindingContext(oContext);
                oEventMessageOverviewFragment.setBindingContext(oContext);
                oEventMessageOverviewFragment.setBusy(false);
                var oLabel = oEventMessageOverviewFragment.getHeaderToolbar().getContent()[0];
                var sActive = oContext.getProperty("EHActive");
                if(!sActive) {
					that.getView().byId("inactiveStatus").setVisible(true);
					oEventMessageOverviewFragment.getHeaderToolbar().getContent()[4].setEnabled(false);                     
					oEventMessageOverviewFragment.getItems().forEach(function(oItem) {
						oItem.getCells()[6].setEnabled(false);
					});
                }
                
                if (!that.getView().byId("EventMessageTable").getSelectedItem()) {
                    that.getView().byId("NavToEVMBtn").setEnabled(false);
                }
                
                oLabel.setText(that.getOwnerComponent().getResourceBundle().getText("EVENT_MESSAGE_TITLE", [oEventMessageOverviewFragment.getItems().length]));
                return oEventDetailFragment;
            }
        });
    },
        
    fnOnSelectIconTabFilter: function(oEvent){
        if (oEvent.getSource().getSelectedKey() !== "EventHandlerDetails") {
            var sCollection = oEvent.getSource().getSelectedKey();
            var sGUID = this.getView().byId("detailHeader").getBindingContext().getProperty("EventHandlerUUID");
            var oFilter = new sap.ui.model.Filter("EventHandlerUUID", sap.ui.model.FilterOperator.EQ, sGUID, null);
            var oTable = oEvent.getParameters().item.getContent()[0].getContent()[0];
            if(oTable.getItems()[0]) {
            	this._oItemTemplate = oTable.getItems()[0].clone();
            }
            oTable.bindItems("/" + sCollection, this._oItemTemplate, null, [oFilter]);
        }
    },  
        
    goToNextPage: function(oEvent){
        var oListItem = oEvent.getSource().getParent().getParent().getSelectedItem();
		var bUnexpected = oListItem.getBindingContext().getProperty("EventStatusExtended") === "05";
		if(bUnexpected) {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("EVMUnexpectedDetail",{from: "detail", contextPath: oListItem.getBindingContext().getPath().substr(1)});
		}
		else {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("EVMExpectedDetail",{from: "detail", contextPath: oListItem.getBindingContext().getPath().substr(1)});
		}
    },
        
    OnSelectionChange: function(oEvent) {
        if(oEvent.getSource().getSelectedItem()) {
            this.getView().byId("NavToEVMBtn").setEnabled(true);
        }
        else {
            this.getView().byId("NavToEVMBtn").setEnabled(true);
        }
    },
        
    fnOnReportButtonPressed: function(oEvent) {
        var oContext = oEvent.getSource().getParent().getBindingContext();
        var oReportDialog = this._getReportEventDialog(true);
        
        oReportDialog.setModel(this.getView().getModel("i18n"), "i18n");
        oReportDialog.setModel(oContext.getModel());
        oReportDialog.setBindingContext(oContext);
        
        oReportDialog.open();
    },
		
	fnOnReportPopupClose: function () {
        this._getReportEventDialog().close();
    },
        
    fnOnDelayPopupClose: function () {
        this._getDelayEventDialog().close();
    },
        
    fnReportTime: function (oEvent) {
        this._getReportEventDialog().getBeginButton().setEnabled(true);
        this.fnSetEventDateToMessage(oEvent.getSource().getDateValue());
        if(!this._EventMessage.EventTimeZone) {
            this._EventMessage.EventTimeZone = this._getReportEventDialog().getBindingContext().getProperty("EventExpectedTimeZone");
        }
    },
		
    fnOnTimeZoneChangeEnhanced: function(oEvent) {
        this._EventMessage.EventTimeZone = oEvent.getSource().getProperty("selectedKey");
        var oCombo = this._getDelayEventDialog().getContent()[1].getContent()[0].getContent()[11];
        if(!oCombo.getValue()) {
            oCombo.setSelectedKey(oEvent.getSource().getProperty("selectedKey"));
            oCombo.fireSelectionChange({selectedItem: oCombo.getSelectedItem()});
        }
        this.fnCheckRequiredFields(oEvent.getSource());
    },
		    
    fnOnTimeZoneChange: function(oEvent) {
        this._EventMessage.EventTimeZone = oEvent.getSource().getProperty("selectedKey");
    },
     
    fnOnParameterTimeZone: function(oEvent) {
        var aCustomData = oEvent.getSource().getCustomData();
        var oParamEvent = new sap.zzem.fo.visibility.util.EventMessageParameter();
        oParamEvent.ParameterValue = oEvent.getSource().getProperty("selectedKey");
        oParamEvent.ParameterName = aCustomData[0].getValue();
        oParamEvent.ParameterAction = aCustomData[1].getValue();
        oParamEvent.ParameterType = aCustomData[2].getValue();
        this._EventMessage.ToEventMessageParameter.push(oParamEvent);
        
        var oCombo = this._getDelayEventDialog().getContent()[1].getContent()[0].getContent()[7];
        if(!oCombo.getValue()) {
            oCombo.setSelectedKey(oEvent.getSource().getProperty("selectedKey"));
            oCombo.fireSelectionChange({selectedItem: oCombo.getSelectedItem()});
        }        
        this.fnCheckRequiredFields(oEvent.getSource());
    },
		
    fnOnParameterTimeStamp: function(oEvent) {
        var aCustomData = oEvent.getSource().getCustomData();
        var oParamEvent = new sap.zzem.fo.visibility.util.EventMessageParameter();
        var oNewEstimatedDate = new Date(oEvent.getSource().getValue());
        var month = oNewEstimatedDate.getMonth() + 1 < 10 ? "0" + (oNewEstimatedDate.getMonth() + 1) : oNewEstimatedDate.getMonth() + 1;
        var date = oNewEstimatedDate.getDate() < 10 ? "0" + oNewEstimatedDate.getDate() : oNewEstimatedDate.getDate();
        var hour = oNewEstimatedDate.getHours() < 10 ? "0" + oNewEstimatedDate.getHours() : oNewEstimatedDate.getHours();
        var min = oNewEstimatedDate.getMinutes() < 10 ? "0" + oNewEstimatedDate.getMinutes() : oNewEstimatedDate.getMinutes();
        var secs = oNewEstimatedDate.getSeconds() < 10 ? "0" + oNewEstimatedDate.getSeconds() : oNewEstimatedDate.getSeconds();
        oParamEvent.ParameterValue = "0" + oNewEstimatedDate.getFullYear() + month + date + hour + min + secs;
        oParamEvent.ParameterName = aCustomData[0].getValue();
        oParamEvent.ParameterAction = aCustomData[1].getValue();
        oParamEvent.ParameterType = aCustomData[2].getValue();
        this._EventMessage.ToEventMessageParameter.push(oParamEvent);
        this.fnCheckRequiredFields(oEvent.getSource());
    },
		
    fnSetEventDateToMessage: function(oDate) {
        var localTime = oDate.getTime();
        var localOffset = oDate.getTimezoneOffset() * 60000;
        var oNewDate = new Date(localTime - localOffset);
        this._EventMessage.EventDateTime = oNewDate;
        var month = oDate.getMonth() + 1 < 10 ? "0" + (oDate.getMonth() + 1) : oDate.getMonth() + 1;
        var day = oDate.getDate() < 10 ? "0" + oDate.getDate() : oDate.getDate();
        var hour = oDate.getHours() < 10 ? "0" + oDate.getHours() : oDate.getHours();
        var min = oDate.getMinutes() < 10 ? "0" + oDate.getMinutes() : oDate.getMinutes();
        this._EventMessage.EventTime = "PT" + hour + "H" + min + "M";
        this._EventMessage.EventDate = oDate.getFullYear() + "-" + month + "-" + day + "T00:00:00";
    },
		
    fnOnPopupOK: function() {
        var oReportDialogContext = this._getReportEventDialog().getBindingContext();
        this._EventMessage.EventCode = oReportDialogContext.getProperty("EventCode");
        this._EventMessage.EventReasonText = oReportDialogContext.getProperty("EventReasonText");
        this._EventMessage.ToEventMessageLocation[0].EventLocation = oReportDialogContext.getProperty("EventLocation");
        
        this._getReportEventDialog().close();
        this.fnSendEventMessage();
    },
        
    fnSendEventMessage: function() {
        var oContext = this.getView().byId("detailHeader").getBindingContext();
        var sGuid = oContext.getProperty("EventHandlerUUID");
        var that = this;
        var oBatch = this.getView().getModel().createBatchOperation("EventMessageHeaderS", "POST", this._EventMessage);
        this.getView().getModel().addBatchChangeOperations([oBatch]);
        this.getView().getModel().submitBatch(function(oData) {
            if (!oData.__batchResponses[0].response) {
                sap.m.MessageToast.show(jQuery.sap.parseJS(oData.__batchResponses[0].__changeResponses[0].headers["sap-message"]).message, {
                    duration: 5000
                });
                
                that.fnBindContainers(sGuid, true);
            }
            else {
                jQuery.sap.require("sap.ca.ui.message.message");
                sap.ca.ui.message.showMessageBox({
                    type: sap.ca.ui.message.Type.ERROR,
                    message: jQuery.sap.parseJS(oData.__batchResponses[0].response.body).error.message.value
                });
            }
            }, function(oData) {
                    if (oData.__batchResponses[0].response) {
                        jQuery.sap.require("sap.ca.ui.message.message");
                        sap.ca.ui.message.showMessageBox({
                            type: sap.ca.ui.message.Type.ERROR,
                            message: jQuery.sap.parseJS(oData.__batchResponses[0].response.body).error.message.value
                        });
                    }
            }, false);
            
        this._EventMessage = new sap.zzem.fo.visibility.util.EventMessage();
        this._EventMessage.TrackingID = oContext.getProperty("MasterTrackingID");
        this._EventMessage.TrackingIDType = oContext.getProperty("MasterTrackingIDType");
    },
		    
    fnOnAddButtonPressed: function() {
        var oReportUnexpectedDialog = this._getDelayEventDialog(true);
        oReportUnexpectedDialog.setModel(this.getView().getModel("i18n"), "i18n");
        oReportUnexpectedDialog.setModel(this.getView().getModel());
        
        var oComboBox = oReportUnexpectedDialog.getContent()[0].getContent()[1];
        if(oComboBox.getItems().length === 1) {
            oComboBox.setSelectedItem(oComboBox.getItems()[0]);
            oComboBox.fireSelectionChange({selectedItem: oComboBox.getItems()[0]});
        }
        oReportUnexpectedDialog.open();
    },
		
    fnActualDate: function(oEvent) {
        this.fnSetEventDateToMessage(oEvent.getParameters().dateValue);
    },
		
    fnOnEventCodeChange: function(oEvent) {
        this._getDelayEventDialog().getContent()[1].removeAllContent();
        var aForms = this._getDelayEventDialog().getDependents();
        var sKey = oEvent.getParameters().selectedItem.getKey();
        this._EventMessage.EventCode = sKey;
        var aChosenForm = aForms.filter(function(oForm) {
            return oForm.getTitle().getText() === oEvent.getParameters().selectedItem.getText();
        });
        aChosenForm[0].setBindingContext(this.getView().byId("EventMessageTable").getBindingContext());
        var oInput = aChosenForm[0].getContent()[1];
        oInput.setFilterFunction(function(sValue, oItem) {
            var rgx = new RegExp(sValue, "i");
            return (rgx.test(oItem.getCells()[0].getText()) || rgx.test(oItem.getCells()[1].getText())) 
            && (oItem.getBindingContext().getProperty("EventStatusExtended") === "02" || oItem.getBindingContext().getProperty("EventStatusExtended") === "03");
        });
        var oExpectedFilter = new sap.ui.model.Filter("EventStatusExtended", sap.ui.model.FilterOperator.EQ, "02");
        oInput.getBinding("suggestionRows").filter([oExpectedFilter]);
        this._getDelayEventDialog().getContent()[1].addContent(aChosenForm[0]);
        this._getDelayEventDialog().invalidate();
    },
    
    fnOnProperty: function(oEvent) {
        if(oEvent.getSource().getCustomData()[0].getKey() === "Location") {
            this._EventMessage.ToEventMessageLocation[0].EventLocation = oEvent.getSource().getValue();
        } 
        else {
            this._EventMessage[oEvent.getSource().getCustomData()[0].getValue()] = oEvent.getSource().getValue(); 
        }
        this.fnCheckRequiredFields(oEvent.getSource());
    },
    
    fnOnPropertyEnhanced: function(oEvent) {
        var oParamEvent = new sap.zzem.fo.visibility.util.EventMessageParameter();
        oParamEvent.ParameterValue = oEvent.getParameter("selectedRow").getBindingContext().getProperty("EventCode");
        oParamEvent.ParameterName = "ODT40_EXPEC_DELAY_REF_EE";
        this._EventMessage.ToEventMessageParameter.push(oParamEvent);
        var oParamLocEvent = new sap.zzem.fo.visibility.util.EventMessageParameter();
        oParamLocEvent.ParameterValue = oEvent.getParameter("selectedRow").getBindingContext().getProperty("EventLocation");
        oParamLocEvent.ParameterName = "ODT40_EXPEC_DELAY_REF_EE_LOC";
        this._EventMessage.ToEventMessageParameter.push(oParamLocEvent);
        
        var sValue = oEvent.getParameter("selectedRow").getCells()[0].getText() + "\t" + oEvent.getParameter("selectedRow").getCells()[1].getText();
        oEvent.getSource().setValue(sValue);
    },
    
    fnOnParameter: function(oEvent) {
        var aCustomData = oEvent.getSource().getCustomData();
        
        var oParamEvent = new sap.zzem.fo.visibility.util.EventMessageParameter();
        oParamEvent.ParameterValue = oEvent.getSource().getValue();
        oParamEvent.ParameterName = aCustomData[0].getValue();
        oParamEvent.ParameterAction = aCustomData[1].getValue();
        oParamEvent.ParameterType = aCustomData[2].getValue();
        this._EventMessage.ToEventMessageParameter.push(oParamEvent);
        
        this.fnCheckRequiredFields(oEvent.getSource());
    },
    
    fnCheckRequiredFields: function() {
        var aControls = this._getDelayEventDialog().getContent()[1].getContent()[0].getContent();
        for(var i = 0; i < aControls.length; i++) {
            if(aControls[i].getMetadata().getName() === "sap.m.Label"){
                if(aControls[i].getRequired()){
                    if(!aControls[i + 1].getValue()) {
                        this._getDelayEventDialog().getBeginButton().setEnabled(false);
                        return;
                    } 
                }
            }
        }
        this._getDelayEventDialog().getBeginButton().setEnabled(true);
    },
        
    fnReportOK: function() {
        this.fnSendEventMessage();
        this._getDelayEventDialog().close();    
    }
});