var map;
var marker;
var mapBoundary;
var markerLayer;
var requestMarkerLayer;
var vectorLayer;
var virtualVectorLayer;
var finalVectorLayer;
var maskLayer;
var tData;
var size;
var offset;
var carIcon;
var destIcon;
var resultIndex = 0;
var errorCount = 0;
var headers = new Array();
var headersMulti = new Array();
headers["appKey"]="8e88ce86-83f7-46b5-9272-16b581b04ae8";
headersMulti["appKey"]="8e88ce86-83f7-46b5-9272-16b581b04ae8";
headersMulti["Content-Type"]="application/json";

function initMap(){
    map = new Tmap.Map({
        div:'map'
    });

    var lonlat = new Tmap.LonLat(14129410, 4507355);
    map.setCenter(lonlat, 15);
    map.events.register("click", map, createNewRequest);


    mapBoundary = map.getExtent().transform("EPSG:3857", "EPSG:4326");
    tData = new Tmap.TData();
    vectorLayer = new Tmap.Layer.Vector("vectorLayerID");
    virtualVectorLayer = new Tmap.Layer.Vector("vectorLayerID");
    finalVectorLayer = new Tmap.Layer.Vector("vectorLayerID");
    markerLayer = new Tmap.Layer.Markers();
    requestMarkerLayer = new Tmap.Layer.Markers();

    var maskStyle = {
        fillColor:'FF0000',
        fillOpacity:0.8
    };

    var pointlist = [];
        pointlist.push(new Tmap.Geometry.Point(mapBoundary.left, mapBoundary.top).transform("EPSG:4326", "EPSG:3857"));
        pointlist.push(new Tmap.Geometry.Point(mapBoundary.right, mapBoundary.top).transform("EPSG:4326", "EPSG:3857"));
        pointlist.push(new Tmap.Geometry.Point(mapBoundary.right, mapBoundary.bottom).transform("EPSG:4326", "EPSG:3857"));
        pointlist.push(new Tmap.Geometry.Point(mapBoundary.left, mapBoundary.bottom).transform("EPSG:4326", "EPSG:3857"));
        pointlist.push(new Tmap.Geometry.Point(mapBoundary.left, mapBoundary.top).transform("EPSG:4326", "EPSG:3857"));

    var square = new Tmap.Geometry.LinearRing(pointlist);
    var squareFeature = new Tmap.Feature.Vector(square, null, maskStyle); // 백터 생성
    maskLayer = new Tmap.Layer.Vector("vectorLayerID");
    map.addLayer(maskLayer);
    maskLayer.addFeatures([squareFeature]);

    size = new Tmap.Size(48,48);
    offset = new Tmap.Pixel(-(size.w/2), -(size.h/2));
    carIcon = new Tmap.Icon('/img/car.png');
    destIcon = new Tmap.Icon('/img/destination.png');

    map.addLayer(markerLayer);
    map.addLayer(requestMarkerLayer);

    $(".result-container").find(".title").html("Dispatch simaulator is ready.");
}

$(document).ready(function() {
    initMap();
    map.ctrl_nav.disableZoomWheel();
    map.ctrl_nav.dragPan.deactivate();
});

function clickMap(e){
    markerLayer.removeMarker(marker); // 기존 마커 삭제
    var lonlat = map.getLonLatFromViewPortPx(e.xy).transform("EPSG:3857", "EPSG:4326");
    marker = new Tmap.Marker(lonlat.transform("EPSG:4326", "EPSG:3857"));
    markerLayer.addMarker(marker);
}

// 입력한 숫자대로 차량 객체 생성
var vehiArray = new Array();

function createVehiArray(count){
    for(var i=0 ; i<count ; i++){
        vehiArray.push(addVehicle(i));
    }
    $(".result-container").find(".title").html(count + " vehicles are created.");
}


// 차량 객체 생성
function addVehicle(i){
    var vehicleObj = new Vehicle(i);
    vehicleObj.initVehicle();
    vehicleObj.initDestination();
    return vehicleObj;
}

