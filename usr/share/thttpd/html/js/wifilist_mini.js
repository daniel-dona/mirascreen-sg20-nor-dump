var ssid_list_data = [];
var wifi_ap_num=0;
var get_checkstatus_id;
var connected_ssid=null ;
var wifi_status=0;
var authen_type=null ;
var wifi_status_str=null ;
var multi_language_add_network="Add Network...";//multilanguage
var multi_language_connect_fails="connect failed";//multilanguage
var multi_language_pass_warn="Password must be between 8 and 64 characters long";//multilanguage
var multi_language_connect_success="connect success";//multilanguage
var multi_language_connect_othercase="Please watch TV screen to check network connection status.";//multilanguage
var multi_language_disconnect_warn="Access Point will be disconnected if you press \"OK\".";
var multi_language_wait_warn="Please wait";
var multi_language_pass_remove="Remove the password successfully.";
var start;//multilanguage
var text_string;//multilanguage
var text_string_global=null;//multilanguage
var text_string_length;//multilanguage
var showConnectHint = 0;
var connectionERR = 0;
var resultERR = 0;
var intervalSimple;
var connect_fail_id = null;

function delay_get_data(){
	load_multilangstr();// multilanguage 連線
	if( window.location.href.indexOf("fastmode") >= 0 ){ // nowifi 直接跳轉 -> 快速呈現 ap 選擇
		console.log('skip scan_network');
		getwifi(checkWifiStatus);// -> renderwifilist
		//checkWifiStatus();// -> markupSSID
		click_listener();
	}
	else init_wifi();
}

