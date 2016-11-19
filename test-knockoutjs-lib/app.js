(function(){
		var catData = [
		{
			catName: "flaphy",
			imgUrl: "cat.jpeg",
			clicks: 0,
			nickName: ['miffy', 'fluppy', 'kitty'],
		},
		{
			catName: "flaphy01",
			imgUrl: "cat.jpeg",
			clicks: 0,
			nickName: ['muddy', 'hum'],
		},
		{
			catName: "flaphy02",
			imgUrl: "cat.jpeg",
			clicks: 0,
			nickName: ['Zxxx', 'xo'],
		},
		{
			catName: "flaphy03",
			imgUrl: "cat.jpeg",
			clicks: 0,
			nickName: ['star', 'war'],
		},
	];


	var Cat = function(data){
		this.catName= ko.observable(data.catName);
		this.imgUrl = ko.observable(data.imgUrl);
		this.clicks = ko.observable(data.clicks);
		this.nickName = ko.observableArray(data.nickName);
		this.changeName = ko.computed(function(){
			if (this.clicks > 2) {
				this.catName += "SUPER";
			}
		});
		this.newName = function(e){
			// this.catName('new Name');
			console.log(this.catName());
		};


	}

	var viewModel = function(){
		this.cats = ko.observable([]);
		catData.forEach(function(data){
			this.cats().push(new Cat(data));
		});
		this.currentCat = ko.observable(this.cats()[0]);
		var self = this;

		this.increament = function(xx){
			xx.clicks(xx.clicks()+1);
			// console.log(this.catName())
		};

	};

	ko.applyBindings(viewModel);
})();