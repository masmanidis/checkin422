alert("root start"); 
routes = [
	{
		name: 'home',
		path: '/',
		url: 'index.html',
		on: {
			pageAfterIn: function () {

				if (!localStorage.getItem(_fn.storageprefix + 'appLng')) {
					localStorage.setItem(_fn.storageprefix + 'appLng', localStorage.getItem(_fn.storageprefix + 'appLng') ? localStorage.getItem(_fn.storageprefix + 'appLng') : 'EN'
					);
				}

				if (localStorage.getItem(_fn.storageprefix + 'clstorage') ) {
					var d = new Date();
					var today = new Date(d.getFullYear() + "-" + ((d.getMonth() + 1) < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "-" +
					((d.getDate()) < 10 ? "0" + (d.getDate()) : (d.getDate())));
					
					var d = new Date(localStorage.getItem(_fn.storageprefix + 'clstorage'));	
					var storagedate = new Date(d.getFullYear() + "-" + ((d.getMonth() + 1) < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "-" +
					((d.getDate()) < 10 ? "0" + (d.getDate()) : (d.getDate())));
					
					if( today > storagedate ) {
						localStorage.removeItem(_fn.storageprefix + 'ports');
						localStorage.removeItem(_fn.storageprefix + 'vessel');
						localStorage.removeItem(_fn.storageprefix + 'langdata');
					}	
				} 
				_fn.doGetLang();
				if (localStorage.getItem(_fn.storageprefix + 'url') && localStorage.getItem(_fn.storageprefix + 'compid')) {
					$$('input#url').val(localStorage.getItem(_fn.storageprefix + 'url'));
					$$('input#compid').val(localStorage.getItem(_fn.storageprefix + 'compid'));
				}
				app.url = $$('input#url').val();
				app.compid = $$('input#compid').val();
				// $$('input#url')[0].select();
				$$('#loginlink').off('click').on('click', function () {
					
					app.input.validateInputs("#appsettings");
					if (document.querySelector('#appsettings .input-invalid') == null) {
						if($$('input#url').val()[$$('input#url').val().length-1] != '/') {
							$$('input#url').val($$('input#url').val()+"/");
						} 
						if( localStorage.getItem(_fn.storageprefix + 'url') ) {
							if( localStorage.getItem(_fn.storageprefix + 'url') != $$('input#url').val() ||
								localStorage.getItem(_fn.storageprefix + 'compid') != $$('input#compid').val()
							) {
								localStorage.removeItem(_fn.storageprefix + 'ports');
								localStorage.removeItem(_fn.storageprefix + 'vessel');
								
							}
						}
						
						localStorage.setItem(_fn.storageprefix + 'url', $$('input#url').val());
						localStorage.setItem(_fn.storageprefix + 'compid', $$('input#compid').val());
						app.url = $$('input#url').val();
						app.compid = $$('input#compid').val();
						mainView.router.navigate({ name: 'login' });
					} else {
						var notifications = app.notification.create({
							text: _fn.trans('tr_invalid_data')
						});
						notifications.open();
					}
				});
				$$('#resetlink').off('click').on('click', function () {
					app.dialog.confirm(_fn.trans("tr_procced_clearing_application_settings"), function () {
						$$('input#url').val('');
						$$('input#compid').val('');
						localStorage.removeItem(_fn.storageprefix + 'url');
						localStorage.removeItem(_fn.storageprefix + 'compid');
						localStorage.removeItem(_fn.storageprefix + 'ports');
						localStorage.removeItem(_fn.storageprefix + 'vessel');
						localStorage.removeItem(_fn.storageprefix + 'dateFrom');
						localStorage.removeItem(_fn.storageprefix + 'langdata');

					});
				});

				if (localStorage.getItem(_fn.storageprefix + "appLng")) {
					$$("#flag")[0].src = 'images/' + localStorage.getItem(_fn.storageprefix + "appLng") + '.png';
				}
				app.url = $$('input#url').val();
				app.compid = $$('input#compid').val();
				mainView.router.history[0] = "/";
			}
		}

	},
	{
		name: 'checkin',
		path: '/checkin/',
		url: './pages/checkin.html',

		methods: {
			resetForm: function () {

				$$('#grid1')[0].innerHTML = '';
				$$('#checkinidlabel')[0].innerHTML = '';

				if (app.process == '') {
					app.process = 'caret0';
				}
				app.byforce = '';
				app.selrowId = -999;

				// $$("#byticket")[0].click();
				// $me.getId('$frmcheckinbtn').style.display = 'none';
				// $me.getId('$frmcheckoutbtn').style.display = 'none';
				// $me.getId('$frmSavebtn').style.display = 'none';
			},

			doSetInputFocus: function (inType) {
				if (inType == 'caret0') {
					if ($$("input#ticket").val().trim() == '')
						$$("input#ticket").val(" ");

					app.input.focus($$("input#ticket"));
					document.getElementById("ticket").select();
				} else if (inType == 'caret1') {
					if ($$("input#bookingref").val().trim() == '')
						$$("input#bookingref").val(" ");

					app.input.focus($$("input#bookingref"));
					document.getElementById("bookingref").select();
				}
			},
			doSearch: function (inType) {
				function successDoCheckin(rval, s, o) {


					if (rval.error != -999 && rval.error != '') {
						_fn.displayError(rval.error.split('@@')[1], '');
						$$("#grid1").html("");
					}

					app.rs = rval['response'];
					
					if (inType == -1 || rval.response.errorcode == -999) {
						_fn.doPlaySound();
						var searchTemplate = $$('#t7grid1').html();
						var compiledSearchTemplate = Template7.compile(searchTemplate);
						$$("#grid1").html(compiledSearchTemplate(app.rs));


						var rows = document.querySelector('#grid1table').rows;

						[].forEach.call(rows, function (row, index) {
							if (o.options == '-999' && index == 0) {
								$$("#checkinidlabel").html(row.getAttribute("checked"));

								_fn.doSelectRowId(row.getAttribute("ticket"));

							}


							$$("#" + row.id).on('click', function (o) {
								var tr = o.target.closest('tr');
								
								$$("#checkinidlabel").html(tr.getAttribute("checked"));
								tr.querySelector("input").checked = true;
								app.data.checked = tr.getAttribute("checked");
								app.data.type = tr.getAttribute("type");
								app.data.ticket = tr.querySelector("input").id;

								app.selrowId = tr.querySelector("input").id;

							})
						});

						if (o.options != '-999') {
							// alert(o.options);
							_fn.doSelectRowId(o.options);
						}


					}

					if ((inType == 'O' || inType == 'I') && app.process == "caret1") {

						mainView.router.currentRoute.route.methods.doSearch(-1);
					} else if ((inType == 'O') && app.process == "caret0") {

						mainView.router.currentRoute.route.methods.resetForm();
						//_fn.displayError('ticketcheckedout');
						_fn.displayError(rval.error.split('@@')[1], 'w');
						//$frmsetMessage('@{ticketcheckedout}', 1);
					} else {

						document.getElementById("ticket").select();
					}
					_fn.applyCheckinSt(rval);
					if (parseInt(rval.response.errorcode) == 564) {

						_fn.doPlaySound(2, 'w');
					}
					if (parseInt(rval.response.errorcode) == 567 ||
						parseInt(rval.response.errorcode) == 764
					) {

						app.byforce = 'Y';
						_fn.doPlaySound(2, 'w');
					} else {

						app.byforce = '';
					}
				}
				

				var alpha = /^[A-Za-z0-9]+$/;
				var tmpTicketValue =  $$("input#ticket").val();
				tmpTicketValue = tmpTicketValue.replace(/\s+/g, '');
				
				if(alpha.test(tmpTicketValue) && tmpTicketValue.length > 1) {
					 
					if( isNaN(tmpTicketValue.slice(1)) ){

						 	
						_fn.displayError(_fn.trans("tr_invalid_ticket"), 'e');
						return false;
					}
					$$("input#ticket").val(tmpTicketValue[0].toUpperCase()+" "+parseInt(tmpTicketValue.slice(1)));
					document.getElementById('ticket').focus();
					document.getElementById('ticket').select();
					$$("input#bookingref").val('');
					 
				} else {
					_fn.displayError(_fn.trans("tr_invalid_ticket"), 'e');
					return false;
				}	



				var prms = {};
				prms.kind = '';
				prms.msg = 'docheckin';
				prms.ticklet = '';
				prms.tnumber = '';
				prms.bookingref = $$("input#bookingref").val();
				if (app.process == 'caret0') {
					prms.ticklet = $$("input#ticket").val().split(" ")[0];
					prms.tnumber = $$("input#ticket").val().split(" ")[1];
				}

				if (app.byforce == 'Y') {
					prms.byforce = app.byforce;
					var r = confirm(_fn.trans("tr_ticket_will_be_transfered"));
					if (r == false) { return; }
				} else
					prms.byforce = '';

				if (inType == -1) {
					prms.byforce = '';  // clicked from search or from inputs
				} else {
					// prms.type = app.data.type;
					// prms.checked = app.data.checked;
					// prms.bookingref = '';
					// prms.kind = inType;

					// if( app.process == 'caret1' ) {
					var rec = _fn.findTicketRow(app.rs.tickets, app.selrowId);
					prms.ticklet = rec.ticket.split('-')[0];
					prms.tnumber = rec.ticket.split('-')[1];
					prms.checked = rec.checked;
					prms.type = rec.type;

					prms.kind = inType;

					// }
				}
				app.byforce = '';
				prms.locationnumfrom = app.data.locationnumfrom;
				prms.tripmainid = app.data.tripmainid;

				var newRq = new _fn.doRequest(successDoCheckin);

				newRq.extraOptions = app.selrowId;
				newRq.rParams = app.utils.serializeObject(prms);
				newRq.sendRequest(false);
			}
		},
		on: {
			pageAfterIn: function (e, page) {

				var searchTemplate = $$('#t7selected').html();
				var compiledSearchTemplate = Template7.compile(searchTemplate);
				$$("#selected").html(compiledSearchTemplate(app.data));
				app.accordion.close(".selectedvessel");

				$$("#changetrip").on("click", function () {
					mainView.router.navigate("/tripselection/", { ignoreCache: true, force: false });
				});
				$$("#gohome").on("click", function () {
					mainView.router.back("/", { ignoreCache: true, force: true });
				});
				mainView.router.currentRoute.route.methods.resetForm();
				$$("#byticket").on("click", function (o) {
					o.target.classList.add("button-active");
					document.getElementsByClassName("byticket")[0].classList.remove("hidden");
					document.getElementById("bybooking").classList.remove("button-active");
					document.getElementsByClassName("bybooking")[0].classList.add("hidden");
					app.process = 'caret0';
					mainView.router.currentRoute.route.methods.doSetInputFocus(app.process);
					mainView.router.currentRoute.route.methods.resetForm();
				});
				$$("#bybooking").on("click", function (o) {
					o.target.classList.add("button-active");
					document.getElementsByClassName("bybooking")[0].classList.remove("hidden");
					document.getElementById("byticket").classList.remove("button-active");
					document.getElementsByClassName("byticket")[0].classList.add("hidden");
					app.process = 'caret1';
					mainView.router.currentRoute.route.methods.doSetInputFocus(app.process);
					mainView.router.currentRoute.route.methods.resetForm();
				});

				app.process = 'caret0';
				mainView.router.currentRoute.route.methods.doSetInputFocus(app.process);

				$$("input#ticket").on('keydown', function (e) {
					if ( e.keyCode == 13 ) {
						if( e.target.value != '' ||  e.target.value.length > 1 ) {
							$$("#dosearch").click();

							
						}
					}

					// if (e.keyCode == 13) {
					// 	document.getElementById('ticket').focus();
					// 	document.getElementById('ticket').select();
					// 	$$("input#bookingref").val('');
					// 	$$("#dosearch").click();
					// }
				});
				$$("input#bookingref").on('keydown', function (e) {
					if (e.keyCode == 13) {
						document.getElementById('bookingref').focus();
						document.getElementById('bookingref').select();
						$$("input#ticket").val('');
						$$("#dosearch").click();
					}
				});

				$$("#changetrip").on("click", function (o) {
					mainView.router.back();
				});
				$$("#docheckin").on("click", function (o) {
					if (app.selrowId != -999) {
						var rec = _fn.findTicketRow(app.rs.tickets, app.selrowId);
						if (rec.checked == '')
							mainView.router.currentRoute.route.methods.doSearch('I');
					}
				});

				$$("#docheckout").on("click", function (o) {
					if (app.selrowId != -999) {
						var rec = _fn.findTicketRow(app.rs.tickets, app.selrowId);
						if (rec.checked != '')
							mainView.router.currentRoute.route.methods.doSearch('O');
					}
				});
				$$("#doclear").on("click", function (o) {
					mainView.router.currentRoute.route.methods.doSetInputFocus(app.process);
					mainView.router.currentRoute.route.methods.resetForm();
				});

				$$("#doinfo").on("click", function (o) {
					if (app.selrowId == -999) {
						_fn.displayError(_fn.trans("tr_please_select_a_ticket"), 'e');
						return false;
					}
					var popup = app.popup.create({
						el: '#apppopup',
						on: {
							opened: function () {
								var rec1 = _fn.findTicketRow(app.rs.tickets, app.selrowId);
								var searchTemplate = $$('#t7ticketinfo').html();
								var compiledSearchTemplate = Template7.compile(searchTemplate);
								$$("#ticketinfo").html(compiledSearchTemplate(rec1));
								_fn.doChangeLang();
							},
							closed: function () {
								mainView.router.currentRoute.route.methods.doSetInputFocus(app.process);
							}
						}
					});
					popup.open();
				});

				$$("#dosearch").on("click", function (o) {
					app.selrowId = -999;
					app.byforce = '';  // case different trip or open ticket
					if (app.process == 'caret0') {
						$$("input#ticket").val($$("input#ticket").val().toUpperCase());
						$$("input#bookingref").val(" ");
						app.input.validate("#ticket");
						if (!document.querySelector('#ticket').classList.contains('input-invalid')) {
							if ($$("input#ticket").val().trim() == '') {
								return;
							} else {
								mainView.router.currentRoute.route.methods.doSearch(-1);
							}
						} else {
							_fn.displayError(_fn.trans("tr_invalid_data"));
						}
					} else {
						$$("input#bookingref").val($$("input#bookingref").val().toUpperCase());
						$$("input#ticket").val(" ");
						app.input.validate("#bookingref");
						if (!document.querySelector('#bookingref').classList.contains('input-invalid')) {
							if ($$("input#bookingref").val().trim() == '') {
								return;
							} else {
								mainView.router.currentRoute.route.methods.doSearch(-1);
							}
						} else {
							_fn.displayError(_fn.trans("tr_invalid_data"));
						}
					}
				});
			}
		}
	},
	{
		name: 'login',
		path: '/login/',
		url: './pages/login.html',

		methods: {
			login: function () {


				function successLogin(r) {
					if (r['error'] != '') {
						var notifications = app.notification.create({
							title: '<i class="fa fa-exclamation-triangle fa-lg"></i> ' + r['error'],
							text: _fn.trans("tr_enter_valid_credentials"),
						});
						notifications.open();
						return;
					} else {
						
								
						localStorage.setItem(_fn.storageprefix + 'clstorage', r['clstorage']);
						localStorage.setItem(_fn.storageprefix + 'agencycode', $$("input#agencycode").val());
						localStorage.setItem(_fn.storageprefix + 'usercode', $$("input#usercode").val());

						if (!localStorage.getItem(_fn.storageprefix + 'ports') || !localStorage.getItem(_fn.storageprefix + 'vessel')) {
							localStorage.setItem(_fn.storageprefix + 'ports', r['ports']);
							localStorage.setItem(_fn.storageprefix + 'vessel', r['vessels']);

						}
						app.data.phpsessionid = r['phpsession'];
						mainView.router.navigate({ name: 'tripselection' });				
						
						 

						
					}

				}




				app.input.validateInputs("#logininputs");
				if (document.querySelector('#logininputs .input-invalid') == null) {

				} else {
					var notifications = app.notification.create({
						title: '<i class="fa fa-exclamation-triangle fa-lg"></i> Error',
						text: _fn.trans("tr_invalid_data")
					});
					notifications.open();
					return;
				}

				var newRq = new _fn.doRequest(successLogin);
				newRq.dataType = 'json';
				newRq.rType = 'POST';
				var prms = {
					msg: 'login',
					usercode: $$("input#usercode").val(),
					passwd: $$("input#passwd").val(),
					compid: app.compid,
					agencycode: $$("input#agencycode").val()
				};
				newRq.rParams = app.utils.serializeObject(prms);
				newRq.sendRequest(false);

			}
		},
		on: {
			pageAfterIn: function (e, page) {

				_fn.doGetLang();
				if (localStorage.getItem(_fn.storageprefix + 'agencycode'))
					$$("input#agencycode").val(localStorage.getItem(_fn.storageprefix + 'agencycode'));

				if (localStorage.getItem(_fn.storageprefix + 'usercode'))
					$$("input#usercode").val(localStorage.getItem(_fn.storageprefix + 'usercode'));

				$$("#login").on("click", function () {
					mainView.router.currentRoute.route.methods.login();
				});

			},
			pageAfterOut: function (e, page) {
				$$("#login").off("click");
			},
			pageInit: function (event, page) {
			},
			pageBeforeRemove: function (event, page) {

			}
		}
	},
	{
		name: 'tripselection',
		path: '/tripselection/',
		url: './pages/tripselection.html',


		on: {
			pageInit: function (e, page) {
				
				var today = new Date();
				var values = [];
				values[0] = new Date().setDate(today.getDate() + 1);

				var dateFrom = app.calendar.create({
					inputEl: '#dateFrom',
					dateFormat: 'dd-mm-yyyy',
					header: true,
					footer: true,
					closeOnSelect: true,
					openIn: 'customModal'
				});
				// $$(".frmPorts").on("smartselect:opened", function(){
				// 	
				// 	document.querySelector('input[type="search"]').value = " ";
				// 	document.querySelector('input[type="search"]').select();
				// });
				dateFrom.on('change', function (p, values, displayValues) {
					localStorage.setItem(_fn.storageprefix + 'dateFrom', new Date(values[0]));
				});
				if (localStorage.getItem(_fn.storageprefix + 'dateFrom')) {
					values[0] = new Date(localStorage.getItem(_fn.storageprefix + 'dateFrom'));
				}
				dateFrom.setValue([values[0]]);
				$$('#formSearchBtn').on('click', function () {
					$$("input#frmPorts").val(localStorage.getItem(_fn.storageprefix + 'usercode'));
					app.input.validate("#frmPorts");
					app.input.validate("#vessels");
					
					if(app.smartSelect.get(".frmPorts").$valueEl[0].innerText.length == 0) return;
					if(app.smartSelect.get(".vessels").$valueEl[0].innerText.length == 0) return;

					

					if (document.querySelector('#vessels .input-invalid') == null && document.querySelector('#frmPorts .input-invalid') == null) {
						mainView.router.navigate({ name: 'timetable' });
					} else {
						_fn.displayError(_fn.trans("tr_invalid_data"));
						return;
					}
				});
			},
			pageAfterIn: function (e, page) {
				

				if ($$("#frmPorts")[0].length == 0)
					$$("#frmPorts").html(localStorage.getItem(_fn.storageprefix + 'ports')).change();
				if ($$("#vessels")[0].length == 0)
					$$("#vessels").html(localStorage.getItem(_fn.storageprefix + 'vessel')).change();


				$$("#frmPorts").val(localStorage.getItem(_fn.storageprefix + 'frmPorts')).change();
				$$("#vessels").val(localStorage.getItem(_fn.storageprefix + 'vessels')).change();


				if (localStorage.getItem(_fn.storageprefix + 'frmPorts')) {
					$$("#frmPorts").val(localStorage.getItem(_fn.storageprefix + 'frmPorts')).change();
				}
				if (localStorage.getItem(_fn.storageprefix + 'vessels')) {
					$$("#vessels").val(localStorage.getItem(_fn.storageprefix + 'vessels')).change();
				}
				$$("#frmPorts").on('change', function (o) {
					localStorage.setItem(_fn.storageprefix + 'frmPorts', o.target.value);
				})
				$$("#vessels").on('change', function (o) {
					localStorage.setItem(_fn.storageprefix + 'vessels', o.target.value);
				})

			}
		}
	},
	{
		name: 'timetable',
		path: '/timetable/',
		url: './pages/timetable.html',
		on: {
			pageInit: function (e, page) {
				var newRq = new _fn.doRequest(_fn.successGetTTRQ);
				newRq.dataType = 'json';
				newRq.rType = 'POST';
				newRq.rParams = 'msg=checkintime' +
					'&locationfromid=' + $$("#frmPorts")[0].value +
					'&vesselid=' + $$("#vessels")[0].value +
					'&depdate=' + _fn.frmSysDate($$("#dateFrom")[0].value);
				newRq.sendRequest(false);
				// keepAlive: true
			}
		}

	},
	{
		path: '(.*)',
		url: './pages/404.html'
	}
];

alert("root end"); 