/******************************************************************************
 * Copyright 2014-2016 Vladimir Tolmachev
 * Copyright 2016 Visionarity AG
 * Vladimir Tolmachev and Visionarity AG have unlimited commercial
 * licenses for commercial use and customization
 *
 * Author: Vladimir Tolmachev (tolm_vl@hotmail.com)
 * Ported C++ to Javascript: Visionarity AG / Vladimir Tolmachev
 * Project: Island Defense (JS)
 * If you received the code not from the author, please contact us
 ******************************************************************************/

//Define namespace
var EU = EU || {};


EU.BoxMenu = cc.Menu.extend({
    __BoxMenu: true,

    state: Object.freeze({
        state_close: 0,
        state_open: 1,
        state_wait: 2
    }),
    event: Object.freeze({
        event_open: 0,
        event_close: 1,
        event_wait: 2,
        event_cancel: 3
    }),
    /** @type {Integer} */ _selectedItemIndex: null,
    /** @type {Boolean} */ _isItemSelected: null,
    ctor: function (/**@type {var} */ xml) {
        this._selectedItemIndex = 0;
        this._isItemSelected = false;
        this._super();
        this.initExt();
        this.init_machine();
        this.load_str(xml);
        this.displayCountItems();
        return true;
    },
    init_machine: function () {
        this.initMachine();
        this.add_state(this.state.state_close, this.callback_close.bind(this)).set_string_name("close");
        this.add_state(this.state.state_open, this.callback_open.bind(this)).set_string_name("open");
        this.add_state(this.state.state_wait, this.callback_wait.bind(this)).set_string_name("wait");

        this.add_event(this.event.event_open).set_string_name("open");
        this.add_event(this.event.event_close).set_string_name("close");
        this.add_event(this.event.event_wait).set_string_name("wait");
        this.add_event(this.event.event_cancel).set_string_name("cancel");

        this.state_tag(this.state.state_close).add_transition(this.event.event_open, this.state.state_open);
        this.state_tag(this.state.state_open).add_transition(this.event.event_close, this.state.state_close);
        this.state_tag(this.state.state_open).add_transition(this.event.event_wait, this.state.state_wait);
        this.state_tag(this.state.state_wait).add_transition(this.event.event_close, this.state.state_close);
        this.state_tag(this.state.state_wait).add_transition(this.event.event_cancel, this.state.state_open);

        this.state_tag(this.state.state_close).add_onDeactivateCallBack(this.close_deactivate.bind(this));

        this.start(this.state.state_close);

        return true;
    },
    onEnter: function () {
        this._super();
        this.displayCountItems();
    },
    isItemSelected: function () {
        return this._isItemSelected;
    },
    get_callback_by_description: function (/**@type {var} */ name) {
        var close = function () {
            this.push_event(this.event.event_close);
            this.process();
        };
        var open = function () {
            this.push_event(this.event.event_open);
            this.process();
        };

        var item = function (index) {
            if (this._selectedItemIndex != index) {
                this._isItemSelected = true;
                this.push_event(this.event.event_cancel);
                this.process();

                this._selectedItemIndex = index;
                this.push_event(this.event.event_wait);
                EU.TutorialManager.dispatch("boxmenu_item_did_selected");
            }
            else {
                this.push_event(this.event.event_cancel);
            }
            this.process();
        };

        var itemshop = function () {
            var shop = new EU.ItemShop();
            if (shop) {
                var scene = EU.Common.getSceneOfNode(this);
                scene.pushLayer(shop, true);
            }
        };


        if (name == "close")
            return close.bind(this);
        else if (name == "open")
            return open.bind(this);
        else if (name == "item1")
            return item.bind(this, 1);
        else if (name == "item2")
            return item.bind(this, 2);
        else if (name == "item3")
            return item.bind(this, 3);
        else if (name == "itemshop")
            return itemshop.bind(this);
        else
            return null;
    },
    _onTouchBegan: function (/**@type {Touch*} */ touch, /**@type {Event*} */ event) {
        var self = event.getCurrentTarget();
        var state = self.current_state().get_name();
        switch (state) {
            case self.state.state_close:
                self._isItemSelected = false;
                return cc.Menu.prototype._onTouchBegan( touch, event);
            case self.state.state_open:
            {
                var touchedItem = cc.Menu.prototype._onTouchBegan( touch, event);
                var autoclose = EU.Common.strToBool(self.getParamCollection().get("autoclose", "false"));
                if (touchedItem == false && autoclose) {
                    self.push_event(self.event.event_close);
                    self.process();
                }
                return touchedItem;
            }
            case self.state.state_wait:
            {
                var touchedItem = cc.Menu.prototype._onTouchBegan( touch, event);
                if (touchedItem == false) {
                    if (self.createItem(touch.getLocation())) {
                        var autoclose = EU.Common.strToBool(self.getParamCollection().get("autoclose", "false"));
                        if (autoclose) {
                            self.push_event(self.event.event_close);
                            self.process();
                        }
                        else {
                            self.push_event(self.event.event_cancel);
                            self.process();
                        }
                        EU.TutorialManager.dispatch("boxmenu_item_did_created");
                    }
                }
                return touchedItem;
            }
        }
        return cc.Menu.prototype._onTouchBegan.call( touch, event);
    },
    _onTouchMoved: function (/**@type {Touch*} */ touch, /**@type {Event*} */ event) {
        cc.Menu.prototype._onTouchMoved.call( event.getCurrentTarget(), touch, event);
    },
    _onTouchEnded: function (/**@type {Touch*} */ touch, /**@type {Event*} */ event) {
        cc.Menu.prototype._onTouchEnded.call( event.getCurrentTarget(), touch, event)
    },
    close: function () {
        this.push_event(this.event.event_close);
        this.process();
    },
    createItem: function (/**@type {var} */ location) {
        EU.assert(this._selectedItemIndex != 0);
        if (this._selectedItemIndex > 0) {
            var items = [
                "_laser",
                "_ice",
                "_dynamit"
            ];
            var point = EU.GameGSInstance.getMainLayer().convertToNodeSpace(location);
            var board = EU.GameGSInstance.getGameBoard();
            var item = board.createBonusItem(point, "bonusitem" + items[this._selectedItemIndex - 1]);
            if (item) {
                EU.UserData.bonusitem_sub(this._selectedItemIndex, 1);
                this.displayCountItems();
            }
            return item != null;
        }
        return false;
    },
    displayCountItems: function () {
        var self = this;
        var display = function (index) {
            var menuitem = self.getChildByName("item" + index);
            if (!(menuitem instanceof cc.MenuItem)) menuitem = null;

            var label = menuitem.getChildByName("count");
            if (!(label instanceof cc.LabelBMFont)) label = null;

            var count = EU.UserData.bonusitem_count(index);
            label.setString(count);
            menuitem.setEnabled(count > 0);
        };
        display(1);
        display(2);
        display(3);
    },
    callback_open: function () {
        this.runEvent("open2");
        this._selectedItemIndex = 0;
    },
    callback_close: function () {
        this.runEvent("close");
        EU.TutorialManager.dispatch("boxmenu_did_close");
    },
    callback_wait: function () {
        EU.assert(this._selectedItemIndex != 0);
        this.runEvent("item" + this._selectedItemIndex);
    },
    close_deactivate: function () {
        this.runEvent("open");
        EU.TutorialManager.dispatch("boxmenu_did_open");
    }
});

EU.NodeExt.call(EU.BoxMenu.prototype);
EU.Machine.call(EU.BoxMenu.prototype);