// 차량 Class 정의
function Vehicle(index){
    this.index              = index;
    this.lat                = (Math.random()*(mapBoundary.right-mapBoundary.left))+mapBoundary.left;
    this.lon                = (Math.random()*(mapBoundary.bottom-mapBoundary.top)) + mapBoundary.top;
    this.currentLocation    = new Tmap.LonLat(this.lat, this.lon).transform("EPSG:4326", "EPSG:3857");
    this.destination;
    this.marker     = new Tmap.Marker(this.currentLocation, new Tmap.Icon('/img/car.png', size, offset));
    this.selectFlag = false;
    this.route;
    this.routeVector;
    this.totalTime;
    this.waitingTime;
    this.movingTime;
    this.originalTime;
    this.waitingDistance;
    this.movingDistance;
    this.node1;
    this.node2;
    this.node3;
}

Vehicle.prototype = {
    initVehicle  : function(){
        this.marker.index = this.index;
        markerLayer.addMarker(this.marker);
    },
    initDestination : function(){
        var lat = (Math.random()*(mapBoundary.right-mapBoundary.left))+mapBoundary.left;
        var lon = (Math.random()*(mapBoundary.bottom-mapBoundary.top)) + mapBoundary.top;
        this.desination = new Tmap.LonLat(lat, lon);
        this.desination.transform("EPSG:4326", "EPSG:3857");
    },
    requestRoute : function(){
        $.ajax({
            method:"POST",
            headers : headers,
            url:"https://api2.sktelecom.com/tmap/routes?version=2&format=json",
                data:{
                startX : this.currentLocation.lon,
                startY : this.currentLocation.lat,
                endX : this.desination.lon,
                endY : this.desination.lat,
                reqCoordType : "EPSG3857",
                resCoordType : "EPSG3857",
                searchOption : 0
            },
            success:function(response){
                if(response){
                    drawRoute(response);
                }
            }
        })

    },
    toggleRoute : function(){
        console.log(vehiArray[this.index]);
        if(vehiArray[this.index].selectFlag==false){
            drawRoute(vehiArray[this.index].route);
        }else{
            vehiArray[this.index].selectFlag=false;
        }
    }
}

// 경로정보를 받아오기
function requestByAjax(index){
    $(".map-mask").fadeIn();
    $(".result-container").find(".title").html("Creating virtual routes for vehicles...");
    $.ajax({
        method:"POST",
        headers : headers,
        url:"https://api2.sktelecom.com/tmap/routes?version=2&format=json",
            data:{
            startX : vehiArray[index].currentLocation.lon,
            startY : vehiArray[index].currentLocation.lat,
            endX : vehiArray[index].desination.lon,
            endY : vehiArray[index].desination.lat,
            reqCoordType : "EPSG3857",
            resCoordType : "EPSG3857",
            searchOption : 0
        },
        success:function(response){
            if(response) {
                console.log(resultIndex + " : sucess");
                vehiArray[resultIndex].route = response;
                vehiArray[resultIndex].originalTime = response.features[0].properties.totalTime;
                drawRoute(response);
                $(".progress").html(Math.floor((resultIndex/vehiArray.length)*100) + "%");
                setTimeout(function(){requestNext()}, 100);
            }else{
                console.log(resultIndex + " : no result");
                setTimeout(function(){requestNext()}, 100);
            }
        },
        error:function(request,status,error){
            console.log("message:"+request.responseText);
            resultIndex--;
            setTimeout(function(){requestNext()}, 500);
        }
    })
};

// 하나가 완료되면 다음 객체의 값을 받아오기
function requestNext(){
    resultIndex++;
    if(resultIndex<vehiArray.length){
        requestByAjax(resultIndex);
   }else{
       resultIndex=0;
       $(".progress").html("100%");
       $(".map-mask").fadeOut();
       $(".result-container").find(".title").html("Each vehicle has virtual desination and route.");
   }
}

// 경로정보로 경로 그리기
function drawRoute(route){
    var jsonForm = new Tmap.Format.GeoJSON({extractStyles:false}).read(route);
    vectorLayer.addFeatures(jsonForm);
    vectorLayer.styleMap.styles.default.defaultStyle = {
        pointRadius : 1,
        strokeColor: "#ff4474",
        strokeOpacity: 0.5,
        strokeWidth: 1,
        strokeDashstyle: "solid"
    };
    map.addLayer(vectorLayer);
}

