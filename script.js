var posts=[
	{
		type:"poll",
		id:1,
		title:"20% hike in minimum wages",
		options:[
			{title:"Yes",votes:0,value:true,percentVote:0},
			{title:"No",votes:0,value:false,percentVote:0}
			],
		canSubmit:true,
		isResultVisible:true,
		totalSubmits:0,
		selected:"Yes",
		isMultiSelect:false,
		isNotification:true
	},
	{
		type:"poll",
		id:2,
		title:"20% hike in minimum wages",
		options:[
			{title:"Yes",votes:0,value:false,percentVote:80},
			{title:"No",votes:0,value:false,percentVote:20}
			],
		canSubmit:false,
		isResultVisible:true,
		totalSubmits:0,
		isMultiSelect:false
	},
	{
		type:"grievance",
		id:3,
		title:"Illegal encrochment at Miyapur",
		status:"Work In Progress",
		progress:50,
		canSubmit:true,
		interactions:[
			{text:"Yes, condition is worst need immediate action.",from:"Rahul Kumar",on:"20th Aug 2015"},
			{text:"Yes, condition is worst need immediate action.",from:"Rahul Kumar",on:"20th Aug 2015"},
			{text:"Yes, condition is worst need immediate action.",from:"Rahul Kumar",on:"20th Aug 2015"}
		]
	},
	{
		type:"message",
		id:4,
		title:"Illegal encrochment has been removed  promptly at Miyapur",
		isNotification:true
	}
]
var CitiesArray = [];
$(document).ready(function(){
        getIndianCities();
	$("#signin").on('click', function () {
        location.href = "homepage.html";
    });

    var availableTags =[
	    "#WaterManagement",
		"#SwatchBharat",
		"#HyderabadPublicTransport",
		"#HyderabadPolice",
		"#HyderabadTrafficPolice",
		"#WasteManagement",
		"#HyderabadSaveFarmer",
		"#MiyapurCouncil"
	];
	$( ".hashTagSuggestions" ).autocomplete({
      source: availableTags
    });
	
});
var locationList;
function getIndianCities(){
	$.getJSON('cities.json', function (json) {
		locationList=json.map(function(a){return a.name});
		$("#userLocationName").autocomplete({
      		source: locationList
    	});
    	$("#userLocationNameM").autocomplete({
      		source: locationList,
      		appendTo : $("#changeLocModal")
    	});
	});
}

function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 5
        });
        var infoWindow = new google.maps.InfoWindow({map: map});

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            map.setCenter(pos);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
      }

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
      }

var mod=angular.module('mainApp', []);
mod.factory('dataStore',function(){
	this.userDetails={
		img:'./profile12.png',
		name: 'Vikram Iyer',
		address: 'Flat No. 202, Block C, Janapriya Nagar, Miyapur',
		mobile:'7661046094',
		email:'vikram@gmail.com',
		aadhar:'asd213sdfa2',
		pan:'23sdafd2w',
		location:'Hyderabad'
	};
	var fact=this;
	function initLocations(){
		if(fact.citiesArray && fact.citiesArray.length>0){
			return fact.citiesArray;
		}else{
			$.getJSON('cities.json', function (json) {
				fact.citiesArray=json;
				return fact.citiesArray;
			});
		}
	}
	return{
		userDetails : this.userDetails,
		getcitiesData : initLocations
	}
});
mod.controller('MainController', function($scope,dataStore) {
	$scope.posts=posts;
	$scope.UpVoteGrivTxt=[];
	$scope.pollOpinionSelect="";
	$scope.noOfOption=[0,1];
	$scope.currentCity='select city';
	$scope.showPollsCat=true;
	$scope.showGrievancesCat=true;
	$scope.showUpdatesCat=true;
	this.userDetails=dataStore.userDetails;
	var vm=this;
	vm.showSelectedNotification={};
	vm.showSelectedNotification=posts[0];
	this.updatesPending=[
		{
			id:1,
			url:'123.html',
			text:'Swatch Bharat Campaign in Miyapur'
		},
		{
			id:2,
			url:'123.html',
			text:'Swatch Bharat Campaign in Miyapur'
		},
		{
			id:3,
			url:'123.html',
			text:'Swatch Bharat Campaign in Miyapur'
		}
	];
	vm.locChange= function (locValue){
		vm.userDetails.location=locValue.name;
	}
	$scope.selectCityModal=function (){
		$('#selectCityModal').modal('show');
	}
	$scope.incrementOption=function(){
		$scope.noOfOption.push($scope.noOfOption[$scope.noOfOption.length-1]+1);
	}
	vm.showNotificationModal=function(obj){
		vm.showSelectedNotification=obj;
		$('#showNotification').modal('show');
	}
	$scope.changePostOrder=function(){
		var Category=['poll','grievance','update'];
		for(var key in Category){
			if($('#showLi'+Category[key]).attr('active')==='true'){
				$('.'+Category[key]+'Post').show();
			}else{
				$('.'+Category[key]+'Post').hide();
			}
		}
	}
	$scope.submitNewPoll=function(){
		var obj={
			type:"poll",
			title:$scope.pollTitle,
			canSubmit:true,
			isResultVisible:$scope.addSeeResultToAllChkbox,
			isMultiSelect:$scope.isMultiSelect,
			options:[],
			id:parseInt($scope.posts[$scope.posts.length-1].id)+1,
			totalSubmits:0
		}		
		$(".optionTxt").each(function(){
			var txt=$(this).val();
			obj.options.push({title:txt,votes:0,value:false,percentVote:0});
		});
		$scope.posts.unshift(obj);
		//obj.options.push({title:"Yes",votes:80});
	}
	$scope.submitNewGrievances=function(){
		var obj={
			type:"grievance",
			title:$scope.grievancesTxt,
			status:$scope.selectedGrievancesStatus,
			progress:0,
			canSubmit:true,
			interactions:[]
		}		
		$scope.posts.unshift(obj);
	}
	$scope.UpVoteGrievances=function(postId){
		var txt=$scope.UpVoteGrivTxt[postId];
		for(var post in $scope.posts){
			if($scope.posts[post].id===postId){
				$scope.posts[post].interactions.push({
					text:txt,
					from:"Vikram Iyer",
					on:"Today, just now"
				});
			}
		}
	}
	$scope.submitNewMessage=function(){
		var obj={
			type:"message",
			title:$scope.messageTxt
		}
		$scope.posts.unshift(obj);
	}

	function CalcVotes(postId){
		for(var post in $scope.posts){
			if($scope.posts[post].id===postId){
				var total=$scope.posts[post].totalSubmits;
				for(var option in $scope.posts[post].options){
					if(total===0){
					$scope.posts[post].options[option].percentVote=0
					}else{
						var votes=$scope.posts[post].options[option].votes;
						var percentageVote=votes/total * 100;
						$scope.posts[post].options[option].percentVote=percentageVote;
					}
				}
			}
		}
		
	}

	$scope.pollOpinionSubmit=function(postId){
		for(var post in $scope.posts){
			if($scope.posts[post].id===postId){
				if(!$scope.posts[post].isMultiSelect){
					$scope.posts[post].totalSubmits++;
					for(var option in $scope.posts[post].options){
						if($scope.posts[post].options[option].title===$scope.posts[post].selected){
							$scope.posts[post].options[option].votes++;
						}
					}
					CalcVotes(postId);
				}else{
					$scope.posts[post].totalSubmits++;
					for(var option in $scope.posts[post].options){
						if($scope.posts[post].options[option].value){
							$scope.posts[post].options[option].votes++;
						}
					}
					CalcVotes(postId);
				}
			}
		}
	}
});