sap.ui.define(
  [
    "sap/btp/ui5challange/controller/App.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/SearchField",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (BaseController, Filter, FilterOperator, Fragment, SearchField) {
    "use strict";

    return BaseController.extend("sap.btp.ui5challange.controller.Overview", {
      onInit: function () {
        this._initFilterBar();
      },

      /**
       * Initialize the filter bar and basic search field
       * populates {controller} with oFilterBar and oSearchField properties
       * @returns {sap.ui.comp.filterbar.FilterBar}
       */
      _initFilterBar: function () {
        this.oFilterBar = this.byId("FilterBar");
        this.oBasicSearch = new SearchField("BasicSearch", {
          liveChange: this.onSearch.bind(this),
        });

        this.oFilterBar.registerGetFiltersWithValues(
          this.fGetFiltersWithValues
        );
        this.oFilterBar.fireInitialise();
        this.oFilterBar.setBasicSearch(this.oBasicSearch);
      },

      /**
       * Event handler for the search field
       * and filterbar group items change event
       * If no search query given or filters set - resets the filter
       * @param {sap.ui.base.Event} oEvent
       */
      onSearch: function (oEvent) {
        const sQuery = this.oFilterBar.getBasicSearchValue().trim();
        const aFiltersWithValue = this.oFilterBar._getFiltersWithValues();
        const bResetBinding =
          sQuery.length === 0 && aFiltersWithValue.length === 0;
        const oTable = this.byId("OverviewTable");
        const oBinding = oTable.getBinding("items");
        let aFilters = [];

        if (bResetBinding) return oBinding.filter([]);

        if (aFiltersWithValue.length > 0) {
          aFilters = aFiltersWithValue.map(this.getModelFilters);
        }

        if (sQuery.length > 0) {
          aFilters.push(new Filter("app_id", FilterOperator.Contains, sQuery));
        }

        oBinding.filter(new Filter(aFilters, false));
      },

      /**
       * A function to register private sap.ui.comp.filterbar.FilterBar
       * method getFiltersWithValues
       * @returns {sap.ui.comp.filterbar.getFilterGroupItem[]}
       */
      fGetFiltersWithValues: function () {
        const aFilters = this.getFilterGroupItems();
        const aFiltersWithValue = [];

        for (let i = 0; i < aFilters.length; i++) {
          let oControl = this.determineControlByFilterItem(aFilters[i]);
          if (oControl && oControl.getValue && oControl.getValue()) {
            aFiltersWithValue.push(aFilters[i]);
          }
        }

        return aFiltersWithValue;
      },

      /**
       * Method that clears the filterbar Comboboxes
       * and BasicSearchField values and triggers binding refresh
       * @param {sap.ui.base.Event} oEvent
       */
      onClear: function (oEvent) {
        const aFiltersWithValues = this.oFilterBar._getFiltersWithValues();
        const oTable = this.byId("OverviewTable");
        const oBinding = oTable.getBinding("items");

        aFiltersWithValues.forEach((oGroupItem) => {
          const oControl = oGroupItem.getControl();
          oControl.setSelectedKey("");
        });
        this.oBasicSearch.setValue("");
        oBinding.filter([]);
      },

      /**
       * Method to get the service field name in CustomData
       * and selected key from Comboboxes and build a filter
       * @param {sap.ui.comp.filterbar.getFilterGroupItem} oGroupItem
       * @returns {sap.ui.model.Filter}
       */
      getModelFilters: function (oGroupItem) {
        const oControl = oGroupItem.getControl();
        const sProperty = oControl.data("filterProperty");
        const sSearchValue = oControl.getSelectedKey() || oControl.getValue();
        const oFilter = new Filter(sProperty, FilterOperator.EQ, sSearchValue);
        return oFilter;
      },

      /**
       * Input valueHelpRequest event handler
       * loads and opens the SelectDialog fragment
       * @param {sap.ui.base.Event} oEvent
       */
      handleValueHelp: function (oEvent) {
        const oView = this.getView();
        const oSource = oEvent.getSource();
        this._sInputId = oSource.getId();

        // create value help dialog
        if (!this._pSelectDialog) {
          Fragment.load({
            id: oView.getId(),
            name: "sap.btp.ui5challange.view.fragments.Dialog",
            controller: this,
          }).then((oSelectDialog) => {
            oView.addDependent(oSelectDialog);
            this._pSelectDialog = oSelectDialog;
            this._pSelectDialog.open();
          });
        } else {
          this._pSelectDialog.open();
        }
      },

      /**
       * Event handler for SelectDialog liveChange event
       * @param {sap.ui.base.Event} oEvent
       */
      handleSelectDialogSearch: function (oEvent) {
        const oSource = oEvent.getSource();
        const sValue = oEvent.getParameter("value");
        const oBinding = oSource.getBinding("items");
        const oFilter = new Filter(
          "assign_group",
          FilterOperator.Contains,
          sValue
        );

        oBinding.filter([oFilter]);
      },
      /**
       * Event handler for the confirm event of the value help dialog
       * sets the value of the input and resets the dialog binding
       * @param {sap.ui.base.Event} oEvent
       */
      handleSelectDialogClose: function (oEvent) {
        const oSource = oEvent.getSource();
        const oSelectedItem = oEvent.getParameter("selectedItem");
        const oBinding = oSource.getBinding("items");

        if (oSelectedItem) {
          const productInput = this.byId(this._sInputId);
          productInput.setValue(oSelectedItem.getTitle());
        }

        oBinding.filter([]);
        this.oFilterBar.fireSearch(oEvent);
      },

      /**
       * Handels binding filtering in case of input value being cleaned
       * @param {sap.ui.base.Event} oEvent
       * @returns
       */
      onInputChange: function (oEvent) {
        const sValue = oEvent.getParameter("value").trim();

        if (sValue) return;
        this.oFilterBar.fireSearch(oEvent);
      },

      /**
       * Event handler for dialog cancel event
       * refreshes the items binding in case of cancel button is pressed
       * @param {sap.ui.base.Event} oEvent
       */
      handleSelectDialogCancel: function (oEvent) {
        const oSource = oEvent.getSource();
        const oBinding = oSource.getBinding("items");

        oBinding.filter([]);
      },
    });
  }
);
