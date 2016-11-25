var Model = [
	{"type": "school", "name": "ChongQing University", "location":{"lat": 29.56559, "lng": 106.4676816}},
	{"type": "school", "name": "Nankai Middle School", "location":{"lat": 29.560916, "lng": 106.460636}},
	{"type": "bookshop", "name": "ChongQing University Bookshop", "location":{"lat": 29.565248, "lng": 106.466821, }},
	{"type": "restaurant", "name": "Mcdonalds", "location":{"lat": 29.559285, "lng": 106.462583}},
	{"type": "restaurant", "name": "Maoge", "location":{"lat": 29.564884, "lng": 106.458506}},
	{"type": "restaurant", "name": "Fuwen", "location":{"lat": 29.563018, "lng": 106.454644}},
	{"type": "hotel", "name": "ChongQing University Hotel", "location":{"lat":29.559695, "lng": 106.463270}},
	{"type": "hotel", "name": "Sevendays Hotel", "location":{"lat":29.562606, "lng": 106.454772}},
	{"type": "hotel", "name": "Hanting Hotel", "location":{"lat":29.562457, "lng": 106.462325}},

]


// // knockout view model
// 	//for test
function ViewModel(){
	var self = this;
	self.lists = ko.observableArray(Model);
	self.selector = function(e){
		var name = e.name;
		google.maps.event.trigger(markers[name], 'click');
	};
	self.filtertext = ko.observable("");
	self.filteredLists = ko.computed(function(){
		var filter = self.filtertext().toLowerCase();
		if (!filter) {
			return self.lists();
		}else{
			return ko.utils.arrayFilter(self.lists(), function(list){
				// return ko.utils.stringStartsWith(list.name.toLowerCase(), filter);
				return list.name.toLowerCase().indexOf(filter) !== -1;
			});
		}
	});

	self.testclick = function(){
		// console.log(self.filteredLists(), "test click");
	}

}
var viewModel = new ViewModel();



// make markers global, so viewmodel can access
var markers = {};

function initMap(){
	'use strict';

	// first set up the map
	var map = new google.maps.Map(document.getElementById("map"),{
		center:  {lat: 29.564344, lng: 106.468293},
		scrollwheel: false,
		zoom: 15
	});

	// use jQuery animation to toggle the left side location lists
	var toggleState = true;
	$('#showListBtn').click(function(e){
		if (toggleState) {
			$("#listContainer").animate({
				left: "-200px",
			}, 600, function(){
				//call back
				$('#showListBtn').css("background-color", "grey");
			});
		}else{
			$("#listContainer").animate({
				left: "0px",
			}, 600, function(){
				//call back
				$('#showListBtn').css("background-color", "lightblue");
			});
		}
		toggleState = !toggleState;
	});


	// binding view model
	ko.applyBindings(viewModel);

	//create one infowindow
	var infowindow = new google.maps.InfoWindow();

	// add marker and listner, then store it in array markers
	function addMarker(map,latLnt, name){
		var marker = new google.maps.Marker({
			position: latLnt, name,
			map: map
		});
		marker.addListener('click', function(e){
			infowindow.setContent("Hmmmmmmm");
			infowindow.open(map, marker);
		});
		markers[name] = marker;
	}


	viewModel.lists().forEach(function(data){
		var latLng = new google.maps.LatLng(data.location.lat, data.location.lng);
		addMarker(map, latLng, data.name);
	});


//---------------------- places api
	// //test data
	// var chongda = {lat: 29.564344, lng: 106.468293};
	// chondaLatLng = new google.maps.LatLng(chongda.lat, chongda.lng);
	// // initial place service
	// placeService = new google.maps.places.PlacesService(map);
	// request = {
	// 	location: chondaLatLng,
	// 	radius: "5000",
	// 	types: ["cafe"]
	// 	// types: ["store", "gym", "bakery", "cafe"]
	// };

	// function placesCallback(results, status){
	// 	console.log(results);

	// 	if (status == google.maps.places.PlacesServiceStatus.OK) {
	// 		handlePlacesResults(map, results, status);
	// 	}else{
	// 		console.error(status);
	// 	}
	// 	// console.log("viewModel pushed", viewModel.lists());
	// };


	// placeService.nearbySearch(request, placesCallback);

//---------------------- places api



}

//---------------------- places api
// initial data for test
// var chondaLatLng;
// // global var to store place service
// var placeService;
// var request;


// handle places request results
// function handlePlacesResults(map,results, status){
// 	results.forEach(function(result){
// 		var name = result.name;
// 		var addr = result.formatted_address;
// 		var placeId = result.id;
// 		var location = result.geometry.location;
// 		// console.log(name, addr, placeId);
// 		viewModel.lists().push({
// 			'name': name,
// 			'address': addr,
// 			'placeId': placeId,
// 		});
// 		viewModel.lists(viewModel.lists());
// 		addMarker(map, location);
// 	});
// }
//---------------------- places api






