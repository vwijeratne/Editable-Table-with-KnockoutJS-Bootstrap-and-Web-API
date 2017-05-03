
(function () {
    //Extending the functionality of the observable.
    //Creating a new function called store, so it is possible to cache the old value.
    //This is for save and cancel functionlities.
    ko.observable.fn.store = function () {
        var self = this;
        var oldValue = self();

        //When reading an observable value, the current version of the value is returned.
        var observable = ko.computed({
            read: function () {
                return self();
            },
            //When assigning a new value to an observable, the previous value is saved.
            write: function (value) {
                oldValue = self();
                self(value);

            }

        });

        //When cancelling, the old value is set to the current value.
        this.revert = function () {
            self(oldValue);
        }

        //When saving the current value is set to the old value.
        this.commit = function () {
            oldValue = self();
        }

        return this;
    }

    function person(data) {
        var self = this;
        data = data || {};

        //This is not an observable property
        self.Id = data.Id;
        //These two are observable properties, which can be edited or cancelled
        self.Name = ko.observable(data.Name).store();
        self.Age = ko.observable(data.Age).store();

        self.editing = ko.observable(false);
    };

    //What is bound to the UI
    var ViewModel = function () {
        var self = this;

        self.people = ko.observableArray();
        self.error = ko.observable();
        //Filter input binding. The observable has been set to empty string, because otherwise .length would throw an error.
        self.filterByName = ko.observable('');

        //Callback function for successuflly retrieving all people
        function AddPerson(data) {
            var mapped = ko.utils.arrayMap(data, function (item) {
                return new person(item);
            });
            self.people(mapped);
        }

        //Callback function for unsuccessful people retreavel.
        function onError(error) {
            self.error('Error : ' + error.status + ' ' + error.statusText);
        }

        //Filter - arrayFilter will compare the value entered with each 'record' in the people array.
        //Do not filter records if only no value is entered in the filter input box and no match is found.
        self.txtFilter = ko.computed(function () {
            return ko.utils.arrayFilter(self.people(), function (record) {
                return (self.filterByName().length == 0 ||
                    record.Name().toLowerCase().indexOf(self.filterByName().toLowerCase()) > -1);
            })
        });

        //Invoke the app.service and get all the people from the web api
        self.getAllPeople = function () {
            self.error(''); // Clear the error
            app.service.getPeople().then(AddPerson, onError); //Setting callbacks            
        };

        self.edit = function (person) {
            person.editing(true);
        };

        self.cancel = function (person) {
            revertChanges(person);
            person.editing(false);
        }

        self.save = function (person) {
            app.service.update(person).then(
                function () {
                    commitChanges(person);
                },
                function (error) {
                    onError(error);
                    revertChanges(person);
                }).always(function () {
                    person.editing(false);
                });
        }

        //Committing or reverting each record. hasOwnProperty checks whether this is an observable property.
        function applyFn(person, fn) {
            for (var prop in person) {
                if (person.hasOwnProperty(prop) && person[prop][fn]) {
                    person[prop][fn].apply();
                }
            }
        }

        function commitChanges(person) { applyFn(person, 'commit'); }
        function revertChanges(person) { applyFn(person, 'revert'); }

        self.getAllPeople();
    }
    ko.applyBindings(new ViewModel());

})();