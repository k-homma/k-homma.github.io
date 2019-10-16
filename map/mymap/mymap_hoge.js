function distance(x1, y1, x2, y2) {     // ヒュベニ式による距離概算
    rx = 6378137;			// 赤道半径(m)
    ry = 6356752.314;			// 極半径(m)
    e2=(rx*rx-ry*ry)/rx/rx;		// 離心率 E^2
    dx = (x2-x1)*Math.PI/180;		// 経度の差をラジアン変換
    dy = (y2-y1)*Math.PI/180;		// 緯度の差をラジアン変換
    my = (y1+y2)/2.0*Math.PI/180;	// 緯度の平均をラジアン変換
    w = Math.sqrt(1-e2*Math.sin(my)*Math.sin(my));
    m = rx*(1-e2)/Math.pow(w,3);		// 子午線曲率半径
    n = rx/w;				// 卯酉線曲率半径
    return Math.sqrt(Math.pow(dy*m,2) + Math.pow(dx*n*Math.cos(my),2));
}



function okiro(){

    var threshold = 30;
    
    // data = $.csv.toObjects(Text);
    var timerInterval = 10000;	// GPS失敗で何秒後に再取得か
    var tmId = null;
    var nn = 0, countD = document.getElementById("countdown");
    var markerPoints = [], markers = [];
    /// map setting //////////////////////
    var baseLayer = {};
    //var jsonmap = L.map("mymap");
    var osm =
    	new L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    	    attribution:
    	    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    	    maxZoom: 20, maxNativeZoom: 18
    	});
    baseLayer["OpenStreetMap"] = osm;
    
    var gsi = new L.tileLayer(
    	'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    	{attribution:
    	 '&copy; <a href="//www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html">国土地理院</a>'
    	});
    baseLayer["地理院地図"] = gsi;
    
    var jsonmap = L.map('mymap', {layers: [osm]});
    //var jsonmap = L.map('mymap', {layers: [gsi]}).setView(gjl[0].coordinates, 14);
    var mapControl = L.control.layers(baseLayer, null).addTo(jsonmap);
    L.control.scale().addTo(jsonmap);
