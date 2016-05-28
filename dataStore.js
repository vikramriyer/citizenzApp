angular.module('mainApp').factory('DataStore', ['$http','$q','$timeout', function ($http,$q,$timeout) {
    	//dummy data
        var polls=[];
        var posts=[
    	{
    		type:"poll",
    		id:1,
    		title:"As a citizen, what is the biggest problem you face? ",
    		options:[
    			{title:"Traffic & Parking",votes:0,value:true,percentVote:10},
    			{title:"Cleanliness & Waste Management",votes:0,value:false,percentVote:15},
    			{title:"Water Supply",votes:0,value:false,percentVote:45},
    			{title:"Unsatisfactory response from civic authorities",votes:0,value:false,percentVote:2},
    			{title:"Pollution",votes:0,value:false,percentVote:28}
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
    		title:"Please select one of the Key Components as your top priority in Smart City",
    		options:[
    			{title:"Command and Control Center",votes:0,value:false,percentVote:60},
    			{title:"Intelligent Traffic Management Services",votes:0,value:false,percentVote:20},
    			{title:"Smart City Bus Services",votes:0,value:false,percentVote:20}
    			],
    		canSubmit:false,
    		isResultVisible:true,
    		totalSubmits:0,
    		isMultiSelect:false
    	},
    	{
    		type:"grievance",
    		id:3,
    		title:"Recurrent fires at the dump have caused conditions unfit for habitation for residents of the adjacent area",
    		status:"Work In Progress",
    		progress:50,
    		canSubmit:true,
    		canEditStatus:true,
    		interactions:[
    			{text:"40 residents of Chembur went on a hunger strike to protest against the frequent fires and smoke",from:"Rahul Kumar",on:"20th Jan 2016"},
    			{text:"Neighbourhood surrounding to the dumping ground was identified as the city' most polluted area",from:"Manoj Sharma",on:"25th Jan 2016"},
    			{text:"GHMC had decided to close down a section of the dumping ground and use it to generate 7 to 8 MW of power by methane extraction, Effective from 20th April 2016.",from:"#PollutionControl",on:"20th Aug 2015"}
    		],
    		from: "Kishor Raj",
    		on: "15th Jan 2016"
    	},
    	{
    		type:"message",
    		id:4,
    		title:"Good job done by #GHMC by Cleaning Husain Sagar and Developing it into Clean and Precious tourist attraction. Keep it Up!",
    		isNotification:true,
    		from: "Anuresh Rathi",
    		on: "15th Feb 2016"
    	}
    ];
    var cities=null;
    var loggedInUser=null;
    var userName=null;
    var userImg="data:image/jpeg;base64,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";
    // var loggedInUser={
    // 		img:userImg,
    // 		name: 'Mahan Iyer',
    // 		address: 'Malkajigiri',
    // 		mobile:'7661046098',
    // 		email:'mmi@gmail.com',
    // 		aadhar:'asd213sdfa2',
    // 		pan:'23sdafd2w',
    // 		location:'AP',
    // 		username:'mac',
    // 		points:254,
    // 		userId:'mmi',
    // 		paswd:'mmi'
    // 	};	
    // var loggedInUserList=[{
    // 		img:userImg,
    // 		name: 'Mahan Iyer',
    // 		address: 'Miyastreet 404 ur',
    // 		mobile:'7661046098',
    // 		email:'mmi@gmail.com',
    // 		aadhar:'asd213sdfa2',
    // 		pan:'23sdafd2w',
    // 		location:'Warangal',
    // 		username:'mac',
    // 		points:254,
    // 		userId:'mmi',
    // 		paswd:'mmi'
    // 	},
    // 	{
    // 		img:userImg,
    // 		name: 'Vikram Iyer',
    // 		address: 'Malkajigiri',
    // 		mobile:'7661046098',
    // 		email:'mmi@gmail.com',
    // 		aadhar:'asd213sdfa2',
    // 		pan:'23sdafd2w',
    // 		location:'Hyderabad',
    // 		username:'mac',
    // 		points:254,
    // 		userId:'vikram',
    // 		paswd:'vikram'
    // 	},
    // 	];	
    var tags =[
	    "WaterManagement",
		"SwatchBharat",
		"PublicTransport",
		"Police",
		"TrafficPolice",
		"WasteManagement",
		"SaveFarmer",
		"MiyapurCouncil"
	];
    function getLoggedInUserData(username) {
        console.log('log in uname=');
    	console.log(username);
		if(loggedInUser)
			return $q.when($timeout(function(){return loggedInUser},0))
		else
				return $http({
					    method: 'GET',
					    url: "http://citizenz:9001/loggedInUserInfo",
					    params:{'username':username}
					})
						.then(function(data){
                            console.log('in getting info');
                            console.log(data.data.user_info);
                            if(data && data.data.user_info){
                                var results={
                                         img:userImg,
                                         name:data.data.user_info[0][2] ,
                                         address: data.data.user_info[0][3],
                                         mobile:data.data.user_info[0][4],
                                         email:data.data.user_info[0][5],
                                         aadhar:data.data.user_info[0][1],
                                         pan:data.data.user_info[0][6],
                                         location:data.data.user_info[0][7],
                                         username:data.data.user_info[0][10],
                                         points:data.data.user_info[0][11],
                                         userId:data.data.user_info[0][0]
                                }
                                console.log('in get user info=');
                                console.log(data);
                                loggedInUser=results;
                                return results;
                            }
						})
	}

	function getPosts(){
            return $q.when($timeout(function(){return posts},0))
		if(posts)
			return $q.when($timeout(function(){return posts},0))
		else
			return $http({
					    url: 'JSON/posts.json', 
					    method: "GET",
					    params: {userName: userName}
					 })
						.then(function(result){
							posts=result;
							return result;
						})
	}

    function getPolls(username){
        if(polls.length>0){
            console.log('in cached data');
            return $q.when($timeout(function(){return polls},0))            
        }
        else
            return $http({
                        url: 'http://citizenz:9001/post/poll', 
                        method: "GET",
                        params: {'username': username}
                     })
                        .then(function(result){
                            console.log('polls got res=');
                            console.log(result);
                            polls=result;
                            return result;
                        })
    }

	function getCities(){
		if(cities)
			return $q.when($timeout(function(){return cities},0))
		else
			return $http.get("cities.json")
						.then(function(result){
							cities=result;
							return result;
						})
	}
    
	function getTags(location){
		var tempTag=tags;
		for(var i=0;i<tempTag.length;i++){
			tempTag[i]="#"+location+tempTag[i];
		}
		if(tempTag)
			return $q.when($timeout(function(){return tempTag},0))
		else
			return $http({
					    url: 'JSON/getTags.json', 
					    method: "GET",
					    params: {userName: userName}
					 })
						.then(function(result){
							tags=result;
							return result;
						})
	}


	function saveUserInfo(data){
		$http.post("api/saveUser",data)
			.success(function(data,status,headers){
				alert("User Information Saved, Please login..!");
        		$("#showUserDetails").modal("hide");
        		location.href = "index.html";
			})
	}

	function authUser(dataIp){
		// console.log(data);
		// var data=JSON.parse(data);
		// for(var i=0;i<loggedInUserList.length;i++){
		// 	// console.log(loggedInUserList[i]);
		// 	if(data.username==loggedInUserList[i]['userId'] && data.password==loggedInUserList[i]['paswd']){
		// 		alert("User LoggedIn");
		// 		loggedInUser=loggedInUserList[i];
		// 		console.log(loggedInUser);
		// 		$location.path('/homepage.html');
		// 		// location.href = "homepage.html";
		// 		return;
		// 	}
		// }
		// 		alert("Invalid User");
		


		// loggedInUser1[userId]
		// loggedInUser1[paswd]
		// console.log(data);
		$http({
		    method: 'GET',
		    url: "http://citizenz:9001/login",
		    params:dataIp
		})
		// $http.post("http://citizenz:9001/login",data)
			.then(function(data,status,headers){
				// console.log(dataIp.username);
				if(data.data.message){
					alert("User LoggedIn");
	        		$("#showUserDetails").modal("hide");
         			location.href = "homepage.html?userId="+dataIp.username;
				}else{
					alert("Invalid User");
				}
        		//location.href = "homepage.html";
			},function(data,status,headers){
				alert("Invalid User");
		// 		//to comment

		// 		$("#showUserDetails").modal("hide");
  //       		location.href = "homepage.html";
  //       		// $("#showUserDetails").modal("hide");
  //       		// location.href = "homepage.html";
			});
			// .success(function(data,status,headers){
			// 	alert("User LoggedIn");
   //      		$("#showUserDetails").modal("hide");
   //      		location.href = "homepage.html";
			// })
	}

	function setUserName(loggedInUserId){
        console.log('in set uname')
        console.log(loggedInUserId);
        return $q.when($timeout(function(){userName=loggedInUserId;console.log(userName);return loggedInUserId},0))
	}

	function getUserName(){
		return userName;
	}

	function savePosts(data){
		$http.post("api/savePost",data)
			.success(function(data,status,headers){
				alert("Post Saved!");
			})
	}

	function saveInteraction(postId,inter,statusTxt){
		var data={
			postId:postId,
			interaction:inter,
			status:statusTxt
		};
		$http.post("api/saveInteraction",angular.toJson(data))
			.success(function(data,status,headers){
				alert("Interaction Saved!");
			});
	}

	function savePollAnswer(options,postId){
		var data={
			options:options,
			postId:postId
		}
		$http.post("api/savePollAnswer",angular.toJson(data))
			.success(function(data,status,headers){
				alert("Poll Saved!");
			})
	}

	return {
        getLoggedInUserData: getLoggedInUserData,
        getPosts:getPosts,
        getCities:getCities,
        getTags:getTags,
        saveUserInfo:saveUserInfo,
        savePosts:savePosts,
        authUser:authUser,
        saveInteraction:saveInteraction,
        savePollAnswer:savePollAnswer,
        setUserName:setUserName,
        getPolls:getPolls

    };
}]);