var requestMarker;
var newRequestFlag=0;

// 새로운 경로 요청
function createNewRequest(e){
    if(newRequestFlag==0){
        createNewStart(e);
    }else if(newRequestFlag==1){
        createNewEnd(e);
    }else{
        clearRequest();
    }
}

// 요청 Class 정의
function Rider(index){
    this.currentLocation;
    this.destination;
    this.waitingTime;
    this.movingTime;
    this.pare;
}

var rider = new Rider();


// 새로운 출발지
function createNewStart(e){
    newRequestFlag=1;
    rider.currentLocation = map.getLonLatFromViewPortPx(e.xy).transform("EPSG:3857", "EPSG:4326");
//    adjustStartPoint(rider.currentLocation);
    var icon = new Tmap.Icon('http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_a.png',{w:24, h:38}, {x: -12, y: -38});
    requestMarker = new Tmap.Marker(rider.currentLocation.transform("EPSG:4326", "EPSG:3857"), icon);
    requestMarkerLayer.addMarker(requestMarker);
}

// 새로운 도착지
function createNewEnd(e){
    newRequestFlag=2;
    rider.desination = map.getLonLatFromViewPortPx(e.xy).transform("EPSG:3857", "EPSG:4326");
    var icon = new Tmap.Icon('http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_b.png',{w:24, h:38}, {x: -12, y: -38});
    requestMarker = new Tmap.Marker(rider.desination.transform("EPSG:4326", "EPSG:3857"), icon);
    requestMarkerLayer.addMarker(requestMarker);

    requestDispatch();
}

// 요청 지우기
function clearRequest(){
    newRequestFlag=0;
    rider = new Rider();
    requestMarkerLayer.clearMarkers();
}

var finalVehicle;

// 새로운 요청을 배차하기
function requestDispatch(){
    requestNextNode();
    $(".progress").html("0%");
    $(".map-mask").fadeIn();
    $(".result-container").find(".title").html("Finding a fastest way to go...");
}


// 개별 노드의 경로를 요청
var nodeResult = new Array();

function requestNodeRoute(start, end){
    $.ajax({
        method:"POST",
        headers : headers,
        url:"https://api2.sktelecom.com/tmap/routes?version=2&format=json",
            data:{
            startX : start.lon,
            startY : start.lat,
            endX : end.lon,
            endY : end.lat,
            reqCoordType : "EPSG3857",
            resCoordType : "EPSG3857",
            searchOption : 0
        },
        success:function(response){
            if(response) {
                console.log(resultIndex + "-" +nodeResult.length + " : success!");
                $(".progress").html(Math.floor((((resultIndex*6)+nodeResult.length)/(vehiArray.length*6))*100) + "%");
                nodeResult.push(response);
                setTimeout(function(){searchRoute()}, 200);
            }else{
                console.log(resultIndex + "-" +nodeResult.length + " : no result");
                $(".progress").html(Math.floor((((resultIndex*6)+nodeResult.length)/(vehiArray.length*6))*100) + "%");
                nodeResult.push("no result");
                setTimeout(function(){searchRoute()}, 200);
            }
        },
        error:function(request, status, error){
            console.log(resultIndex + "-" +nodeResult.length + " : error");
//            console.log("message:"+request.responseText);
            errorCount++;
            if(errorCount>50){resultIndex=vehiArray.length}
            setTimeout(function(){searchRoute()}, 500);
        }
    })
};

// 다음 단계의 경유지 경로 검색
function searchRoute(){
    if(resultIndex>=vehiArray.length){
        console.log("finish!");
        resultIndex=0;
        errorCount=0;
        $(".progress").html("100%");
        $(".map-mask").fadeOut();
        selectFinalVehicle();
    }else{
        if(nodeResult.length>6){
            findRoute();
            resultIndex++;
            searchRoute();
        }else{
            requestNextNode();
        }
    }
}

