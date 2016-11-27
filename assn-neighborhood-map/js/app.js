var model = [{
    'name': 'Jiefangbei CBD',
    'location': {
        'lat': 29.557171,
        'lng': 106.577060
    }
}, {
    'name': 'Ciqikou, Chongqing',
    'location': {
        'lat': 29.578068,
        'lng': 106.450593
    }
}, {
    'name': 'Chaotianmen Bridge',
    'location': {
        'lat': 29.585523,
        'lng': 106.578911
    }
}, {
    'name': 'Three Gorges Museum',
    'location': {
        'lat': 29.562055,
        'lng': 106.550427
    }
}, {
    'name': 'Mount Jinfo',
    'location': {
        'lat': 29.019637,
        'lng': 107.174434
    }
}, {
    'name': 'Chongqing',
    'location': {
        'lat': 29.565943,
        'lng': 106.547296
    }
}, {
    'name': 'Dazu Rock Carvings',
    'location': {
        'lat': 29.754561,
        'lng': 105.802660
    }
}, ];

// make markers and infowindow global, so viewmodel can access
var markers = {};
var infowindow;

// knockout view model
function ViewModel() {
    var self = this;
    self.lists = ko.observableArray(model);
    self.inputText = ko.observable('');
    self.selectedName = ko.observable('');
    self.enableListBtn = ko.observable(true);
    self.toggleState = ko.observable(true);
    self.toggle = function(elem) {
        self.toggleState(!self.toggleState());
        $('#listContainer').slideToggle();
        console.log('toggle');
    };
    // if one item in the lists is selected, simulate the marker is clicked too.
    self.selector = function(e) {
        var name = e.name;
        google.maps.event.trigger(markers[name], 'click');
    };
    //use ko's filter utils function to filter lists by input text
    self.filteredLists = ko.computed(function() {
        // every time input some text should reset all marker's icon and infowindow
        for (var key in markers) {
            markers[key].setIcon(null);
            infowindow.close();
        }
        var filter = self.inputText().toLowerCase();
        if (!filter) {
            // if not filter, close info window and reset all markers again 
            for (var markerKey in markers) {
                markers[markerKey].setVisible(true);
                markers[markerKey].setIcon(null);
            }
            return self.lists();
        } else {
            return ko.utils.arrayFilter(self.lists(), function(list) {
                // return ko.utils.stringStartsWith(list.name.toLowerCase(), filter);
                var isFiltered = list.name.toLowerCase().indexOf(filter);
                if (isFiltered == -1) {
                    markers[list.name].setVisible(false);
                    infowindow.close();
                } else {
                    markers[list.name].setVisible(true);
                }
                return isFiltered !== -1;
            });
        }
    });

    // listen to the window innerWidth changing or browser resizing,
    // if it is wider than 480px, disable the listview toggle button,
    // and make sure the list view showing
    if (window.innerWidth > 480) {
        self.enableListBtn(false);
    }
    $(window).load(function() {
        $(window).resize(function() {
            self.enableListBtn(window.innerWidth <= 480);
            if (window.innerWidth > 480) {
                self.toggleState(true);
                $('#listContainer').slideDown();
            }
        });
    });
}
var viewModel = new ViewModel();

// map callback method
function initMap() {
    'use strict';

    // first set up the map
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            'lat': 29.565943,
            'lng': 106.547296
        },
        scrollwheel: false,
        zoom: 10
    });

    //create one infowindow
    infowindow = new google.maps.InfoWindow();

    // call Wikipedia API
    function getWikipediaContent(marker, name) {
        // concerns of the ajax request, show an spinner GIF before
        // the real content is retrieved
        infowindow.setContent('<img src="ajax-loader.gif">');
        infowindow.open(map, marker);

        var wikiURL = 'https://en.wikipedia.org/w/api.php?';
        // these parameters: 'prop' is to get wikipedia page's infomation
        // the page text and page's main image. exsentences is set to just 
        // get the first 6 sentences of the page.
        wikiURL += $.param({
            'action': 'query',
            'titles': name,
            'prop': 'info|extracts|pageimages',
            'inprop': 'url',
            'exsentences': 6,
            'pithumbsize': 300,
            'format': 'json',
        });
        $.ajax({
                url: wikiURL,
                dataType: 'jsonp',
                success: function(e) {
                    // open info window once get the infomations
                    var pages = e.query.pages[Object.keys(e.query.pages)[0]];
                    var pageLink = pages.canonicalurl;
                    var pageImg = pages.thumbnail.source || 'http://placehold.it/300x200&text=Image+not+found';

                    infowindow.setContent('<div id="infoWindow">' +
                        '<img src=' + pageImg + ' alt="location image">' +
                        pages.extract +
                        '<a href=' + pageLink + '>' + 'More on Wikipedia page' + '</a>' +
                        '</div>');


                    //clear already selected icon

                    // To reviewer, :)
                    // markers is an object instead of an array, 
                    // so, I use 'for in' to iterate it, I'm not sure if this
                    // is ok? Can you tell me please. Thanks!
                    for (var key in markers) {
                        markers[key].setIcon(null);
                    }
                    // then change seleted marker icon to green
                    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                }
            })
            .fail(function() {
                alert("Sorry, can't get the location's wikipedia page. -.-");
            });

    }

    // add marker and listner, then store it in array markers
    function addMarker(map, latLnt, name) {
        var marker = new google.maps.Marker({
            position: latLnt,
            map: map
        });
        marker.addListener('click', function(e) {
            // call third party API and set the infowindow content
            viewModel.selectedName(name);
            //set map center to selected marker

            map.panTo(marker.getPosition(), 3000);
            // map.setZoom(14);
            getWikipediaContent(marker, name);
        });
        markers[name] = marker;
    }

    //create a bounds variable to set fit bounds later
    var mapBounds = new google.maps.LatLngBounds();
    // iterate the data and add all markers on map
    viewModel.lists().forEach(function(data) {
        var latLng = new google.maps.LatLng(data.location.lat, data.location.lng);
        addMarker(map, latLng, data.name);
        mapBounds.extend(latLng);
    });
    // fitbounds first time
    map.fitBounds(mapBounds);
    // fitbounds everytime user resize the browser
    $(window).resize(function() {
        map.fitBounds(mapBounds);
    });

    // binding view model
    ko.applyBindings(viewModel);
}

function mapErrorHandler() {
    alert('Map can not be loaded...');
}