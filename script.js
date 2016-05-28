var CitiesArray = [];
// var availableTags=[];
console.log('in dev reg');
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    console.log(navigator.camera);
    console.log('did cam found')
}
var mod=angular.module('mainApp');
mod.controller('MainController',MainController);
 MainController.inject=['$scope','DataStore','$location'];
 function MainController($scope,DataStore,$location) {
	$scope.UpVoteGrivTxt=[];
	$scope.pollOpinionSelect="";
	$scope.noOfOption=[0,1];
	$scope.currentCity='select city';
	$scope.showPollsCat=true;
	$scope.showGrievancesCat=true;
	$scope.showUpdatesCat=true;
	var vm=this;
	var searchObject = getParameterByName('userId');
	console.log('loc obj=')
	console.log(searchObject)
	console.log(DataStore.setUserName);
	if(searchObject && searchObject){
		// DataStore.setUserName(searchObject)
		// .then(function(){
			console.log('in user info get');
			DataStore.getLoggedInUserData(searchObject)
			.then(function(result){
				console.log('got result=');
				console.log(result);
				vm.userDetails=result;
				DataStore.getTags(vm.userDetails.location)
				.then(function(result){
					vm.availableTags=result;
					console.log(result);
					vm.targetPollTag=vm.availableTags[0];
					vm.targetGrivTag=vm.availableTags[0];
					vm.targetMsgTag=vm.availableTags[0];
				});
			});
			DataStore.getPosts()
			.then(function(result){
				console.log('polls script result are=');
				console.log(result);
				vm.posts=vm.posts||[];
				for(var i=0;i<result.length;i++)
					vm.posts.push(result[i]);
				console.log(vm.posts);
				vm.showSelectedNotification={};
				vm.showSelectedNotification=vm.posts[0];
			});
			DataStore.getCities()
			.then(function(cities){
				vm.locationList=cities.data.map(function(a){return a.name});
				$("#userLocationName").autocomplete({
		      		source: vm.locationList
		    	});
		    	$("#userLocationNameM").autocomplete({
		      		source: vm.locationList,
		      		appendTo : $("#changeLocModal")
		    	});
			})
		// })
	}
	
	function getParameterByName(name, url) {
	    if (!url) url = window.location.href;
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	vm.locChange= function (locValue){
		vm.userDetails.location=locValue.name;
	}
	vm.saveUserData=function(){
		// vm.userDetails.img=$scope.fileread;
		console.log(vm.userDetails);
		DataStore.saveUserInfo(angular.toJson(vm.userDetails));
	}
	vm.signIn=function(){
		// vm.userDetails=null;
		DataStore.authUser(vm.authUserData);
        // location.href = "homepage.html";
	}
	vm.signUpClick=function(){
		vm.userDetails=null;
        $("#showUserDetails").modal("show");
	}
	vm.isMobileDevice=function(){
		if(window.innerWidth<769)
			return true;
		else
			return false;
	}

	function onCamSuccess(imgData){
		$("#capturedImg").empty();
		vm.grievancePostCamImg="data:image/jpeg;base64,"+imgData;
		var img=document.createElement("img");
		img.src=vm.grievancePostCamImg;
		img.style.display="block";
		img.className="grivCamImg";
		$("#capturedImg").append(img);
	}

	function onCamFail(){
		vm.grievancePostCamImg=null;
	}

	vm.getPic=function(){
		var source=navigator.camera.PictureSourceType.PHOTOLIBRARY;
		if(vm.picSource=='CAMERA')
			source=navigator.camera.PictureSourceType.CAMERA;
		navigator.camera.getPicture(onCamSuccess,onCamFail,{
			quality:100,
			targetWidth:400,
			destinationType:navigator.camera.DestinationType.DATA_URL,
			sourceType:source,
			correctOrientation:true
		});
	}


	vm.changeUserLocation=function(){
		vm.userDetails.location=$("#userLocationNameM").val();
		DataStore.saveUserInfo(angular.toJson(vm.userDetails));
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
			id:parseInt(vm.posts[vm.posts.length-1].id)+1,
			totalSubmits:0,
			on: new Date().getDate() +" "+ new Date().getMonth(),
			from:vm.userDetails.name,
			userName:vm.userDetails.username,
			targetTag:vm.targetPollTag 
		}		
		$(".optionTxt").each(function(){
			var txt=$(this).val();
			obj.options.push({title:txt,votes:0,value:false,percentVote:0});
		});
		vm.posts.unshift(obj);
		DataStore.savePosts(angular.toJson(obj));
	}
	$scope.submitNewGrievances=function(){
		var obj={
			type:"grievance",
			title:$scope.grievancesTxt,
			status:$scope.selectedGrievancesStatus,
			progress:0,
			canSubmit:true,
			interactions:[],
			on: new Date().getDate() +" "+ new Date().getMonth(),
			from:vm.userDetails.name,
			userName:vm.userDetails.username,
			capturedImg:vm.grievancePostCamImg,
			targetTag:vm.targetGrivTag 
		}		
		vm.posts.unshift(obj);
		console.log(angular.toJson(obj));
		DataStore.savePosts(angular.toJson(obj));
		cleanGrievances();
	}
	function cleanGrievances(){
		vm.grievancePostCamImg='';
		$("#capturedImg").empty();
		$scope.grievancesTxt='';
		$scope.selectedGrievancesStatus='';
	}
	$scope.UpVoteGrievances=function(postId,postRec){
		var txt=$scope.UpVoteGrivTxt[postId];
		for(var post in vm.posts){
			if(vm.posts[post].id===postId){
				var inter={
					text:txt,
					from:vm.userDetails.username,
					on:"Today, just now"
				};
				console.log('interactions added is=')
				console.log(inter);
				vm.posts[post].interactions.push(inter);
				DataStore.saveInteraction(postId,inter,postRec.status)
				break;
			}
		}
	}
	$scope.submitNewMessage=function(){
		var obj={
			type:"message",
			title:$scope.messageTxt,
			On: new Date().getDate() +" "+ new Date().getMonth(),
			from:vm.userDetails.name,
			userName:vm.userDetails.username,
			targetTag:vm.targetMsgTag 
		}
		vm.posts.unshift(obj);
		DataStore.savePosts(angular.toJson(obj));
	}

	function CalcVotes(postId){
		for(var post in vm.posts){
			if(vm.posts[post].id===postId){
				var total=vm.posts[post].totalSubmits;
				for(var option in vm.posts[post].options){
					if(total===0){
					vm.posts[post].options[option].percentVote=0
					}else{
						var votes=vm.posts[post].options[option].votes;
						var percentageVote=votes/total * 100;
						vm.posts[post].options[option].percentVote=percentageVote;
					}
				}
			}
		}
		
	}

	$scope.pollOpinionSubmit=function(postId){
		for(var post in vm.posts){
			if(vm.posts[post].id===postId){
				if(!vm.posts[post].isMultiSelect){
					vm.posts[post].totalSubmits++;
					for(var option in vm.posts[post].options){
						if(vm.posts[post].options[option].title===vm.posts[post].selected){
							vm.posts[post].options[option].votes++;
						}
					}
					CalcVotes(postId);
				}else{
					vm.posts[post].totalSubmits++;
					for(var option in vm.posts[post].options){
						if(vm.posts[post].options[option].value){
							vm.posts[post].options[option].votes++;
						}
					}
					CalcVotes(postId);
				}
			}
			DataStore.savePollAnswer(vm.posts[post].options,postId);
			break;
		}
	}
};