// 다음 노드의 경로를 검색
function requestNextNode(){
    switch(nodeResult.length){
        // 0: start - end
        // 1: start - via1
        // 2: end - via1
        // 3: end - via2
        // 4: via1 - end
        // 5: via1 - via2
        // 6: via2 - end
        case 0:
            requestNodeRoute(vehiArray[resultIndex].currentLocation, vehiArray[resultIndex].desination);
            break;
        case 1:
            requestNodeRoute(vehiArray[resultIndex].currentLocation, rider.currentLocation);
            break;
        case 2:
            requestNodeRoute(vehiArray[resultIndex].desination, rider.currentLocation);
            break;
        case 3:
            requestNodeRoute(vehiArray[resultIndex].desination, rider.desination);
            break;
        case 4:
            requestNodeRoute(rider.currentLocation, vehiArray[resultIndex].desination);
            break;
        case 5:
            requestNodeRoute(rider.currentLocation, rider.desination);
            break;
        case 6:
            requestNodeRoute(rider.desination, vehiArray[resultIndex].desination);
            break;
    }
}


// 하나의 차량에서 최적의 경로를 선택하기
function findRoute(){
    var index =1;
    var fastTime;
    // 0 > 2 > 5
    var time1=0;
    time1 += nodeResult[0].features[0].properties.totalTime;
    time1 += nodeResult[2].features[0].properties.totalTime;
    time1 += nodeResult[5].features[0].properties.totalTime;
    fastTime=time1;

    // 1 > 4 > 3
    var time2=0;
    time2 += nodeResult[1].features[0].properties.totalTime;
    time2 += nodeResult[4].features[0].properties.totalTime;
    time2 += nodeResult[3].features[0].properties.totalTime;
    if(time2<fastTime){
        index=2;
        fastTime=time2;
    }

    // 1 > 5 > 6
    var time3=0;
    time3 += nodeResult[1].features[0].properties.totalTime;
    time3 += nodeResult[5].features[0].properties.totalTime;
    time3 += nodeResult[6].features[0].properties.totalTime;
    if(time3<fastTime){
        index=3;
        fastTime=time3;
    }

    switch(index){
        case 1:
            vehiArray[resultIndex].waitingTime            = nodeResult[0].features[0].properties.totalTime+nodeResult[2].features[0].properties.totalTime;
            vehiArray[resultIndex].movingTime             = nodeResult[5].features[0].properties.totalTime;
            vehiArray[resultIndex].node1 = nodeResult[0];
            vehiArray[resultIndex].node2 = nodeResult[2];
            vehiArray[resultIndex].node3 = nodeResult[5];
            vehiArray[resultIndex].movingDistance         = nodeResult[5].features[0].properties.totalDistance;
            vehiArray[resultIndex].shareDistance          = 0;
            drawVirtualRoute(nodeResult[0]);
            drawVirtualRoute(nodeResult[2]);
            drawVirtualRoute(nodeResult[5]);
            break;
        case 2:
            vehiArray[resultIndex].waitingTime            = nodeResult[1].features[0].properties.totalTime;
            vehiArray[resultIndex].movingTime             = nodeResult[4].features[0].properties.totalTime+nodeResult[3].features[0].properties.totalTime;
            vehiArray[resultIndex].node1 = nodeResult[1];
            vehiArray[resultIndex].node2 = nodeResult[4];
            vehiArray[resultIndex].node3 = nodeResult[3];
            vehiArray[resultIndex].movingDistance         = nodeResult[4].features[0].properties.totalDistance+nodeResult[3].features[0].properties.totalDistance;
            vehiArray[resultIndex].shareDistance          = nodeResult[4].features[0].properties.totalDistance
            drawVirtualRoute(nodeResult[1]);
            drawVirtualRoute(nodeResult[4]);
            drawVirtualRoute(nodeResult[3]);
            break;
        case 3:
            vehiArray[resultIndex].waitingTime            = nodeResult[1].features[0].properties.totalTime;
            vehiArray[resultIndex].movingTime             = nodeResult[5].features[0].properties.totalTime;
            vehiArray[resultIndex].node1 = nodeResult[1];
            vehiArray[resultIndex].node2 = nodeResult[5];
            vehiArray[resultIndex].node3 = nodeResult[6];
            vehiArray[resultIndex].movingDistance         = nodeResult[5].features[0].properties.totalDistance+nodeResult[6].features[0].properties.totalDistance;
            vehiArray[resultIndex].shareDistance          = nodeResult[5].features[0].properties.totalDistance+nodeResult[6].features[0].properties.totalDistance;
            drawVirtualRoute(nodeResult[1]);
            drawVirtualRoute(nodeResult[5]);
            drawVirtualRoute(nodeResult[6]);
            break;
    }
    vehiArray[resultIndex].totalTime = fastTime;
    console.log("waiting : "+ vehiArray[resultIndex].waitingTime + ", moving : "+ vehiArray[resultIndex].movingTime + ", Total : "+ fastTime);
    nodeResult = new Array();
}
// 가장 짧은 시간 차량 선택하기
function selectFinalVehicle(){
    var index=0;
    var time=0;
    var pare=0;
    for(var i=0 ; i<vehiArray.length ; i++){
        if(time==0){
            time = vehiArray[i].totalTime;
        }
        if(time>vehiArray[i].totalTime){
            index = i;
            time = vehiArray[index].totalTime;
        }
    }
    console.log(index);
    finalVehicle = index;
    drawFinalRoute(finalVehicle);
    pare = calcualtePare(vehiArray[finalVehicle].movingDistance, vehiArray[finalVehicle].shareDistance);
    $(".result-container").find(".title").html("The veichel has dispated.");
    $(".result-container").find(".contents").show();
    $(".result-dispatch").eq(0).html(Math.floor(vehiArray[finalVehicle].waitingTime/60) + " minutes");
    $(".result-dispatch").eq(1).html(Math.floor(vehiArray[finalVehicle].movingTime/60) + " minutes");
    $(".result-dispatch").eq(2).html(Math.floor((vehiArray[finalVehicle].totalTime-vehiArray[finalVehicle].originalTime)/60) + " minutes");
    $(".result-dispatch").eq(3).html(" ￦"+pare);

}