///////////////////////////////////////////
    
    // var point = L.marker().addTo(jsonmap);

    var info = document.getElementById('info');
    var stop = document.getElementById("stp");
    var gps = document.getElementById("str");
    var ser = document.getElementById("serif");
    var tm = document.getElementById("time");
    var nowTrying = null;

    var pulsingIcon = L.icon({
	iconUrl:	"../img/marker.jpg",
	iconSize:	[40, 40],
	iconAnchor:	[0, 00]
    });
    
    var imageIcon = L.icon({
	iconUrl:         "../img/jai.jpg",
	iconSize:        [50, 80],
	iconAnchor:      [19, 79],
	popupAnchor:     [0, -60] 
    });

    //    var point = L.marker([lat, lng], {icon: pulsingIcon});
    
    function tryGetGPS() {
	clearTimer();
	countD.textContent = "現在地取得を開始"
	ser.textContent = "get GPS..."
	nowTrying = navigator.geolocation.getCurrentPosition(
    	    onSuccess, onError,{
    		maximumAge: 0, timeout: 3000, enableHighAccuracy: true})
    }
    
    function onemore() {
	if (nowTrying || tmId) {
	    info.textContent = "It already getting a GPS ...or 待機中です。";
	} else {
	    startTimer();
	}
    }
    function startTimer() {
	if (tmId==null){
    	    tmId = setTimeout(tryGetGPS, 5000);
    	    ser.textContent = "5秒後にGPS取得…";
	    tm.textConent = "ok";
    	}
    }
    function clearTimer() {
     	if (tmId) {
	    clearTimeout(tmId);
	    tmId = null;
	}
    }

    function countDown() {
	tryGetGPS();
    }
    
    function stopCountDown() {
	clearTimeout();
	countD.textContent = "stop";
     	ser.innerHTML = "現在地取得ボタンをもう一度押すと始まります";
    }

    function clearWebStorage() {
	if (confirm("スタンプをリセットします")) {
	    localStorage.clear();
	    info.textContent = "クリアしました。最初からお楽しみください。"
	}
    }

    var fileptn = /\.o?(gpx|csv|kml|geojson|topojson|polyline|umap)/i;
    var gjl = omnivore.geojson("./mymap_jai.geojson", null, customLayer);
    
    var customLayer = L.geoJson(null, {	        // omnivoreに引き渡すGeoJSONレイヤ
	onEachFeature: function(f, layer, nth) {	// レイヤ上に配置する feature(地点)
	    let p = f.properties;		// ごとに、プロパティを取り出し
	    if (p) {			        // description(概要)を
		let name = p.name, desc = p.description;
		if (p.name) {
		    if (desc) {
			
			// str=str.split(/\n/);
			// for(i=0; i<str.length; i++){
			if(desc.match(/{{{/)){
			    desc = desc.replace(/{{{(.*)}}}/, '<video autoplay loop controls src="$1" width="320" height="240">')
			    // var Mov=str[i].replace(/{{{/g, "");
			    // Mov=Mov.replace(/}}}/g, "");
			}else if(desc.match(/{{/)){
			    desc = desc.replace(/{{(.*)}}/, '<img src="$1">')
			    // var Pic=str[i].replace(/{{/g, "<img src=\"");
			    // Pic=Pic.replace(/}}/g, "\">");
			}else if(desc.match(/\[\[/)){
			    desc = desc.replace(/[[|]]/, '<a href=""></a>')
			    // var Link=str[i].replace(/^\[\[/g, "<a href=\"")
			    // Link=Link.replace(/\|/g, "\">");
			    // Link=Link.replace(/]]/g, "</a>");
			}else{
				// desc=desc.concat(str[i]);
			}
			//};
			// desc = desc.replace(/{{(.*)}}/, '<img src="$1">')
		    }
		    let popup = "<h3>" + name + "</h3>" + "<p>" + (desc||"") + "</p>";
		    qinfo = gjl[nth];
		    //layer.bindPopup(qinfo["name"]).setIcon(imageIcon).openPopup();
		    layer.bindPopup(popup);	       // ポップアップに設定する
		    // info.style.color="red";
		    // countD.innerHTML += "<br>\n次の地点に近づいたら再度STARTを押してください"
		    // localStorage.setItem(nth, true);
		    
		}
	    }    
	}
    });
	
    // var gjl = omnivore.geojson("./map_jai.geojson", null, customLayer);
    mapControl.addOverlay(gjl, "スタンプポイント");

    function dispGJ(nth, layer) {
    	qinfo = gjl[nth];
    	//	hits =qinfo['coordinates']; 
    	//	layer.bindPopup(qinfo['name']).setIcon(imageIcon).openPopup();

    	//markers[nth].bindPopup(popup).setIcon(imageIcon).openPopup();
    	var geoj = gjl.toGeoJSON();
    	var len = geoj.features.length;
    	//  info.textContent = len + ':' + JSON.stringify(geoj);
    	info.style.color="red";
    	countD.innerHTML += "<br>\n次の地点に近づいたら再度STARTを押してください"
    // 	// //以下、WebStorageに取得したものを追加する
	localStorage.setItem(nth, true);
	
    	for (var i=0; i<gjl.length; i++) {
    	    var  q = gjl[i];
    	    latlng = L.latLng(q['coordinates']);
    	    markerPoints.push(latlng);
    	    var m = L.marker(latlng);
    	    markers.push(m.addTo(jsonmap));
    	    if (localStorage.getItem(i)) {		// 既に訪れた場所なら
    		m.bindPopup(q["name"]).setIcon(imageIcon); // ヒントを提示
    	    } else {
    		m.bindPopup("スタンプもらえますよきっと")
    	    }
    	}	
    }
    
    gjl.on("ready", function() {	     // 'ready' イベントに読み終わったときの処理
	jsonmap.fitBounds(gjl.getBounds());  // 読み取り失敗時は 'error' イベント
	//jsonmap.fitBounds(markerPoints);
	dispGJ();
    });
    gjl.addTo(jsonmap);		             // マップに足す



    
    // function qdisp(nth) {
// 	qinfo = [nth];
	
// 	markers[nth].bindPopup(qinfo['description']).setIcon(imageIcon).openPopup();
// //	info.innerHTML = toi;
// 	info.style.color="red";
// 	countD.innerHTML += "<br>\n次の地点に近づいたら再度STARTを押してください"
// 	//以下、WebStorageに取得したものを追加する
// 	localStorage.setItem(nth, true);
//     }

    function onSuccess(pos) {
	nowTrying = null;
	// var pulsingIcon = L.icon.pulse({iconSize:[20,20],color:'#1199fb'});
	var latlng = L.latLng([pos.coords.latitude, pos.coords.longitude]);
	ser.textContent = "現在の位置は"+latlng+"です。";
	jsonmap.panTo(latlng);
	var lat = latlng.lat, lng = latlng.lng;
	var point = L.marker([lat, lng], {icon: pulsingIcon});
	
	//Remake onSuccess.
	// L.marker([lat, lng],{icon: pulsingIcon}).addTo(geomap);
	point.setPopupContent("now").openPopup().setLatLng(latlng).addTo(jsonmap);
	// alert(array_desc.length)
	
	for (var i = 0; i<gjl.length; i++) {
	    var gpos = gjl[i].coordinates,
		glat = gpos[0],
		glng = gpos[1];
	    d = distance(glng,glat,lng,lat);	// 距離を計算
	    d = Math.floor(d*100)/100;
	    if (d <= threshold) {
		ser.textContent += d+"m";
		dispGJ(i);
		break;
	    }
	}
	if (i == gjl.length) {               // 見つかってbreakした場合
	    info.innerHTML = "距離: "+Math.round(d*100)/100+"m";
	    info.style.color="black";
	    onemore();				// 接近しなければもう一回
	}
    }
    
    
    function onError(err) {			// 失敗時
	nowTrying = null;
	ser.textContent = "現在位置の取得失敗.10秒後にもう一回";
	tmId = setTimeout(tryGetGPS, timerInterval);
    }
    
    // for (var i=0; i<gjl.length; i++) {
    // 	q = gjl[i],
    // 	latlng = L.latLng(q['coordinates']);
    // 	markerPoints.push(latlng);
    // 	var m = L.marker(latlng);
    // 	markers.push(m.addTo(jsonmap));
    // 	if (localStorage.getItem(i)) {		// 既に訪れた場所なら
    // 	    m.bindPopup(popup).setIcon(); // ヒントを提示
    // 	} else {
    // 	    m.bindPopup("スタンプが貰えます")
    // 	}
    // }
    

    
    //jsonmap.fitBounds(markerPoints);
    
    // ↓Ajaxでgeojsonを読み取る
    // var yuzalayer = new L.GeoJSON.AJAX("mymap_jai.geojson",{
    // 	onEachFeature: function(j, layer) {
    // 	    let p = j.properties;
    // 	    if (p) {
    // 		let name = p.name, desc = p.description;
    // 		if (p.name) {
    // 		    if (desc) {
    // 			// {{画像URL}} → <img src="画像URL"> に置換するをしないとどうやっても画像はでない!
    // 			desc = desc.replace(/{{(.*)}}/, '<img src="$1">')
    // 		    }
    // 		    let popup = "<h3>" + name + "</h3>" + "<p>" + desc + "</p>";
    // 		    layer.bindPopup(popup);
    // 		}
    // 	    }
    // 	}});
    // yuzalayer.addTo(jsonmap);
    // yuzalayer.on('data:loaded', function() {
    // 	jsonmap.fitBounds(yuzalayer.getBounds());
    // 	// alert(JSON.stringify(yuzalayer.toGeoJSON()));
    // 	// yuzalayer.toGeoJSON() で元のGeoJSONが得られる
    // });

    //L.control.layers(null, {"スタンプポイント": gjl}).addTo(jsonmap);

    
    gps.addEventListener("click",countDown , false);
    stop.addEventListener("click", stopCountDown, false);
    document.getElementById("clr").addEventListener("click", clearWebStorage, false);
};
document.addEventListener("DOMContentLoaded", okiro, false);
