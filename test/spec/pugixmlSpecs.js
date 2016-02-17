describe("ReadJsonFile", function() {

    //read boxmenu.json
    var jsonString = EU.pugixml.readJSON('boxmenu.json');
    console.log(jsonString);

    it("1 + 1 = 2", function() {
        expect(1+1).toEqual(2);
    });

})