//Define namespace
var EU = EU || {};

var jsonextended = function(json, nodeName){
    var self = this;
    //todo: self should be improved to automatically check for whether it's single level json or not
    self.nodeName = (nodeName == null) ? Object.keys(json)[0] : nodeName;
    self.data = (nodeName == null) ? json[self.nodeName] : json;

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
                        attributeMap.name = keys[i];
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

                    var child = new jsonextended(self.data[keys[i]], keys[i]);
                    childrenArray.push(child);
                }
            }
            return childrenArray;
        },
        set: undefined
     });

    /**
     * get first child element
     */
     Object.defineProperty(self, "firstChildElement", {
        get: function() {
            var childKeys = Object.keys(self.data).filter(function(item){
                return item[0] != '@';
            });

            if (childKeys.length > 0){
                return new jsonextended(self.data[childKeys[0]], childKeys[0]);
            } else return null;
        },
        set: undefined
     });

    /**
     @param {string} name
     @return {string}
     */
    self.getAttribute =  function(name){
        return self.data["@"+name];
    };

    /**
     @param {string} name
     */
    self.removeAttribute = function(name) {
        //using delete operator is significantly slower
        //http://stackoverflow.com/questions/208105/how-do-i-remove-a-property-from-a-javascript-object
        self.data["@"+name] = null;
    };

    /**
     @param {string} name
     @return {boolean}
     */
    self.hasAttribute = function (name) {
        if (self.data["@"+name] == null)
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
       if (!Array.isArray(allChildren)){
           jsonExtendedChildren.push(new jsonextended(allChildren, tagName));
       } else {
           for (var i=0; i<allChildren.length; i++){
               jsonExtendedChildren.push(new jsonextended(allChildren[i], tagName));
           }
       }
       return jsonExtendedChildren;
    };
};