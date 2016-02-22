//Define namespace
var EU = EU || {};

var jsonextended = function(json, isDocRoot){
    var self = this;
    isDocRoot = isDocRoot || false;
    self.nodeName = isDocRoot ? 'doc' : Object.keys(json)[0];
    self.data = isDocRoot ? json : json[self.nodeName];

    /**
     * DOM-element-like function
     */

    /**
     * get tag name of element
     */
    Object.defineProperty(self, "tagName", {
        get: function() {
           return self.nodeName;
        },
        set: undefined
    });

    /**
     * get an array of all attributes
     */
    Object.defineProperty(self, "attributes", {
            get: function() {
                var keys = Object.keys(self.data);
                var attributesArray = [];

                for (var i=0; i<keys.length; i++) {
                    if (keys[i][0] == '@') {     //attribute starts with @

                        var attributeMap = {};
                        attributeMap.name = keys[i].substr(1);
                        attributeMap.value = self.data[keys[i]];
                        attributesArray.push(attributeMap);
                    }
                }
                return attributesArray;
            },
            set: undefined
    });

    /**
     * get an array of all children
      */
     Object.defineProperty(self, "children", {
        get: function() {
            var keys = Object.keys(self.data);
            var childrenArray = [];

            for (var i=0; i<keys.length; i++) {
                if (keys[i][0] != '@') {     //attribute starts with @
                    childrenArray = childrenArray.concat(self.getElementsByTagName(keys[i]));
                }
            }
            return childrenArray;
        },
        set: undefined
     });

    /**
     * get first child element
     */
     Object.defineProperty(self, "firstElementChild", {
        get: function() {
            var childKeys = Object.keys(self.data).filter(function(item){
                return item[0] != '@';
            });

            if (childKeys.length > 0){
                return self.buildElement(self.data[childKeys[0]], childKeys[0]);
            } else return null;
        },
        set: undefined
     });

    /**
     * get text content
     */
    Object.defineProperty(self, "textContent", {
        get: function() {
            return self.data;
        },
        set: undefined
    });

    /**
     @param {string} name
     */
    self.getAttribute =  function(name){
        if (self.hasAttribute(name)) {
            return self.data["@" + name];
        } else
            return null;
    };

    /**
     * set attribute
     * @param className
     * @param value
     */
    self.setAttribute = function(className, value){
        self.data["@"+className] = value;
    };

    /**
     @param {string} name
     */
    self.removeAttribute = function(name) {
        //using delete operator is significantly slower
        //http://stackoverflow.com/questions/208105/how-do-i-remove-a-property-from-a-javascript-object
        if (self.hasAttribute(name)) {
            self.data["@" + name] = null;
        }
    };

    /**
     @param {string} name
     @return {boolean}
     */
    self.hasAttribute = function (name) {
        if (typeof self.data["@" + name] == 'undefined' || self.data["@" + name] == null)
            return false;
        else
            return true;
    };

    /**
     * get an element by tag name
     * @param {string} tagName
     */
    self.getElementsByTagName = function (tagName) {
       var allChildren = self.data[tagName];

       var jsonExtendedChildren = [];
        if (typeof allChildren != 'undefined' && allChildren != null) {
           if (!Array.isArray(allChildren)) {
               jsonExtendedChildren.push(self.buildElement(allChildren, tagName));
           } else {
               for (var i = 0; i < allChildren.length; i++) {
                   jsonExtendedChildren.push(self.buildElement(allChildren[i], tagName));
               }
           }
       }
       return jsonExtendedChildren;
    };


    /**
     * build a xml-like object
     * @param data
     * @param tagName
     * @returns {jsonextended}
     */
    self.buildElement = function (data, tagName){
        if (typeof data == 'undefined') return null;

        var element = {};
        element[tagName] = data;
        return new jsonextended(element);
    }
};