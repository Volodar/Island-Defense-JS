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
    readXml: function(xmlFile, cb, target){
        var xmlDoc;
        var xmlhttp;
        var fullPath = xmlFile.indexOf( EU.xmlLoader.resourcesRoot ) == 0 ?
            xmlFile :
            EU.xmlLoader.resourcesRoot + xmlFile;
        cc.log(fullPath);
        //if (typeof window.DOMParser != "undefined")
        //{
            xmlhttp = cc.loader.getXMLHttpRequest();

            if (cb && target) {
                xmlhttp.open("GET", fullPath, true);
            } else {
                xmlhttp.open("GET", fullPath, false);
            }

            if (xmlhttp.overrideMimeType) {
                xmlhttp.overrideMimeType('text/xml');
            }
            var direction = cc.p(0, 0);
            var rect = cc.rect(0, 0, 0, 0);

            xmlhttp.onreadystatechange = function () {
                //Whatever
                
                //cc.log(xmlhttp.statusText);
                
                if (xmlhttp.readyState == 4) {
                    var response = xmlhttp.response;
                    if ((xmlhttp.status >= 200 && xmlhttp.status <= 226)
                        || xmlhttp.status === 304 || xmlhttp.status === 302) {

                        xmlDoc = xmlhttp.responseXML;
                        if (cb && target) cb.call(target, xmlDoc);

                    } else {
                        //request error
                    }
                }
                
            };
            xmlhttp.send();
        //}
        //else {
        //    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        //    xmlDoc.async = "false";
        //    xmlDoc.load(fullPath);
        //}
        return xmlDoc;
    },
    readJSON: function(jsonFile, cb, target){

        var xmlDoc;
        var xmlhttp;
        var fullPath = jsonFile.indexOf( EU.xmlLoader.resourcesRootJSON ) == 0 ?
                        jsonFile :
                        EU.xmlLoader.resourcesRootJSON + jsonFile;
        cc.log(fullPath);
        //if (typeof window.DOMParser != "undefined")
        //{
            xmlhttp = cc.loader.getXMLHttpRequest(fullPath);

            if (cb && target) {
                xmlhttp.open("GET", fullPath, true);
            } else {
                xmlhttp.open("GET", fullPath, false);
            }

            if (xmlhttp.overrideMimeType) {
                xmlhttp.overrideMimeType('application/json');
            }
            var direction = cc.p(0, 0);
            var rect = cc.rect(0, 0, 0, 0);

            xmlhttp.onreadystatechange = function () {
                //Whatever

                //cc.log(xmlhttp.statusText);

                if (xmlhttp.readyState == 4) {
                    var response = xmlhttp.response;
                    if ((xmlhttp.status >= 200 && xmlhttp.status <= 226)
                        || xmlhttp.status === 304 || xmlhttp.status === 302) {

                        //parse the Json string
                        xmlDoc = new jsonextended(JSON.parse(xmlhttp.responseText));
                        //if (cb && target) cb.call(target, xmlDoc);

                    } else {
                        //request error
                    }
                }

            };
            xmlhttp.send();
        //}
        ////else {
        ////    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        ////    xmlDoc.async = "false";
        ////    xmlDoc.load(fullPath);
        ////}
        return xmlDoc;
    }
};