function init_wifi(){
	console.log('init_wifi()');	
	startpwait();
	$.get("cgi-bin/wifi_info_GET.cgi", {type:'scan_network'}, function(str) { //請求ap更新wifilist
		console.log("scan network number : "+str);
		getwifi(checkWifiStatus);// -> renderwifilist
		//checkWifiStatus();// -> markupSSID
		click_listener();
	}, "text");			
}
function connectErr(){	
	if(connectionERR > 9){
		stopwait();
		console.log("clean intervalSimple : " + intervalSimple);
		clearInterval(intervalSimple);
		$("#connecthint_message_txt").text(multi_language_connect_othercase);
		$("#connecthint").hide();
		connect_fail_id = null;
	}
	else connectionERR ++;
}
function resultMsgErr(){	
	if(resultERR > 9){
		stopwait();
		console.log("clean intervalSimple : " + intervalSimple);
		clearInterval(intervalSimple);
		$("#connecthint_message_txt").text(multi_language_connect_fails);
		$("#connecthint").hide();
		ssid_list_data[connect_fail_id].connect_fail_flag = 1;
		connect_fail_id = null;
	}
	else resultERR ++;
}
function load_multilangstr(){
	console.log('load_multilangstr()');
	$.get("cgi-bin/wifi_info_GET.cgi", {type:'get_wifilist_text'}, function(index_text_string) {
		if(index_text_string.length) {
			connectionERR = 0
			start=0;
			text_string_length=0;
			text_string=index_text_string;
			text_string_length=index_text_string.length;
			$('#saveok').text(Get_text_from_textstring(text_string));//ok
			$('#add_net_saveok').text($('#saveok').text());//ok
			$('#connecthint_btn').text($('#saveok').text());//ok
			text_string=text_string_global;	
			$('#close').text(Get_text_from_textstring(text_string));//Cancel
			$('#close2').text($('#close').text());//Cancel
			text_string=text_string_global;	
			$('#delssidpw').text(Get_text_from_textstring(text_string));//Forget
			text_string=text_string_global;	
			multi_language_disconnect_warn = Get_text_from_textstring(text_string);//Access Point will be disconnected if you press "OK".		
			text_string=text_string_global;
			multi_language_wait_warn = Get_text_from_textstring(text_string);//Please wait
			$("#waiting_string").text(multi_language_wait_warn);
			$("#wait_txt").text(multi_language_wait_warn);
			text_string=text_string_global;	
			multi_language_pass_remove = Get_text_from_textstring(text_string);//Remove the password successfully.
			text_string=text_string_global;	
			$('#security_txt').text(Get_text_from_textstring(text_string));//Security
			text_string=text_string_global;	
			multi_language_add_network = Get_text_from_textstring(text_string)+"...";//Add Network
			text_string=text_string_global;
			$('#refresh').text(Get_text_from_textstring(text_string));//Refresh
			text_string=text_string_global;
			$('#header').text(Get_text_from_textstring(text_string));//WiFi Setup
			text_string=text_string_global;
			Get_text_from_textstring(text_string);//Setting
			text_string=text_string_global;
			$("#scan_string").text(Get_text_from_textstring(text_string));//Scan WiFi hotspot
			text_string=text_string_global;
			$('label[for=password]').text(Get_text_from_textstring(text_string)); //password
			$('label[for=addpassword]').text($('label[for=password]').text()); //password
		}
	}).fail(connectErr);
}
function Get_text_from_textstring(text_string){	
	var text_string_tmp=text_string.substring(start,text_string_length);	
	stop=text_string_tmp.indexOf("\n");
	start=0;
	text_indeed=text_string_tmp.substring(start,stop);
	start=stop+1;
	text_string_global=text_string_tmp;
	return text_indeed;
}
function startpwait(){
	console.log('startpwait()');
	$("#wait_pop").css('display','block');
}
function stopwait(){
	console.log('stopwait()');
	$("#wait_pop").css('display','none');
}
function getwifi(fCallback){
	console.log('getwifi()');
	$.get("cgi-bin/wifi_info_GET.cgi", {type:'scanresult_network'}, function(str) {
		if(!str) resultMsgErr();
		else {
			connectionERR = 0
			renderWifiList(str);
			if(fCallback) fCallback();
		}
	}, "text").fail(connectErr);
}
function renderWifiList(str){
	console.log('renderWifiList(str)'); 
	var string_tmp = str.substring(0, str.length);	
	var ss = [];
	var ss1 = [];
	var wifilist = '';
	ss1 = string_tmp.split("\n");
	wifi_ap_num = ss1.length - 1;
	for( var i = 0 ; i < wifi_ap_num ; i++){
		ss = ss1[i].split("\t");		
		if(ss.length==6) { 
			ssid_list_data[i] = { 
				ssid_name : ss[0], 
				authen_name : ss[1], 
				signal_name : ss[2], 
				network_id : ss[3], 
				bssid_name : ss[4], 
				freq : ss[5],
				connect_fail_flag : 0
			};
		}
	}

	// sort by ssid_name
	ssid_list_data.sort(function(a, b) {
		var nameA = a.ssid_name.toUpperCase(); // ignore upper and lowercase
		var nameB = b.ssid_name.toUpperCase(); // ignore upper and lowercase
		if (nameA < nameB) return -1;
		if (nameA > nameB) return 1;
		
		// names must be equal
		return 0;
	});

	// sort by network_id
	ssid_list_data.sort(function (a, b) {
		return b.network_id - a.network_id;
	});

	wifilist += "<li><a href='#hotspot' onClick='init_type()' id='addnet'>"+multi_language_add_network+"</a></li>";
	for(var i=0;i<wifi_ap_num;i++){
		wifilist += "<li><a href='#list' onClick='readmsg("+i+")'>"+ssid_list_data[i].ssid_name+"<img src='svg/wifi4.png'  class='ui-li-icon'></a></li>";		
	}	
	$("#wifilist").html(wifilist);
	$('#wifilist li:first').addClass("ui-first-child");
}
function click_listener(){
	console.log('click_listener()');
	$('#reloadBtn').click(function(){
		if (isDoubleClicked($(this))) return;
		init_wifi();
	});

	$('#password').click(function(){
		$('#password').get(0).type='text';
	}); 
	  
	$('#close').click(function(){
		$('#password').get(0).type='password';
		$('#list').hide();
	});

	$('#close2').click(function(){
		$('#hotspot').hide();
	});

	$('#connecthint_btn').click(function(){
		$('#connecthint').hide();
	});
	   
	$('#delssidpw').click(function(){
		if (isDoubleClicked($(this))) return;
	    var Val=$('#disptxt').text();
		var i=Number(Val);
		var tmp="";
		tmp="forget_network" + "\t" + "networkId="+ssid_list_data[i].network_id;
		$('#list').hide();
		if(ssid_list_data[i].network_id != "-1"){			
			$.get("cgi-bin/wifi_info_GET.cgi", {type:tmp}, function(getData) {
				connectionERR = 0;
				if(Number(getData) == 1) {
					ssid_list_data[i].network_id = "-1";
					connected_ssid = "";
					$("#wifilist li a").removeClass('select_bk');
				}
				init_wifi();
			}, "text").fail(connectErr);			
		}
	}); 
	   
	$('#saveok').click(function(){
		if (isDoubleClicked($(this))) return;
		var tmp="";
		var getData="1";
		var errorFlag=0;
		var regx = /^[A-Za-z0-9]+$/; 
		var pskval = $('#password').val();
		var Val=$('#disptxt').text();
		var i=Number(Val);
		connect_fail_id = i;
		showConnectHint = 1;
		$('#dispwarn_txt').text("");
		$('#dispwarn_txt').hide();
		if((pskval.length < 8 || pskval.length >64)&&(ssid_list_data[i].network_id=="-1")&&(ssid_list_data[i].authen_name!="NONE")) {		
			$('#dispwarn_txt').text(multi_language_pass_warn); //"Password must be between 8 and 64 characters long"
			$('#dispwarn_txt').show();
		}
		else {
			$('#list').hide();
			if(ssid_list_data[i].connect_fail_flag == 1) {
				tmp="psk="+$('#password').val()+"\t"+"networkId="+ ssid_list_data[i].network_id;
				ssid_list_data[i].connect_fail_flag = 0;
			}
			else if( ssid_list_data[i].network_id == "-1") tmp="SSID="+ssid_list_data[i].ssid_name+"\t"+"authen="+ssid_list_data[i].authen_name+"\t"+"psk="+$('#password').val()+"\t"+"MAC="+ ssid_list_data[i].bssid_name+"\t"+"networkId="+ ssid_list_data[i].network_id;
			else tmp = "networkId="+ ssid_list_data[i].network_id;			
			console.log(tmp);
			startpwait();
			$.get("cgi-bin/connect_network.cgi", {type:tmp}, function(getData) {				
				connected_ssid = null;
				wifi_status = 0;				
				setTimeout(reloadWifiList,3000);	
			}, "text").fail(connectErr);
		}
	});

	$('#WPA').click(function(){
	    $('#WPA').get(0).type='radio';
		$('#showpassword').show();
		authen_type="WPA-PSK";
	}); 

	$('#OPEN').click(function(){
	    $('#OPEN').get(0).type='radio';
		$('#showpassword').hide();
		$('#add_password').val("");
		authen_type="NONE";
	}); 
	$('#add_net_saveok').click(function(){
		if (isDoubleClicked($(this))) return;
	    var tmp="";
		var getData="";
		showConnectHint = 1;
		$('#hotspot').hide();
		tmp="add_network" + "\t" + "SSID="+$('#add_ssid').val()+"\t"+"authen="+authen_type+"\t"+"psk="+$('#add_password').val()+"\t"+"scan_ssid=1";
		startpwait();
	  	$.get("cgi-bin/wifi_info_GET.cgi", {type:tmp}, function(getData) {
			connected_ssid = "";
			wifi_status = 0;			
			setTimeout(reloadWifiList,7000);	
		}, "text").fail(connectErr);
	});

}
function readmsg(val){  //read ssid,password
	$('#list').show();
	console.log('readmsg('+val+')');
	var ret=val;//Number(val);
	$('#ssid_txt').text(ssid_list_data[ret].ssid_name);
	$('#disptxt').text(val);
	$('#disptxt').hide();
	$('#dispwarn_txt').hide();//text("Wireless will disconnect if you choose OK"); 
	if(ssid_list_data[ret].authen_name=="NONE") {
		 $('#show_wifi_paassrod').hide();
		 $('#password').val('');
	}
	else if(ssid_list_data[ret].network_id != "-1" && ssid_list_data[ret].connect_fail_flag != 1) { 
		$('#show_wifi_paassrod').hide(); 
		$('#delssidpw').show();
	}
	else {
		$('#show_wifi_paassrod').show();
		$('#password').val('');
		$('#delssidpw').hide();
	}
}
function init_type(){
	$("#hotspot").show();
	console.log('init_type()');
    $('#OPEN').click();
    $('label[for=OPEN]').removeClass("ui-radio-off");
    $('label[for=OPEN]').addClass("ui-radio-on ui-btn-active");
}
function checkWifiStatus(){
	console.log('checkWifiStatus()');
	if(intervalSimple){
		console.log("clean intervalSimple : " + intervalSimple);
		clearInterval(intervalSimple);
	} 		
	$.get("cgi-bin/wifi_info_GET.cgi", {type:'get_wifi_status'}, function(str) {
		wifi_status_str=str;
		var ss=[];
		ss = str.split("\t");
		wifi_status=Number(ss[1]);		
		if(wifi_status >= 9 && wifi_status <= 11){ // 標註連線成功項目			
			connected_ssid = ss[0];
			console.log('check_wifi_status() - good : ' + connected_ssid);
			setTimeout(markupSSID, 50);
		}
		else console.log('check_wifi_status() - no connect : ' + str);
		stopwait();
	}, "text").fail(connectErr);
}
function markupSSID(){
	console.log('markupSSID()');
	for(var i=0;i<wifi_ap_num;i++){
		if($('#wifilist li:nth-child('+i+') a').text() == connected_ssid){
			$('#wifilist li:nth-child('+i+') a img').attr("src","svg/Check.png");
			/*$('#wifilist li:nth-child('+i+') a').addClass("select_bk");
			$('#wifilist li:first').removeClass("ui-first-child");*/				
			var ele = $('#wifilist li:nth-child('+i+')');
			$('.ui-first-child').after(ele);
		}
		//else $('#wifilist li:nth-child('+i+') a').removeClass("select_bk");
	}
}
function reloadWifiList(){
	connectionERR = 0;
	intervalSimple = setInterval(simpleWifiCheck,6000);	
}
function simpleWifiCheck(){
	console.log('simpleWifiCheck() - start');
	$.get("cgi-bin/wifi_info_GET.cgi", {type:'get_wifi_status'}, function(str) {
		wifi_status_str=str;
		var ss=[];
		ss = str.split("\t");
		wifi_status=Number(ss[1]);		
		if(wifi_status >= 9 && wifi_status <= 11){ // 成功項目
			console.log('simpleWifiCheck() good : '+str);
			connectionERR = 0;
			getwifi(checkWifiStatus);// -> renderwifilist
			//checkWifiStatus();// -> markupSSID
			$("#connecthint_message_txt").text(multi_language_connect_success);
			$("#connecthint").hide();
			connect_fail_id = null;
		}
		else { // 連線失敗
			console.log('simpleWifiCheck() bad : '+str);
			resultMsgErr();
		}
	}, "text").fail(connectErr);
}
function isDoubleClicked(element) {
    //if already clicked return TRUE to indicate this click is not allowed
    if (element.data("isclicked")) return true;

    //mark as clicked for 1 second
    element.data("isclicked", true);
    setTimeout(function () {
        element.removeData("isclicked");
    }, 1000);

    //return FALSE to indicate this click was allowed
    return false;
}