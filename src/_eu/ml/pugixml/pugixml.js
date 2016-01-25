//Define namespace
var EU = EU || {};

EU.pugixml = {
    /**
     * the XML is a xml document now :D
     * to navigate you can use
     * xml.getElementsByTagName("tagName");
     * xml.querySelector("selector");
     * xml.querySelectorAll("[attr=value]");
     * For example:
     * var tagObj=xmlDoc.getElementsByTagName("marker");
     * var typeValue = tagObj[0].getElementsByTagName("type")[0].childNodes[0].nodeValue;
     * var titleValue = tagObj[0].getElementsByTagName("title")[0].childNodes[0].nodeValue;
     * @param {String} xmlFile path to xmlFile
     * @returns xmlDocument
     */
    readXml: function(xmlFile){
        var xmlDoc;
        var xmlhttp;
        if (typeof window.DOMParser != "undefined") {
            xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", xmlFile, false);
            if (xmlhttp.overrideMimeType) {
                xmlhttp.overrideMimeType('text/xml');
            }
            xmlhttp.send();
            xmlDoc = xmlhttp.responseXML;
        }
        else {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.load(xmlFile);
        }
        return xmlDoc;
    }
};

