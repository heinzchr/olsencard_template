// +++
// MAIN
// +++
function RouteViewModel(){
	var self = this;
	self.allRoutes = ko.observableArray(["Home", "Product", "Detail", "Contact", "Card", "Product/Group?", "Product/Page?", "Product/Detail?"]);
}

// +++
// MAIN
// +++
function GroupViewModel(){

	var self=this;

	self.allGroups=ko.observableArray([]);
	self.rootGroup=ko.observable();
	self.firstGroup=ko.observableArray([]);
}

// +++
// MAIN
// +++
function ViewModel() {

	var self=this;
	
	self.products=ko.observableArray([]);
	self.productGroups=ko.observableArray([]);
	self.alternateProducts=ko.observable([]);
	self.highlightedProducts=ko.observableArray([]);
	self.currentProduct=ko.observable(null);
	self.route=ko.observable("");
	self.skip=ko.observable(0);
	self.total=ko.observable(0);
	self.filter=ko.observable("");
	self.detailProduct=ko.observable();
	self.isLoading=ko.observable(false);
	self.shop=ko.observable();

	self.groupViewModel = new GroupViewModel();
	self.currentGroup=ko.observable();
	self.currentGroupPath=ko.observableArray([]);

	self.routeViewModel = new RouteViewModel();

	// a complex observable used for the shopping card
	self.shoppingCard={
		items:ko.observableArray([]),
		total:function() {
			var total=0;
			for(var i=0;i<this.items().length;i++) 
				total+=this.items()[i].Total();
			return(total);
		}
	}

	//o.js init
	o().config({
		endpoint:"http://localhost:1000/api.svc",//"https://secure.pointsale.de/Service.svc",
		version:3,
		strictMode:true,
		username:"psapi",
		password:"demo",
		start:function() {
			self.isLoading(true);
		},
		ready:function() {
			self.isLoading(false);
		}
	});


	// +++
	// GENERAL
	// +++

	// loads the shop information
	self.isLoading(true);
	Q.all([
		o("Shop").expand("Address").get(),
		o("Group").get(),
		o("Product").filter("IsHighlighted eq true").get(),
		o("Address").get()
	]).then(function(o) {
		
		self.shop(o[0].data[0]);		
		self.highlightedProducts(o[2].data);
		
		self.groupViewModel.allGroups($.grep(o[1].data, function(e){
			return e.Name != "$root";
		}));
		var result = $.grep(o[1].data, function(e){ return e.Name == "$root"; });
		//console.log(result[0]);
		if (result.length == 0) {
			console.log("ERROR: no root group found");
		} else if (result.length == 1) {
			self.groupViewModel.rootGroup(result[0]);
		} else {
			console.log("ERROR: multiple root groups found. first selected.");
			self.groupViewModel.rootGroup(result[0]);
		}
		//console.log(self.groupViewModel.rootGroup());
		self.groupViewModel.firstGroup($.grep(o[1].data, function(e){ return e.Parent_fk == self.groupViewModel.rootGroup().id; }));
		self.currentGroup(self.groupViewModel.rootGroup());
		
		//start page
		initRoutes();
		
		console.log(self.shop().Address);
		
		//set maps
		var footerMap = L.map('footerMap').setView([self.shop().Address.Latitude, self.shop().Address.Longitude], 15);
		L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		  maxZoom: 18,
		  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		  id: 'examples.map-i875mjb7'
		}).addTo(footerMap);
		L.marker([self.shop().Address.Latitude, self.shop().Address.Longitude]).addTo(footerMap);
		var mapContact = L.map('contactMap').setView([self.shop().Address.Latitude, self.shop().Address.Longitude], 12);
		L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		  maxZoom: 18,
		  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		  id: 'examples.map-i875mjb7'
		}).addTo(mapContact);
		L.marker([self.shop().Address.Latitude, self.shop().Address.Longitude]).addTo(mapContact)
		  .bindPopup("<center><b>Kommen Sie uns<br />besuchen</b></center>")
		  .openPopup();
		
		
		self.isLoading(false);
	}).fail(function(e) {
		console.log("ERRR!");
		console.log(e);
	});;
	
	/*
	o("Shop").expand("Address").get(function(data) {
		self.shop(data);
	});
		
	// loads all groups. searches for the root, the first and the second group level for the menus
	o("Group").get(function(data) {
		self.groupViewModel.allGroups($.grep(data, function(e){
			return e.Name != "$root";
		}));
		var result = $.grep(data, function(e){ return e.Name == "$root"; });
		//console.log(result[0]);
		if (result.length == 0) {
			console.log("ERROR: no root group found");
		} else if (result.length == 1) {
			self.groupViewModel.rootGroup(result[0]);
		} else {
			console.log("ERROR: multiple root groups found. first selected.");
			self.groupViewModel.rootGroup(result[0]);
		}
		//console.log(self.groupViewModel.rootGroup());
		self.groupViewModel.firstGroup($.grep(data, function(e){ return e.Parent_fk == self.groupViewModel.rootGroup().id; }));
		self.currentGroup(self.groupViewModel.rootGroup());
	});

	// loads all highlighted products
	o("Product").filter("IsHighlighted eq true").get(function(data) {
		self.highlightedProducts(data);
	});*/
	
	function initRoutes() {

		// +++
		// HOME
		// +++
		o("").routes("Home",function(data) {
			console.log(self.shop());
			$('body,html').animate({scrollTop: 0}, 500);
			self.route("Home");
			self.currentGroup(self.groupViewModel.rootGroup());
		});

		// TODO: show bestseller
		o("Product").take(12).routes("Home", function(data) {
			self.products(data);
		});


		// +++
		// PRODUCTS
		// +++
		o("").routes("Product",function(data) {
			self.route("Product");
			self.currentGroup(self.groupViewModel.rootGroup());
		});
		
		//get a product list on product click
		o("Product").take(12).inlineCount().routes("Product", function(data) {
			self.route("Product");
			self.products(data);
			self.skip(0);
			self.total(this.inlinecount);
		});


		//get a group - NOT WORKING
		o("Group").expand("ProductGroup").find(1).routes("Product/Group?", function(groupData) {
			
			self.route("Product");
			self.currentGroupPath.removeAll();
			var tmpGroupPath = self.currentGroupPath();
			tmpGroupPath.push(self.currentGroup());

			var result;

			//console.log(groupData);
			for(var r=0;r<=self.groupViewModel.allGroups.length;r++) {
				console.log(r);
				result = $.grep(self.groupViewModel.allGroups(), function(e){
					//console.log(e.id + ' == ' + self.groupViewModel.allGroups()[r].Parent_fk);
					return e.id == tmpGroupPath[r].Parent_fk;
				});
				console.log(result);
				if(result.length>0){
					tmpGroupPath.push(result);
				}
			}
			self.currentGroupPath(tmpGroupPath);

			/* load all the products belonging to the chosen group */
			self.products.removeAll();
			self.productGroups=groupData.ProductGroup;

			//console.log(self.productGroups);

			for(var r=0;r<self.productGroups.length;r++) {
				o("Product").find(self.productGroups[r].Product_fk).get(function(productData) {
					self.products.push(productData);
				});
			}

		});
		
		//product pagination - WORKING
		o("Product").expand("ProductGroup").skip(0).take(12).inlineCount().routes("Product/Page?", function(data) {
			self.skip(parseInt(this.param[0]));
			self.route("Product");
			self.products($.grep(data, function(e){ return e.ProductGroup.Parent_fk == self.currentGroup.id; }));
			self.total(this.inlinecount);
		});

		// +++
		// PRODUCTDETAILS
		// +++

		o("Product").find(1).routes("Product/Detail?",function(data) {
			$('body,html').animate({scrollTop: 0}, 500);
			self.route("Detail");
			self.detailProduct(data);
		});

		// +++
		// CARD
		// +++

		//open the shopping card
		o("").routes("Card",function(data) {
			$('body,html').animate({scrollTop: 0}, 500);
			self.route("Card");
		});

		// +++
		// CONTACT
		// +++
		o("").routes("Contact",function(data){
			$('body,html').animate({scrollTop: 0}, 500);
			self.route("Contact");
		});
		
		//add to shopping card
		o("Product").find(0).routes("AddToCard?",function(data) {
			//push a temp ProductOrder element into the items. When the order is checked in, we will Post it to the dataservice
			self.shoppingCard.items.push({ 
				Amount:ko.observable(1),
				Product:data,
				Total:function() {
					return(this.Amount()*this.Product.Price);
				},
				Remove:function() {
					var index = self.shoppingCard.items.indexOf(this);
					self.shoppingCard.items.splice(index, 1);
				}
			});
			self.route("undefined");
		});
	}
}

//append the viewmodel
ko.applyBindings(new ViewModel());