// 경로정보로 경로 그리기
function drawVirtualRoute(route){
    var jsonForm = new Tmap.Format.GeoJSON({extractStyles:false}).read(route);
    virtualVectorLayer.addFeatures(jsonForm);
    virtualVectorLayer.styleMap.styles.default.defaultStyle = {
        pointRadius : 1,
        strokeColor: "#3cffea",
        strokeOpacity: 0.1,
        strokeWidth: 1,
        strokeDashstyle: "solid"
    };
    map.addLayer(virtualVectorLayer);
}

function drawFinalRoute(index){
    var jsonForm = new Tmap.Format.GeoJSON({extractStyles:false}).read(vehiArray[index].node1);
    finalVectorLayer.addFeatures(jsonForm);
    finalVectorLayer.styleMap.styles.default.defaultStyle = {
        pointRadius : 1,
        strokeColor: "#7200c7",
        strokeOpacity: 0.9,
        strokeWidth: 3,
        strokeDashstyle: "solid"
    };
    map.addLayer(finalVectorLayer);
    jsonForm = new Tmap.Format.GeoJSON({extractStyles:false}).read(vehiArray[index].node2);
    finalVectorLayer.addFeatures(jsonForm);
    map.addLayer(finalVectorLayer);
    var jsonForm = new Tmap.Format.GeoJSON({extractStyles:false}).read(vehiArray[index].node3);
    finalVectorLayer.addFeatures(jsonForm);
    map.addLayer(finalVectorLayer);
}


// 요금 계산
function calcualtePare(moving, share){
    if(moving<2000){
        return 3800;
    }else{
        var pare;
        moving-2000;
        if(share>moving){
            moving = 0;
        }else{
            moving = moving-share;
        }
        pare = 3800+0.76*(moving+share*0.6);
        return pare;
    }
}

