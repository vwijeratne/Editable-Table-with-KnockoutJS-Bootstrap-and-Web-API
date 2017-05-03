window.app = {};

window.app.service = (function () {
    var baseUrl = 'http://localhost:59208/api/person';
    var serviceUrls = {
        getPeople: function () { return baseUrl; },
        update: function (id) { return baseUrl + '/' + id; }
    }
    //Common ajax calls
    function ajaxRequest(type, Url, data) {
        var options = {
            url: Url,
            headers: {
                Accept: "application/json"
            },
            contentType: "application/json",
            cache: false,
            type: type,
            data: data ? ko.toJSON(data) : null
        };
        return $.ajax(options);
    }
    //Functions that retrieves and updates
    return {
        getPeople: function () {
            return ajaxRequest('get', serviceUrls.getPeople());
        },
        update: function (person) {
            return ajaxRequest('put', serviceUrls.update(person.Id), person);
        }
    };
})();