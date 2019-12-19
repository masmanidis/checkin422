
var _fn = {
  
  storageprefix: 'mcheckin:',
  doRequest: function (inSuccessFN) {
    alert("fn1");
    var me = this;
    me.rs = '';
    me.rUrl = localStorage.getItem(_fn.storageprefix+'url') + "checkin_proxy.php";
    // me.rUrl = "http://devel1.online-ferry.eu/checkin_proxy.php";
    me.rType = 'POST';
    me.rBody = '';
    me.rParams = '';
    me.successFN = inSuccessFN;
    me.appLng = localStorage.getItem(_fn.storageprefix+'appLng') ? localStorage.getItem(_fn.storageprefix+'appLng'):'EN';
    me.rExtraParams = '&rLang=' + me.appLng + '&rCoin=&compid=' + app.compid + '&phpsession=' + app.data.phpsessionid;   
    me.dataType = "json",
    me.extraOptions = 'none',
    me.sendRequest = function (retType) {
        if( localStorage.getItem(_fn.storageprefix+'url') == null || 
            localStorage.getItem(_fn.storageprefix+'url').trim().length == 0) return;
        app.dialog.progress();
        var extraOptions = me.extraOptions;
        app.request({
          type: me.rType,
          url: me.rUrl,
          dataType: me.dataType,
          timeout: 30000,
          xhrFields: { withCredentials: true },
          crossDomain: true,
          data: me.rParams + me.rExtraParams,
          success: function (response, stat, obj) {
          
            app.dialog.close();
            obj.options = extraOptions;
            if (typeof (inSuccessFN) == 'function' || typeof (inSuccessFN) != 'undefined') 
              inSuccessFN(response, stat, obj);
            else {
              me.rs = response;
              return;
            }
          },
          error: function (response, stat, obj) {
           
            app.dialog.close();
            var notifications = app.notification.create({
              
              text: _fn.trans("tr_error") +" "+ stat
            });
            notifications.open();
          }
        });


      };
  },
  doSelectRowId: function ( id ) {
    alert("fn2");
    $$("#" + id)[0].checked = true;
    $$("#" + id).trigger("click");
    app.selrowId = id;
  },
  doSearchCallback: function () {
    alert("fn3");
    var gridRows = document.querySelectorAll( 'input[name="gridrows"]' ).length;
    if (gridRows > 0) {
      _fn.doSelectRowId(gridRows[0].id);
      _fn.doSelectRowId(app.selrowId);
    } else if (gridRows > 0 && $frmSelRow < 0) {
      _fn.doSelectRowId(gridRows[0].id);
    } else if (gridRows > 0) {
      _fn.doSelectRowId(app.selrowId);
    }
  },
  handleSound: function (o) {
    alert("fn4");
    var el = document.getElementById(o.id);
    if (el.getAttribute('data-sound') == 'on') {
      el.setAttribute('data-sound', 'off');
      el.src = "images/mute-volume.png";
      app.hasSound = false;
    } else {
      el.setAttribute('data-sound', 'on');
      el.src = "images/volume-up.png";
      app.hasSound = true;
    }
  },
  doPlaySound: function (inStatus) {
    alert("fn5");
    switch (inStatus) {
      case 1:
        document.getElementById('checkinsound').src = 'images/chord.wav';
        break;
      case 2:
        document.getElementById('checkinsound').src = 'images/notify.wav';
        break;
      default:
        document.getElementById('checkinsound').src = 'images/ding.wav';
        break;
    }
  },
  displayError: function (inText, inType) {
    alert("fn6");
    if (typeof (inType) == 'undefined') {
      var inType = '';
    }
    _fn.doPlaySound(2);
    switch (inType) {
      // case 'e': 
      // var inTypeIcon = '<i class="fa fa-times-circle fa-lg text-color-red"></i>';
      //   break;
      // case 'w': 
      //   var inTypeIcon = '<i class="fa fa-exclamation-triangle fa-lg text-color-orange"></i>';
      //   break;
      default:
        var inTypeIcon = '<i class="fa fa-info-circle fa-lg text-color-blue"></i>';
        break;
    }
    var notifications = app.notification.create({
      text: inTypeIcon + " " + inText
    });
    notifications.open();
    mainView.router.currentRoute.route.methods.doSetInputFocus(app.process);
  },
  frmSysDate: function (d) {
    alert("fn7");
    return d.substring(6) + "-" + d.substring(3, 5) + "-" + d.substring(0, 2);

  },
  findTicketRow: function (array, value) {
    alert("fn8");
    return array.find(obj => obj.ticket == value);
  },
  successGetTTRQ: function (response) {
    alert("fn9");
    
    var searchTemplate = $$('script#timetable').html();
    var compiledSearchTemplate = Template7.compile(searchTemplate);
    $$("#t7timetable").html(compiledSearchTemplate(response));
    document.querySelectorAll(".departures").forEach(function (o, idx) {
     
      $$("#" + o.id).off('click').on('click', function (e) {
     
        e.preventDefault();
    
        app.data.trp = o.id;
        app.data.vessel = $$("#" + o.id).attr("vessel");
        app.data.depdate = $$("#" + o.id).attr("depdate");
        app.data.frmport = $$("#" + o.id).attr("frmport");
        // app.data.toport = $$("#" + o.id).attr("toport");
        app.data.itindescr = $$("#" + o.id).attr("itindescr");
        app.data.tripmainid = $$("#" + o.id).attr("tripmainid");
        app.data.locationnumfrom = $$("#" + o.id).attr("locationnumfrom");
        // app.data.locationtodescr = $$("#" + o.id).attr("locationtodescr");
        _fn.getCheckinSt(1);
        app.selrowId = -999;
        mainView.router.navigate('/checkin/');
        return false;
      });
    });

  },
  applyCheckinSt: function (rval, status, obj) {
    alert("fn10");
    if (typeof (obj) == 'object' && obj.options == true) {
      rval = JSON.parse(rval.response.checkinsumans);
    } else {
      rval = rval.response.checkinsumans;
    }
    if (typeof (rval) == 'undefined') return;

    var compiledEmbarkation = Template7.compile($$('script#t7embarkation').html());
    $$("#embarkation").html(compiledEmbarkation(rval));
  },

  getCheckinSt: function (inType) {
    alert("fn11");
    var prms = {
      msg: 'checkinstats',
      tripmainid: app.data.tripmainid,
      locationnumfrom: app.data.locationnumfrom
    };
    var newRq = new _fn.doRequest(_fn.applyCheckinSt);
    newRq.dataType = 'json';
    newRq.rType = 'POST';
    newRq.extraOptions = true;
    newRq.rParams = app.utils.serializeObject(prms);
    newRq.sendRequest(false);
  },
  init: function () { 
		$$('.lang').click(function() {
      localStorage.setItem(_fn.storageprefix+'appLng', $$(this).attr("lang"));
      localStorage.removeItem(_fn.storageprefix+'langdata');
      app.popover.close(".langpopover");
      $$("#flag")[0].src = 'images/'+localStorage.getItem(_fn.storageprefix+"appLng")+'.png';
      _fn.doGetLang();
    });
	},
	doChangeLang : function () {
    alert("fn13");
    app.langdata = JSON.parse(localStorage.getItem(_fn.storageprefix+'langdata'));
    $$("[lex]").each(function( i ) {
  		$$(this).html(eval('app.langdata.'+$$(this).attr('lex')));  
    });
  },    
  
	trans : function (inStr) {

    alert("fn14");
    if(typeof(app.langdata) == "undefined") return "";
    return eval('app.langdata.'+inStr);
  },
  
	successGetLangRQ: function (response,s,o) {
    alert("fn15");
    app.langdata = response.lang;
    console.log(response.lang);
    localStorage.setItem(_fn.storageprefix+"langdata",JSON.stringify(response.lang));
    _fn.doChangeLang();
  },    
  
	doGetLang: function () {

    alert("fn16");
     if(localStorage.getItem(_fn.storageprefix+"langdata")) {
      _fn.doChangeLang();
      return;
     }
      var newRq = new _fn.doRequest(_fn.successGetLangRQ);
      newRq.rParams = 'msg=getLang';
      newRq.sendRequest(false);
    
  },
  checkin: function () {
    alert("fn17");
    this.trip = '';
    this.itindescr = '';
    this.frmto = '';
    this.depdate = '';
    this.vessel = '';
    this.tripmainid = '';
    this.locationnumfrom = '';
    this.phpsessionid = '';
  }
}

alert("skata");
 

 