// 위치보정
function adjustStartPoint(location){
    console.log(location);
    var busStop;
    $.ajax({
        method:"GET",
        url:"https://api2.sktelecom.com/tmap/pois?version=1&format=json&callback=result",
        async:false,
        data:{
            "searchKeyword" : "버스정류장",
            "resCoordType" : "WGS84GEO",
            "reqCoordType" : "WGS84GEO",
            "searchType" : "all",
            "searchtypCd" : "R",
            "centerLon" : location.lon,
            "centerLat" : location.lat,
            "multiPoint" : "N",
            "appKey" : "8e88ce86-83f7-46b5-9272-16b581b04ae8",
            "radius" : 2,
            "count" : 10
        },
        success:function(response){
            console.log(response);
            busStop = new Tmap.LonLat(response.searchPoiInfo.pois.poi[0].frontLon, response.searchPoiInfo.pois.poi[0].frontLat);
            console.log(busStop);

            var icon = new Tmap.Icon('http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_c.png',{w:24, h:38}, {x: -12, y: -38});
            requestMarker = new Tmap.Marker(busStop.transform("EPSG:4326", "EPSG:3857"), icon);
            requestMarkerLayer.addMarker(requestMarker);
            Rider.currentLocation.lat = response.searchPoiInfo.pois.poi[0].frontLat;
            Rider.currentLocation.lat = response.searchPoiInfo.pois.poi[0].frontLon;
        },
        error:function(request,status,error){
            console.log("message:"+request.responseText);
        }

    });
}


// 지금은 사용안함
/*
var altIndex = 0;
function searchRoute(start, via1, via2, via3){
    var startX = String(start.lon);
    var startY = String(start.lat);
    var endX = String(via1.lon);
    var endY = String(via1.lat);
    var viaX1 = String(via2.lon);
    var viaY1 = String(via2.lat);
    var viaX2 = String(via3.lon);
    var viaY2 = String(via3.lat);


    $.ajax({
        method:"POST",
        headers : headersMulti,
        url:"https://api2.sktelecom.com/tmap/routes/routeSequential30?version=1&format=json",
        async:false,
        data:JSON.stringify({
            "startName" : "start",
            "startX" : startX,
            "startY" : startY,
            "startTime" : "201908011200",
            "endName" : "end",
            "endX" : endX,
            "endY" : endY,
            "viaPoints" :
                [{
                         "viaPointId" : "viaStart",
                         "viaPointName" : "viaStart",
                         "viaX" : viaX1 ,
                         "viaY" : viaY1
                },{
                         "viaPointId" : "viaEnd",
                         "viaPointName" : "viaEnd",
                         "viaX" : viaX2 ,
                         "viaY" : viaY2
                }],
            "reqCoordType" : "EPSG3857",
            "resCoordType" : "EPSG3857",
            "searchOption": 0
        }),
        success:function(response){
            console.log(response.properties.totalTime);
            if(response) {
                console.log(altIndex + " : " + resultIndex + " : sucess");
                if(response.properties.totalTime<vehiArray[resultIndex].totalTime || vehiArray[resultIndex].totalTime==undefined){
                    vehiArray[resultIndex].route = response;
                    vehiArray[resultIndex].totalTime = response.properties.totalTime;
                }
                drawVirtualRoute(response);
                $(".progress").html(Math.floor((((resultIndex*3)+altIndex)/(vehiArray.length*3))*100) + "%");
                setTimeout(function(){searchAlt()}, 1000);
            }else{
                console.log(resultIndex + " : no result");
                setTimeout(function(){searchAlt()}, 1000);
            }
        },
        error:function(request,status,error){
            console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            altIndex--;
            if(altIndex==-1){
                altIndex=0;
                resultIndex--;
            }
            errorCount++;
            if(errorCount>50){resultIndex=vehiArray.length}
            setTimeout(function(){searchAlt()}, 500);
        }
    });
};
function searchAlt(){
    altIndex++;
    if(altIndex==1){
        searchRoute(vehiArray[resultIndex].currentLocation, rider.currentLocation, rider.desination, vehiArray[resultIndex].desination);
    }else if(altIndex==2){
        searchRoute(vehiArray[resultIndex].currentLocation, rider.currentLocation, vehiArray[resultIndex].desination, rider.desination);
    }else if(altIndex==3){
        searchRoute(vehiArray[resultIndex].currentLocation, vehiArray[resultIndex].desination, rider.currentLocation, rider.desination);
    }else{
        resultIndex++;
        if(resultIndex<vehiArray.length){
            altIndex=0;
            searchRoute(vehiArray[resultIndex].currentLocation, rider.currentLocation, rider.desination, vehiArray[resultIndex].desination);
        }else{
            console.log("finish!!!");
            altIndex=0;
            resultIndex=0;
            errorCount=0;
            $(".progress").html("100%");
            $(".map-mask").fadeOut();
            selectFinalVehicle();
        }
    }
}
*/
