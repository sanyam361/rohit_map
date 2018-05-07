/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("zzem.fo.visibility.util.eventmessage");
jQuery.sap.require("zzem.fo.visibility.util.Signature");
var view = null;
sap.ui.core.mvc.Controller.extend("zzem.fo.visibility.view.Detail", {
	_EventMessage: undefined,
	_oItemTemplate: undefined,
	_oReportEventDialog: undefined,
	_oDelayEventDialog: undefined,
	_getReportEventDialog: function(c) {
		if (!this._oReportEventDialog || c) {
			this._oReportEventDialog = sap.ui.xmlfragment("zzem.fo.visibility.fragments.ReportDialog", this);
		}
		return this._oReportEventDialog;
	},
	_getDelayEventDialog: function(c) {
		if (!this._oDelayEventDialog || c) {
			this._oDelayEventDialog = sap.ui.xmlfragment("zzem.fo.visibility.fragments.ReportUnexpectedDialog", this);
		}
		return this._oDelayEventDialog;
	},

	getPosition: function() {
		var that = this;
		var onGeoSuccess = function(position) {
			var geoMap = that.byId("GeoMap");
			var pos = position.coords.longitude + ";" + position.coords.latitude + ";0";
			that.byId("currLoc").setPosition(pos);
			geoMap.setInitialPosition(pos);
			geoMap.setInitialZoom(10);
		};

		var onGeoError = function() {
			console.log('code:' + error.code + '\n' + 'message: ' + error.message + '\n');
		};

		navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, {
			enableHighAccuracy: true
		});

	},

	getPosition1: function() {
		var onGeoSuccess = function(position) {
			sap.ui.getCore().byId("txtLatitude").setText(position.coords.latitude);
			sap.ui.getCore().byId("txtLongitude").setText(position.coords.longitude);
		};

		var onGeoError = function() {
			console.log('code:' + error.code + '\n' + 'message: ' + error.message + '\n');
		};

		navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, {
			enableHighAccuracy: true
		});

	},
	
	getPosition2: function() {
		var onGeoSuccess = function(position) {
			sap.ui.getCore().byId("txtLatitude1").setText(position.coords.latitude);
			sap.ui.getCore().byId("txtLongitude1").setText(position.coords.longitude);
		};

		var onGeoError = function() {
			console.log('code:' + error.code + '\n' + 'message: ' + error.message + '\n');
		};

		navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, {
			enableHighAccuracy: true
		});

	},

	onInit: function() {
		sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(this.fnHandleRouteMatched, this);
		view = this.getView();
		var oGeoMap = this.getView().byId("GeoMap");
		var oMapConfig = {
			"MapProvider": [{
				"name": "HEREMAPS",
				"type": "",
				"description": "",
				"tileX": "256",
				"tileY": "256",
				"maxLOD": "20",
				"copyright": "Tiles Courtesy of Maps",
				"Source": [{
					"id": "s1",
					"url": "http://mt0.google.com/vt/lyrs=m@1550000&amp;hl=en&x={X}&y={Y}&z={LOD}&s=G"
				}, {
					"id": "s2",
					"url": "http://mt1.google.com/vt/lyrs=m@1550000&amp;hl=en&x={X}&y={Y}&z={LOD}&s=G"
				}]
			}],
			"MapLayerStacks": [{
				"name": "DEFAULT",
				"MapLayer": {
					"name": "layer1",
					"refMapProvider": "HEREMAPS",
					"opacity": "1.0",
					"colBkgnd": "RGB(255,255,255)"
				}
			}]
		};
		oGeoMap.setMapConfiguration(oMapConfig);
		oGeoMap.setRefMapLayerStack("DEFAULT");

	},
	openActionSheet: function() {
		var t = this;
		if (!this._oActionSheet) {
			var s = new sap.m.Button({
				icon: "sap-icon://share-2",
				text: t.getOwnerComponent().getResourceBundle().getText("SHARE_WITH_JAM")
			});
			s.attachPress(this.onShare, this);
			this._oActionSheet = new sap.m.ActionSheet({
				buttons: s
			});
			this._oActionSheet.setShowCancelButton(true);
			this._oActionSheet.setPlacement(sap.m.PlacementType.Top)
		}
		this._oActionSheet.openBy(this.getView().byId("actionButton"))
	},
	getShareValues: function(h) {
		var s = [];
		var c = h.getBindingContext();
		s.push(c.getProperty("/#FreightOrderEventHandlerOverview/" + h.getBindingInfo("title").parts[0].path + "/@sap:label") + ": " + c.getProperty(
			h.getBindingInfo("title").parts[0].path));
		s.push(c.getProperty("/#FreightOrderEventHandlerOverview/" + h.getBindingInfo("title").parts[2].path + "/@sap:label") + ": " + c.getProperty(
			h.getBindingInfo("title").parts[2].path));
		s.push(c.getProperty("/#FreightOrderEventHandlerOverview/" + h.getBindingPath("number") + "/@sap:label") + ": " + c.getProperty(h.getBindingPath(
			"number")));
		h.getAttributes().forEach(function(e) {
			s.push(c.getProperty("/#FreightOrderEventHandlerOverview/TransportationOrder/@sap:label") + ": " + h.getBindingContext().getProperty(
				"TransportationOrder"))
		});
		h.getStatuses().forEach(function(e) {
			s.push(c.getProperty("/#FreightOrderEventHandlerOverview/" + e.getBindingPath("text") + "/@sap:label") + ": " + c.getProperty(e.getBindingPath(
				"text")))
		});
		s.push(c.getProperty("/#FreightOrderEventHandlerOverview/Carrier/@sap:label") + ": " + c.getProperty("CarrierDescription") + " (" + c.getProperty(
			"Carrier") + ")");
		s.push(c.getProperty("/#FreightOrderEventHandlerDetails/TransportationStatus/@sap:label") + ": " + this.getView().byId(
			"EventHandlerIconTabBar").getContent()[0].getBindingContext().getProperty("TransportationStatus"));
		s.push(c.getProperty("/#FreightOrderEventHandlerDetails/BlockStatus/@sap:label") + ": " + this.getView().byId("EventHandlerIconTabBar")
			.getContent()[0].getBindingContext().getProperty("BlockStatus"));
		return s;
	},
	onShare: function() {
		var h = this.getView().byId("detailHeader");
		var H = h.clone();
		H.setModel(this.getView().getModel());
		var s = this.getShareValues(H);
		var S = sap.ui.getCore().createComponent({
			name: "sap.collaboration.components.fiori.sharing.dialog",
			settings: {
				object: {
					display: H,
					id: window.location.href,
					share: s.join("\n")
				}
			}
		});
		S.open()
	},
	onExit: function() {
		if (this._oActionSheet) {
			this._oActionSheet.destroy();
			this._oActionSheet = null
		}
	},
	fnHandleRouteMatched: function(e) {
		if (e.getParameter("name") === "Detail") {
			this._EventMessage = new sap.zzem.fo.visibility.util.EventMessage();
			var c = new sap.ui.model.Context(this.getView().getModel(), "/" + e.getParameter("arguments").contextPath);
			var h = this.getView().byId("detailHeader");
			h.setBindingContext(c);
			var g = c.getProperty("EventHandlerUUID");
			this._EventMessage.TrackingID = c.getProperty("MasterTrackingID");
			this._EventMessage.TrackingIDType = c.getProperty("MasterTrackingIDType");
			var C = [];
			C.push(c.getProperty("NumberOfAssignedFreightUnits"));
			C.push(c.getProperty("NumberOfRelatedSalesOrders"));
			this.fnAddTabCounts(C);
			if (g) {
				this.fnBindContainers(g)
			}
			if (this.getView().byId("EventHandlerIconTabBar").getSelectedKey() !== "EventHandlerDetails") {
				this.getView().byId("EventHandlerIconTabBar").setSelectedKey("EventHandlerDetails")
			}
		}
	},
	fnAddTabCounts: function(c) {
		for (var i = 1; i < this.getView().byId("EventHandlerIconTabBar").getItems().length; i++) {
			this.getView().byId("EventHandlerIconTabBar").getItems()[i].setCount(sap.zzem.fo.visibility.util.formatter.countFormatter(c[i - 1]))
		}
	},
	fnBindContainers: function(g, r) {
		var f = new sap.ui.model.Filter("EventHandlerUUID", sap.ui.model.FilterOperator.EQ, g, null);
		var e = sap.ui.xmlfragment("zzem.fo.visibility.fragments.DetailPropertiesForm", this);
		var E = this.getView().byId("EventMessageTable");
		var t = this;
		if (r) {
			this.getOwnerComponent().getEventBus().publish("zzem.fo.visibility", "refresh");
			return
		}
		this.getView().byId("EventHandlerIconTabBar").bindAggregation("content", {
			path: "/FreightOrderEventHandlerDetailsS",
			parameters: {
				expand: "ToEventMessageOverview"
			},
			filters: [f],
			factory: function(k, c) {
				e.setBindingContext(c);
				E.setBindingContext(c);
				E.setBusy(false);
				var l = E.getHeaderToolbar().getContent()[0];
				var a = c.getProperty("EHActive");
				if (!a) {
					t.getView().byId("inactiveStatus").setVisible(true);
					E.getHeaderToolbar().getContent()[4].setEnabled(false);
					E.getItems().forEach(function(i) {
						i.getCells()[6].setEnabled(false)
					})
				}
				if (!t.getView().byId("EventMessageTable").getSelectedItem()) {
					t.getView().byId("NavToEVMBtn").setEnabled(false)
				}
				l.setText(t.getOwnerComponent().getResourceBundle().getText("EVENT_MESSAGE_TITLE", [E.getItems().length]));
				return e
			}
		})
	},
	fnOnSelectIconTabFilter: function(e) {
		if (e.getSource().getSelectedKey() !== "EventHandlerDetails") {
			var c = e.getSource().getSelectedKey();
			var g = this.getView().byId("detailHeader").getBindingContext().getProperty("EventHandlerUUID");
			var f = new sap.ui.model.Filter("EventHandlerUUID", sap.ui.model.FilterOperator.EQ, g, null);
			var t = e.getParameters().item.getContent()[0].getContent()[0];
			if (t.getItems()[0]) {
				this._oItemTemplate = t.getItems()[0].clone()
			}
			t.bindItems("/" + c, this._oItemTemplate, null, [f])
		}
	},
	goToNextPage: function(e) {
		var l = e.getSource().getParent().getParent().getSelectedItem();
		var u = l.getBindingContext().getProperty("EventStatusExtended") === "05";
		if (u) {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("EVMUnexpectedDetail", {
				from: "detail",
				contextPath: l.getBindingContext().getPath().substr(1)
			})
		} else {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("EVMExpectedDetail", {
				from: "detail",
				contextPath: l.getBindingContext().getPath().substr(1)
			})
		}
	},
	OnSelectionChange: function(e) {
		if (e.getSource().getSelectedItem()) {
			this.getView().byId("NavToEVMBtn").setEnabled(true)
		} else {
			this.getView().byId("NavToEVMBtn").setEnabled(true)
		}
	},
	fnOnReportButtonPressed: function(e) {
		var c = e.getSource().getParent().getBindingContext();
		var r = this._getReportEventDialog(true);
		r.setModel(this.getView().getModel("i18n"), "i18n");
		r.setModel(c.getModel());
		r.setBindingContext(c);

		this.getPosition1();
		sap.ui.getCore().byId("html").setContent("<canvas id='signature-pad' width='400' height='200' class='signature-pad'></canvas>");
		r.open();
	},
	fnOnReportPopupClose: function() {
		this._getReportEventDialog().close();
	},

	onDialogAfterClose: function(oEvent) {
		oEvent.getSource().destroy();
	},

	fnOnDelayPopupClose: function() {
		this._getDelayEventDialog().close();
	},
	fnReportTime: function(e) {
		this._getReportEventDialog().getBeginButton().setEnabled(true);
		this.fnSetEventDateToMessage(e.getSource().getDateValue());
		if (!this._EventMessage.EventTimeZone) {
			this._EventMessage.EventTimeZone = this._getReportEventDialog().getBindingContext().getProperty("EventExpectedTimeZone");
		}
	},
	fnOnTimeZoneChangeEnhanced: function(e) {
		this._EventMessage.EventTimeZone = e.getSource().getProperty("selectedKey");
		var c = this._getDelayEventDialog().getContent()[1].getContent()[0].getContent()[11];
		if (!c.getValue()) {
			c.setSelectedKey(e.getSource().getProperty("selectedKey"));
			c.fireSelectionChange({
				selectedItem: c.getSelectedItem()
			})
		}
		this.fnCheckRequiredFields(e.getSource());
	},
	fnOnTimeZoneChange: function(e) {
		this._EventMessage.EventTimeZone = e.getSource().getProperty("selectedKey")
	},
	fnOnParameterTimeZone: function(e) {
		var c = e.getSource().getCustomData();
		var p = new sap.zzem.fo.visibility.util.EventMessageParameter();
		p.ParameterValue = e.getSource().getProperty("selectedKey");
		p.ParameterName = c[0].getValue();
		p.ParameterAction = c[1].getValue();
		p.ParameterType = c[2].getValue();
		this._EventMessage.ToEventMessageParameter.push(p);
		var C = this._getDelayEventDialog().getContent()[1].getContent()[0].getContent()[7];
		if (!C.getValue()) {
			C.setSelectedKey(e.getSource().getProperty("selectedKey"));
			C.fireSelectionChange({
				selectedItem: C.getSelectedItem()
			})
		}
		this.fnCheckRequiredFields(e.getSource())
	},
	fnOnParameterTimeStamp: function(e) {
		var c = e.getSource().getCustomData();
		var p = new sap.zzem.fo.visibility.util.EventMessageParameter();
		var n = new Date(e.getSource().getValue());
		var m = n.getMonth() + 1 < 10 ? "0" + (n.getMonth() + 1) : n.getMonth() + 1;
		var d = n.getDate() < 10 ? "0" + n.getDate() : n.getDate();
		var h = n.getHours() < 10 ? "0" + n.getHours() : n.getHours();
		var a = n.getMinutes() < 10 ? "0" + n.getMinutes() : n.getMinutes();
		var s = n.getSeconds() < 10 ? "0" + n.getSeconds() : n.getSeconds();
		p.ParameterValue = "0" + n.getFullYear() + m + d + h + a + s;
		p.ParameterName = c[0].getValue();
		p.ParameterAction = c[1].getValue();
		p.ParameterType = c[2].getValue();
		this._EventMessage.ToEventMessageParameter.push(p);
		this.fnCheckRequiredFields(e.getSource())
	},
	fnSetEventDateToMessage: function(d) {
		var l = d.getTime();
		var a = d.getTimezoneOffset() * 60000;
		var n = new Date(l - a);
		this._EventMessage.EventDateTime = n;
		var m = d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
		var b = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
		var h = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
		var c = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
		this._EventMessage.EventTime = "PT" + h + "H" + c + "M";
		this._EventMessage.EventDate = d.getFullYear() + "-" + m + "-" + b + "T00:00:00"
	},
	fnOnPopupOK: function() {
		var r = this._getReportEventDialog().getBindingContext();
		this._EventMessage.EventCode = r.getProperty("EventCode");
		this._EventMessage.EventReasonText = r.getProperty("EventReasonText");
		this._EventMessage.ToEventMessageLocation[0].EventLocation = r.getProperty("EventLocation");
		this._getReportEventDialog().close();
		//this._getReportEventDialog().destroy();
		this.fnSendEventMessage1();
	},
	fnSendEventMessage1: function() {
		var c = this.getView().byId("detailHeader").getBindingContext();
		var g = c.getProperty("EventHandlerUUID");
		var t = this;

		var oData = {};

		oData.Trxid = this._EventMessage.TrackingID;
		oData.Trxcod = this._EventMessage.TrackingIDType;
		oData.Evtid = this._EventMessage.EventCode;
		oData.Latitude = sap.ui.getCore().byId("txtLatitude").getText();
		oData.Longitude = sap.ui.getCore().byId("txtLongitude").getText();
		oData.Locid1 = this._EventMessage.ToEventMessageLocation[0].EventLocation;
		oData.Evtcnt = this._EventMessage.EventCounter;
		oData.Evtdat = this._EventMessage.EventDate;
		oData.Evttim = this._EventMessage.EventTime;

		//Initating Post
		var that = this;
		var sServiceUrl = "/sap/opu/odata/sap/ZEM_NOVIGO_UPDATES_SRV/";
		var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl);

		OData.request({
				requestUri: "/sap/opu/odata/sap/ZEM_NOVIGO_UPDATES_SRV/?$metadata",
				method: "GET",
				headers: {
					"X-Requested-With": "XMLHttpRequest",
					"Content-Type": "application/json",
					"DataServiceVersion": "2.0",
					"X-CSRF-Token": "Fetch"
				}
			},
			function(data, response) {
				var header_xcsrf_token = response.headers['x-csrf-token'];

				OData.request({
						requestUri: "/sap/opu/odata/sap/ZEM_NOVIGO_UPDATES_SRV/ZEventMessageHeaderSet",
						method: "POST",
						headers: {
							"X-Requested-With": "XMLHttpRequest",
							"Content-Type": "application/json",
							"DataServiceVersion": "2.0",
							"Accept": "application/json",
							"X-CSRF-Token": header_xcsrf_token
						},
						data: oData
					},
					function(data, response) {
						//MessageToast.show("Ticket Successfully Saved with Ticket No: " + response.data.EvObjectId + ".");
					},
					function(err) {
						/*	sap.m.MessageBox.alert("Oops! Something went wrong.\n\n" +
								"Try reloading the page or contact your System Administrator if the problem persists.", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error"
								});*/
					});
			},
			function(error) {
				/*	sap.m.MessageBox.alert("Oops! Something went wrong.\n\n" +
						"Try reloading the page or contact your System Administrator if the problem persists.", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error"
						});*/
			});

		var b = this.getView().getModel().createBatchOperation("EventMessageHeaderS", "POST", this._EventMessage);
		this.getView().getModel().addBatchChangeOperations(
			[b]);
		this.getView().getModel().submitBatch(function(d) {
			if (!d.__batchResponses[0].response) {
				sap.m.MessageToast.show(jQuery.sap.parseJS(d.__batchResponses[0].__changeResponses[0].headers["sap-message"]).message, {
					duration: 5000
				});
				t.fnBindContainers(g, true)
			} else {
				jQuery.sap.require("sap.ca.ui.message.message");
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: jQuery.sap.parseJS(d.__batchResponses[0].response.body).error.message.value
				})
			}
		}, function(d) {
			if (d.__batchResponses[0].response) {
				jQuery.sap.require("sap.ca.ui.message.message");
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: jQuery.sap.parseJS(d.__batchResponses[0].response.body).error.message.value
				})
			}
		}, false);
		this._EventMessage = new sap.zzem.fo.visibility.util.EventMessage();
		this._EventMessage.TrackingID = c.getProperty(
			"MasterTrackingID");
		this._EventMessage.TrackingIDType = c.getProperty("MasterTrackingIDType")
	},
	fnOnAddButtonPressed: function() {
		var r = this._getDelayEventDialog(true);
		r.setModel(this.getView().getModel("i18n"), "i18n");
		r.setModel(this.getView().getModel());
		var c = r.getContent()[0].getContent()[1];
		if (c.getItems().length === 1) {
			c.setSelectedItem(c.getItems()[0]);
			c.fireSelectionChange({
				selectedItem: c.getItems()[0]
			})
		}
		
		this.getPosition2();
		r.open()
	},
	fnActualDate: function(e) {
		this.fnSetEventDateToMessage(e.getParameters().dateValue)
	},
	fnOnEventCodeChange: function(e) {
		this._getDelayEventDialog().getContent()[1].removeAllContent();
		var f = this._getDelayEventDialog().getDependents();
		var k = e.getParameters().selectedItem.getKey();
		this._EventMessage.EventCode = k;
		var c = f.filter(function(F) {
			return F.getTitle().getText() === e.getParameters().selectedItem.getText()
		});
		c[0].setBindingContext(this.getView().byId("EventMessageTable").getBindingContext());
		var i = c[0].getContent()[1];
		i.setFilterFunction(function(v, I) {
			var r = new RegExp(v, "i");
			return (r.test(I.getCells()[0].getText()) || r.test(I.getCells()[1].getText())) && (I.getBindingContext().getProperty(
				"EventStatusExtended") === "02" || I.getBindingContext().getProperty("EventStatusExtended") === "03")
		});
		var E = new sap.ui.model.Filter("EventStatusExtended", sap.ui.model.FilterOperator.EQ, "02");
		i.getBinding("suggestionRows").filter([E]);
		this._getDelayEventDialog().getContent()[1].addContent(c[0]);
		this._getDelayEventDialog().invalidate();
	},
	fnOnProperty: function(e) {
		if (e.getSource().getCustomData()[0].getKey() === "Location") {
			this._EventMessage.ToEventMessageLocation[0].EventLocation = e.getSource().getValue();
		} else {
			this._EventMessage[e.getSource().getCustomData()[0].getValue()] = e.getSource().getValue();
		}
		this.fnCheckRequiredFields(e.getSource());
	},
	fnOnPropertyEnhanced: function(e) {
		var p = new sap.zzem.fo.visibility.util.EventMessageParameter();
		p.ParameterValue = e.getParameter("selectedRow").getBindingContext().getProperty("EventCode");
		p.ParameterName = "ODT40_EXPEC_DELAY_REF_EE";
		this._EventMessage.ToEventMessageParameter.push(p);
		var P = new sap.zzem.fo.visibility.util.EventMessageParameter();
		P.ParameterValue = e.getParameter("selectedRow").getBindingContext().getProperty("EventLocation");
		P.ParameterName = "ODT40_EXPEC_DELAY_REF_EE_LOC";
		this._EventMessage.ToEventMessageParameter.push(P);
		var v = e.getParameter("selectedRow").getCells()[0].getText() + "\t" + e.getParameter("selectedRow").getCells()[1].getText();
		e.getSource().setValue(v);
	},
	fnOnParameter: function(e) {
		var c = e.getSource().getCustomData();
		var p = new sap.zzem.fo.visibility.util.EventMessageParameter();
		p.ParameterValue = e.getSource().getValue();
		p.ParameterName = c[0].getValue();
		p.ParameterAction = c[1].getValue();
		p.ParameterType = c[2].getValue();
		this._EventMessage.ToEventMessageParameter.push(p);
		this.fnCheckRequiredFields(e.getSource());
	},
	fnCheckRequiredFields: function() {
		var c = this._getDelayEventDialog().getContent()[1].getContent()[0].getContent();
		for (var i = 0; i < c.length; i++) {
			if (c[i].getMetadata().getName() === "sap.m.Label") {
				if (c[i].getRequired()) {
					if (!c[i + 1].getValue()) {
						this._getDelayEventDialog().getBeginButton().setEnabled(false);
						return;
					}
				}
			}
		}
		this._getDelayEventDialog().getBeginButton().setEnabled(true);
	},
	fnReportOK: function() {
		this._getDelayEventDialog().close();
		this.fnSendEventMessage();
	},
	fnSendEventMessage: function() {
		var c = this.getView().byId("detailHeader").getBindingContext();
		var g = c.getProperty("EventHandlerUUID");
		var t = this;

		var oData = {};

		oData.Trxid = this._EventMessage.TrackingID;
		oData.Trxcod = this._EventMessage.TrackingIDType;
		oData.Evtid = this._EventMessage.EventCode;
		oData.Latitude = sap.ui.getCore().byId("txtLatitude1").getText();
		oData.Longitude = sap.ui.getCore().byId("txtLongitude1").getText();
		oData.Locid1 = this._EventMessage.ToEventMessageLocation[0].EventLocation;
		oData.Evtcnt = this._EventMessage.EventCounter;
		oData.Evtdat = this._EventMessage.EventDate;
		oData.Evttim = this._EventMessage.EventTime;

		//Initating Post
		var that = this;
		var sServiceUrl = "/sap/opu/odata/sap/ZEM_NOVIGO_UPDATES_SRV/";
		var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl);

		OData.request({
				requestUri: "/sap/opu/odata/sap/ZEM_NOVIGO_UPDATES_SRV/?$metadata",
				method: "GET",
				headers: {
					"X-Requested-With": "XMLHttpRequest",
					"Content-Type": "application/json",
					"DataServiceVersion": "2.0",
					"X-CSRF-Token": "Fetch"
				}
			},
			function(data, response) {
				var header_xcsrf_token = response.headers['x-csrf-token'];

				OData.request({
						requestUri: "/sap/opu/odata/sap/ZEM_NOVIGO_UPDATES_SRV/ZEventMessageHeaderSet",
						method: "POST",
						headers: {
							"X-Requested-With": "XMLHttpRequest",
							"Content-Type": "application/json",
							"DataServiceVersion": "2.0",
							"Accept": "application/json",
							"X-CSRF-Token": header_xcsrf_token
						},
						data: oData
					},
					function(data, response) {
						//MessageToast.show("Ticket Successfully Saved with Ticket No: " + response.data.EvObjectId + ".");
					},
					function(err) {
						/*	sap.m.MessageBox.alert("Oops! Something went wrong.\n\n" +
								"Try reloading the page or contact your System Administrator if the problem persists.", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error"
								});*/
					});
			},
			function(error) {
				/*	sap.m.MessageBox.alert("Oops! Something went wrong.\n\n" +
						"Try reloading the page or contact your System Administrator if the problem persists.", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error"
						});*/
			});

		var b = this.getView().getModel().createBatchOperation("EventMessageHeaderS", "POST", this._EventMessage);
		this.getView().getModel().addBatchChangeOperations(
			[b]);
		this.getView().getModel().submitBatch(function(d) {
			if (!d.__batchResponses[0].response) {
				sap.m.MessageToast.show(jQuery.sap.parseJS(d.__batchResponses[0].__changeResponses[0].headers["sap-message"]).message, {
					duration: 5000
				});
				t.fnBindContainers(g, true)
			} else {
				jQuery.sap.require("sap.ca.ui.message.message");
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: jQuery.sap.parseJS(d.__batchResponses[0].response.body).error.message.value
				})
			}
		}, function(d) {
			if (d.__batchResponses[0].response) {
				jQuery.sap.require("sap.ca.ui.message.message");
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: jQuery.sap.parseJS(d.__batchResponses[0].response.body).error.message.value
				})
			}
		}, false);
		this._EventMessage = new sap.zzem.fo.visibility.util.EventMessage();
		this._EventMessage.TrackingID = c.getProperty(
			"MasterTrackingID");
		this._EventMessage.TrackingIDType = c.getProperty("MasterTrackingIDType")
	},
	
	onSign: function(oEvent) {
			var canvas = document.getElementById("signature-pad");
			
			canvas.width = 276;
			canvas.height = 180;
			
			var signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
				backgroundColor: '#f0f4f9',
				penColor: 'rgb(0, 0, 0)'
			});
			
			//var context = canvas.getContext("2d");
			//canvas.width = 276;
			//canvas.height = 180;
			//context.fillStyle = "#f0f4f9";
			//context.strokeStyle = "#444";
			//context.lineWidth = 1.5;
			//context.lineCap = "round";
			//context.fillRect(0, 0, canvas.width, canvas.height);
			var empty;
			var disableSave = true;
			var pixels = [];
			var cpixels = [];
			var xyLast = {};
			var xyAddLast = {};
			var calculate = false; 
			{ //functions
				function remove_event_listeners() {
					canvas.removeEventListener('mousemove', on_mousemove, false);
					canvas.removeEventListener('mouseup', on_mouseup, false);
					canvas.removeEventListener('touchmove', on_mousemove, false);
					canvas.removeEventListener('touchend', on_mouseup, false);

					document.body.removeEventListener('mouseup', on_mouseup, false);
					document.body.removeEventListener('touchend', on_mouseup, false);
				}

				function get_coords(e) {
					var x, y;

					if (e.changedTouches && e.changedTouches[0]) {
						var offsety = canvas.offsetTop || 0;
						var offsetx = canvas.offsetLeft || 0;

						x = e.changedTouches[0].pageX - offsetx;
						y = e.changedTouches[0].pageY - offsety;
					} else if (e.layerX || 0 == e.layerX) {
						x = e.layerX;
						y = e.layerY;
					} else if (e.offsetX || 0 == e.offsetX) {
						x = e.offsetX;
						y = e.offsetY;
					}

					return {
						x: x,
						y: y
					};
				};

				function on_mousedown(e) {
					e.preventDefault();
					e.stopPropagation();

					canvas.addEventListener('mouseup', on_mouseup, false);
					canvas.addEventListener('mousemove', on_mousemove, false);
					canvas.addEventListener('touchend', on_mouseup, false);
					canvas.addEventListener('touchmove', on_mousemove, false);
					document.body.addEventListener('mouseup', on_mouseup, false);
					document.body.addEventListener('touchend', on_mouseup, false);

					empty = false;
					var xy = get_coords(e);
					context.beginPath();
					pixels.push('moveStart');
					context.moveTo(xy.x, xy.y);
					pixels.push(xy.x, xy.y);
					xyLast = xy;
				};

				function on_mousemove(e, finish) {
					e.preventDefault();
					e.stopPropagation();

					var xy = get_coords(e);
					var xyAdd = {
						x: (xyLast.x + xy.x) / 2,
						y: (xyLast.y + xy.y) / 2
					};

					if (calculate) {
						var xLast = (xyAddLast.x + xyLast.x + xyAdd.x) / 3;
						var yLast = (xyAddLast.y + xyLast.y + xyAdd.y) / 3;
						pixels.push(xLast, yLast);
					} else {
						calculate = true;
					}

					context.quadraticCurveTo(xyLast.x, xyLast.y, xyAdd.x, xyAdd.y);
					pixels.push(xyAdd.x, xyAdd.y);
					context.stroke();
					context.beginPath();
					context.moveTo(xyAdd.x, xyAdd.y);
					xyAddLast = xyAdd;
					xyLast = xy;

				};

				function on_mouseup(e) {
					remove_event_listeners();
					disableSave = false;
					context.stroke();
					pixels.push('e');
					calculate = false;
				};
				canvas.addEventListener('touchstart', on_mousedown, false);
				canvas.addEventListener('mousedown', on_mousedown, false);
			}

		},
		
		base64ImageToBlob: function(str) {
			// extract content type and base64 payload from original string
			var pos = str.indexOf(';base64,');
			var type = str.substring(5, pos);
			var b64 = str.substr(pos + 8);

			// decode base64
			var imageContent = atob(b64);

			// create an ArrayBuffer and a view (as unsigned 8-bit)
			var buffer = new ArrayBuffer(imageContent.length);
			var view = new Uint8Array(buffer);

			// fill the view, using the decoded base64
			for (var n = 0; n < imageContent.length; n++) {
				view[n] = imageContent.charCodeAt(n);
			}

			// convert ArrayBuffer to Blob
			var blob = new Blob([buffer], {
				type: type
			});

			return blob;
		},

		saveButton: function(oEvent) {
			var canvas = document.getElementById("signature-pad");
			/*var link = document.createElement('a');
			link.href = canvas.toDataURL('image/jpeg');
			link.download = 'sign.jpeg';
			link.click();*/
			
			var sObjectId = this._EventMessage.TrackingID;

			var imageData = canvas.toDataURL('image/png');
			var file = this.base64ImageToBlob(imageData);

			var url1 = "/sap/opu/odata/sap/ZTM_MAP_SRV/FreightOrderSet";

			var csrfToken = "";

			var aData = jQuery.ajax({
				url: url1,
				headers: {
					"X-CSRF-Token": "Fetch",
					"X-Requested-With": "XMLHttpRequest",
					"Content-Type": "image/png",
					"DataServiceVersion": "2.0"
				},
				type: "GET",
				//jsonpCallback : �getJSON�,
				contentType: "application/json",
				dataType: 'json',

				//data : ��,
				success: function(data, textStatus, jqXHR) {
					csrfToken = jqXHR.getResponseHeader('x-csrf-token');
					var oHeaders = {
						"x-csrf-token": csrfToken,
						"slug": "; host_uuid=" + sObjectId + "; overwrite=abap_false",
						"X-Requested-With": "XMLHttpRequest",
						"Content-Type": "image/png",
						"DataServiceVersion": "2.0",
						"Accept": "image/png, */*"
					};

					jQuery.ajax({
						type: "POST",
						url: "/sap/opu/odata/sap/ZTM_MAP_SRV/AttachmentSet",
						headers: oHeaders,
						cache: false,
						contentType: "image/png",
						dataType: "text",
						processData: false,
						data: file,
						success: function(evt) {
							//MessageToast.show("File Uploaded Successfully.");
						},
						error: function(evt) {
							//MessageToast.show("Upload Failed.");
						}

					});

					//	sap.m.MessageToast.show("File Uploaded Successfully.");
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					//	sap.m.MessageToast.show("Failed to upload!!");
				}
			});
			
			var signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
				backgroundColor: '#f0f4f9',
				penColor: 'rgb(0, 0, 0)'
			});
		},

		/************Clear Signature Pad**************************/

		clearButton: function(oEvent) {
			var canvas = document.getElementById("signature-pad");
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);

			var signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
				backgroundColor: '#f0f4f9',
				penColor: 'rgb(0, 0, 0)'
			});
			//penWidth: '1'
		}
});