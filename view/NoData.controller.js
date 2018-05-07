/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
sap.ui.controller("zzem.fo.visibility.view.NoData",{
  handleNavButton  : function() {
    var oSplitApp = this.getView().getParent().getParent();
    var oMaster = oSplitApp.getMasterPages()[0];
    oSplitApp.toMaster(oMaster, "flip");
  }
});