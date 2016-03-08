#!/usr/bin/python
'''
small Python tool to use convert all xml files in a folder to json with the same name with the option to remove the old file

To run this tool, you need to install these python packages at least: simpleJson, xml2Json.
sudo pip install simplejson
sudo pip install xml2Json

Author: Doan Vu Hiep (hd@visionarity.com)
'''

from xml2json import xml2json
import optparse
from os import listdir, remove
from os.path import isfile, join, splitext, isdir

removeOldXmlFile = False;
sourceDir = '../../res/_origin/ini' ;     #where the source xml files are stored
destinationDir = '../../res/_origin_json/ini'
numFileConverted = 0;

#global option to convert xml to json: pretty indentation
options = optparse.Values({"pretty": True});


def convertXmlFileToJsonFile(filePath):
    global options;

    xmlFile = open(filePath, 'r');
    #print (xmlString)

    jsonString = xml2json(xmlFile.read(), options, 0, 1);

    #print(jsonString)
    #open corresponding json file and write jsonString to it
    jsonFile = open(filePath.replace(sourceDir, destinationDir).replace('.xml', '.json'), 'w');

    jsonFile.write(jsonString);
    jsonFile.close();

    #remove old file
    if (removeOldXmlFile):
        print "removing file: " + filePath;
        remove(filePath);


def convertAllXmlFilesInDir(dir):
    global numFileConverted;

    items = listdir(dir);

    for item in items:
        fullPath = join(dir, item);

        if (isfile(fullPath) and splitext(fullPath)[1] == '.xml' ):    #only convert xml file
            print item
            convertXmlFileToJsonFile(fullPath);
            numFileConverted += 1;
        elif isdir(fullPath):
            print "Going into dir: " + fullPath;
            convertAllXmlFilesInDir(fullPath);

if __name__ == '__main__':
    #convertAllXmlFilesInDir(sourceDir);
    #convertXmlFileToJsonFile(sourceDir+"/units/desant.xml")
    #convertXmlFileToJsonFile(sourceDir+"/units/helicopter.xml")
    #convertXmlFileToJsonFile(sourceDir+"/units/laser1.xml")
    #convertXmlFileToJsonFile(sourceDir+"/units/ship.xml")
    #convertXmlFileToJsonFile(sourceDir+"/units/soldier2.xml")
    #convertXmlFileToJsonFile(sourceDir+"/units/tank.xml")
    convertXmlFileToJsonFile(sourceDir+"/units/bonusitem_dynamit.xml")
    print ("Number of XML files converted: " + str(numFileConverted));
