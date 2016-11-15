/**
 * Created by strawmanbobi
 * 2015-07-30.
 */

var LS_KEY_ID = "user_name";
var LS_KEY_TOKEN = "token";
var id = "";
var token = "";
var client = null;

var RADIO_TYPE_IRDA = 0;
var RADIO_TYPE_BLE_CENTRAL = 1;
var RADIO_TYPE_BLE_HID = 2;
var RADIO_TYPE_WLAN = 3;
var RADIO_TYPE_ZIGBEE = 4;
var RADIO_TYPE_433M = 5;

var CATEGORY_AC = 1;
var CATEGORY_TV = 2;
var CATEGORY_STB = 3;
var CATEGORY_NW = 4;
var CATEGORY_IPTV = 5;
var CATEGORY_DVD = 6;
var CATEGORY_FAN = 7;
var CATEGORY_PROJECTOR = 8;
var CATEGORY_STEREO = 9;
var CATEGORY_LIGHT_BULB = 10;
var CATEGORY_BSTB = 11;
var CATEGORY_CLEANING_ROBOT = 12;
var CATEGORY_AIR_CLEANER = 13;

var currentRadioType = 0;
var currentSubCate = 1;
var currentProtocol = null;
var currentProtocolType = 1;
var currentCategory = {
    id: 1,
    name: '空调'
};

var currentFilterCategory = {
    id: 1,
    name: '空调'
};

var currentBrand = null;
var currentFilterBrand = null;
var currentProvince = {
    code: '110000',
    name: '北京市'
};
var currentFilterProvince = {
    code: '110000',
    name: '北京市'
};
var currentCity = {
    code: '110100',
    name: '北京市'
};
var currentFilterCity = {
    code: '110100',
    name: '北京市'
};

var g_categories = [];
var g_brands = [];
var g_cities = [];
var g_stbOperators = [];

var currentOperator = null;

var selectedRemote = null;
var pass = 0;

var brandsToPublish = [];
var remoteIndexesToPublish = [];

///////////////////////////// Initialization /////////////////////////////

$("#menu_toggle").click(function(e) {
    if (null != client && client == 'console') {
        return;
    }
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

$(document).ready(function() {
    // get saved user id and token first
    id = localStorage.getItem(LS_KEY_ID);
    token = localStorage.getItem(LS_KEY_TOKEN);
    client = getParameter('client');
    if (null != client && client == 'console') {
        hideSidebar();
    }

    showMenu(id, token, "remote");
    initializeSelectors();

    $("#remote_file").change(function() {
        var filePath = $(this).val();
        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1, filePath.lastIndexOf('.'));
        $("#remote_name").val(fileName);
    });

    $("#protocol_file").change(function() {
        var filePath = $(this).val();
        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1, filePath.lastIndexOf('.'));
        $("#protocol_name_b").val(fileName);
    });

    $("#protector_selection").multiselect({
        buttonWidth: '100%'
    });

    $("#protector_selection_b").multiselect({
        buttonWidth: '100%'
    });
});

function initializeSelectors() {
    initializeFilterCategories();
    initializeFilterBrands();
    initializeFilterProvince();

    initializeProtocols();
    initializeRadioTypes();
    initializeCategories();
    initializeProvince();
}

function loadRemoteList(isSearch, remoteMap) {
    var url;

    if (isSearch && remoteMap) {
        url = "/irext/int/search_remote_indexes?remote_map="+remoteMap+"&from=0&count=2000&id="+id+"&token="+token;
    } else {
        if(currentFilterCategory.id == 3) {
            url = "/irext/int/list_remote_indexes?category_id="+currentFilterCategory.id+"&city_code="+currentFilterCity.code+
                "&from=0&count=100&id="+id+"&token="+token;
        } else {
            url = "/irext/int/list_remote_indexes?category_id="+currentFilterCategory.id+"&brand_id="+currentFilterBrand.id+
                "&from=0&count=100&id="+id+"&token="+token;
        }
    }

    $('#remote_table_container').empty();
    $('#remote_table_container').append('<table id="remote_table" data-row-style="rowStyle"></table>');

    $('#remote_table').bootstrapTable({
        method: 'get',
        url: url,
        cache: false,
        height: 600,
        striped: true,
        pagination: true,
        pageSize: 50,
        pageList: [10, 25, 50, 100, 200],
        search: true,
        showColumns: true,
        showRefresh: false,
        minimumCountColumns: 2,
        clickToSelect: true,
        singleSelect: true,
        showExport: true,
        exportDataType: 'all',
        exportTypes: ['txt', 'sql', 'excel'],
        columns: [{
            field: '',
            checkbox: true
        }, {
            field: 'category_name',
            title: '种类',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'brand_name',
            title: '品牌',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'city_name',
            title: '城市',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'operator_name',
            title: '运营商',
            align: 'left',
            valign: 'middle',
            sortable: true,
            visible: false
        }, {
            field: 'priority',
            title: '优先',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'protocol',
            title: '协议',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'remote',
            title: '遥控码',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'status',
            title: '状态',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true
        }, {
            field: 'radio_type',
            title: '无线类型',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true,
            visible: true
        }, {
            field: 'kk_remote_number',
            title: '编号',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true,
            visible: false
        }, {
            field: 'input_source',
            title: '来源',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true,
            visible: true
        }, {
            field: 'applied_remote_version',
            title: '遥控适用',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true,
            visible: false
        }, {
            field: 'banned_remote_version',
            title: '遥控禁用',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true,
            visible: false
        }, {
            field: 'applied_device_version',
            title: '底座适用',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true,
            visible: false
        }, {
            field: 'banned_device_version',
            title: '底座禁用',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true,
            visible: false
        }, {
            field: 'protector',
            title: '地区保护标识',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true,
            visible: true
        }]
    }).on('check.bs.table', function (e, row) {
        onSelectRemote(row);
    }).on('uncheck.bs.table', function (e, row) {
        selectedRemote = null;
    }).on('load-success.bs.table', function (e, data) {
        var i = 0;
        console.log('size of data loaded = ' + data.length);
        for (i = 0; i < data.length; i++) {
            if(data[i].status == '1') {
                data[i].status = '已发布';
            } else if(data[i].status == '2') {
                data[i].status = '待验证';
            } else if(data[i].status == '3') {
                data[i].status = '通过';
            } else if(data[i].status == '4') {
                data[i].status = '未通过';
            } else if(data[i].status == '5') {
                data[i].status = '重复'
            }

            if(data[i].radio_type == '0') {
                data[i].radio_type = '红外';
            } else if(data[i].radio_type == '1') {
                data[i].radio_type = '蓝牙主机';
            } else if(data[i].radio_type == '2') {
                data[i].radio_type = '蓝牙HID';
            } else if(data[i].radio_type == '3') {
                data[i].radio_type = 'Wi-Fi';
            } else if(data[i].radio_type == '4') {
                data[i].radio_type = 'Zigbee'
            } else if(data[i].radio_type == '5') {
                data[i].radio_type = '433M'
            }

            $('#remote_table').bootstrapTable('updateRow', {
                index: i,
                row: {
                    status: data[i].status
                }
            });
        }
    });
    selectedRemote = null;
}

function rowStyle(row, index) {
    var style = null;
    // console.log(JSON.stringify(row));
    if (row.status == '已发布') {
        style = {
            classes: 'default'
        };
    } else if (row.status == '待验证') {
        style = {
            classes: 'info'
        };
    } else if (row.status == '通过') {
        style = {
            classes: 'success'
        };
    } else if (row.status == '未通过') {
        style = {
            classes: 'danger'
        };
    } else if (row.status == '重复') {
        style = {
            classes: 'danger'
        };
    } else {
        style = {
            classes: ''
        }
    }
    return style;
}

function createRemote() {
    var remoteName = $('#remote_name').val();
    var remoteFile = $('#remote_file').val();
    var radioType = $('#radio_type').val();
    var subCate = $('#sub_cate').val();
    var bleMode = $('#ble_mode').val();
    var priority = $('#spinner').val();
    var remoteAppliedVersion = $('#remote_applied_version').val();
    var remoteBannedVersion = $('#remote_banned_version').val();
    var deviceAppliedVersion = $('#device_applied_version').val();
    var deviceBannedVersion = $('#device_banned_version').val();
    var districtProtect = $('#protector_selection').val();
    var protector = "";

    var kkRemoteNumber = $('#kk_remote_number').val();
    var versionPatten = new RegExp('[0-9]\\.[0-9]\\.[0-9]');

    if (!remoteName || "" == remoteName) {
        popUpHintDialog("请输入遥控器名称");
        return;
    }

    if (!remoteFile || "" == remoteFile) {
        popUpHintDialog("请输入遥控器XML文件");
        return;
    }

    if (false == versionPatten.test(remoteAppliedVersion) ||
        false == versionPatten.test(remoteBannedVersion)) {
        popUpHintDialog("版本号格式错误");
        return;
    }

    if (null == districtProtect || districtProtect.length == 0) {
        popUpHintDialog("请选中保护区域");
        return;
    }

    for (var i = 0; i < districtProtect.length; i++) {
        protector += districtProtect[i];
    }

    $("#protector").val(protector);

    console.log("categoryID = " + currentCategory.id + ", categoryName = " + currentCategory.name + ", " + currentCategory.name_en +
        ", " + currentCategory.name_tw + ", brandID = " + currentBrand.id +
        ", brandName = " + currentBrand.name + ", " + currentBrand.name_en + ", " + currentBrand.name_tw +
        ", cityCode = " + currentCity.code + ", cityName = " + currentCity.name + ", " + currentCity.name_tw +
        ", opID = " + currentOperator.operator_id + ", opName = " + currentOperator.operator_name + ", " + currentOperator.operator_name_tw +
        ", protocolID = " + currentProtocol.id + ", radioType = " + radioType + ", subCate = " + subCate + ", bleMode = " + bleMode +
        ", protocolName = " + currentProtocol.name + ", remoteName = " + remoteName + ", remoteFile = " + remoteFile +
        ", kkremoteNumber = " + kkRemoteNumber + ", remoteAppliedVersion = " + remoteAppliedVersion + ", " +
        " remoteBannedVersion = " + remoteBannedVersion + ", deviceAppliedVersion = " + deviceAppliedVersion +
        " deviceBannedVersion = " + deviceBannedVersion + ", protector = " + protector);

    var form = $('#remote_upload_form');
    form.attr('action', '/irext/int/create_remote_index?id='+id+"&token="+token);
    //form.attr('method', 'post');
    //form.attr('encoding', 'multipart/form-data');
    //form.attr('enctype', 'multipart/form-data');

    // set multipart-form parameters
    $('#category_name').val(currentCategory.name);
    $('#brand_name').val(currentBrand.name);
    $('#city_name').val(currentCity.name);
    $('#operator_name').val(currentOperator.operator_name);
    $('#protocol_name').val(currentProtocol.name);

    $('#category_name_tw').val(currentCategory.name_tw);
    $('#brand_name_tw').val(currentBrand.name_tw);
    $('#city_name_tw').val(currentCity.name_tw);
    $('#operator_name_tw').val(currentOperator.name_tw);

    form.submit();
    $("#create_remote_dialog").modal('hide');
    $("#uploading_dialog").modal();
}

function deleteRemote() {
    if(null == selectedRemote) {
        popUpHintDialog('请先选中一个遥控器索引');
        return;
    }
    var remoteToDelete = selectedRemote;
    switch (remoteToDelete.status) {
        case '已发布':
            remoteToDelete.status = 1;
            break;
        case '待验证':
            remoteToDelete.status = 2;
            break;
        case '通过':
            remoteToDelete.status = 3;
            break;
        case '不通过':
            remoteToDelete.status = 4;
            break;
        case '重复':
            remoteToDelete.status = 5;
            break;
        default:
            remoteToDelete.status = 0;
            break;
    }

    $.ajax({
        url: "/irext/int/delete_remote_index?id="+id+"&token="+token,
        type: "POST",
        dataType: "json",
        data: remoteToDelete,
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                $("#delete_confirm_dialog").modal('hide');
                popUpHintDialog("已成功删除遥控索引");
                loadRemoteList();
                $("#delete_confirm_dialog").modal("hide");
            } else {
                $("#delete_confirm_dialog").modal('hide');
                popUpHintDialog("删除遥控索引操作失败");
                $("#delete_confirm_dialog").modal("hide");
            }
        },
        error: function () {
            $("#delete_confirm_dialog").modal('hide');
            popUpHintDialog("删除遥控索引操作失败");
            $("#delete_confirm_dialog").modal("hide");
        }
    });
}

function fallbackRemote() {
    if(null == selectedRemote) {
        popUpHintDialog('请先选中一个遥控器索引');
        return;
    }
    var remoteToFallback = selectedRemote;
    switch (remoteToFallback.status) {
        case '已发布':
            remoteToFallback.status = 1;
            break;
        case '待验证':
            remoteToFallback.status = 2;
            break;
        case '通过':
            remoteToFallback.status = 3;
            break;
        case '不通过':
            remoteToFallback.status = 4;
            break;
        case '重复':
            remoteToFallback.status = 5;
            break;
        default:
            remoteToFallback.status = 0;
            break;
    }
    $.ajax({
        url: "/irext/int/fallback_remote_index?id="+id+"&token="+token,
        type: "POST",
        dataType: "json",
        data: remoteToFallback,
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                $("#verify_confirm_dialog").modal("hide");
                popUpHintDialog("已成功回退遥控索引");
                loadRemoteList();
            } else {
                $("#verify_confirm_dialog").modal("hide");
                popUpHintDialog("回退遥控索引操作失败");
            }
        },
        error: function () {
            $("#verify_confirm_dialog").modal("hide");
            popUpHintDialog("回退遥控索引操作失败");
        }
    });
}

function searchRemote() {
    var remoteMap = $("#remote_map").val();

    if (null != remoteMap && "" != remoteMap && remoteMap.length > 5) {
        loadRemoteList(true, remoteMap);
        $("#search_dialog").modal('hide');
    } else {
        popUpHintDialog("编码映射格式不正确");
    }
}

function verifyRemote() {
    if(null == selectedRemote) {
        popUpHintDialog('请先选中一个遥控器索引');
        return;
    }
    var remoteToVerify = selectedRemote;
    switch (remoteToVerify.status) {
        case '已发布':
            remoteToVerify.status = 1;
            break;
        case '待验证':
            remoteToVerify.status = 2;
            break;
        case '通过':
            remoteToVerify.status = 3;
            break;
        case '不通过':
            remoteToVerify.status = 4;
            break;
        case '重复':
            remoteToVerify.status = 5;
            break;
        default:
            remoteToVerify.status = 0;
            break;
    }
    $.ajax({
        url: "/irext/int/verify_remote_index?pass="+pass+"&id="+id+"&token="+token,
        type: "POST",
        dataType: "json",
        data: remoteToVerify,
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                $("#verify_confirm_dialog").modal("hide");
                popUpHintDialog("已成功更新遥控索引");
                loadRemoteList();
            } else {
                $("#verify_confirm_dialog").modal("hide");
                popUpHintDialog("更新遥控索引操作失败");
            }
        },
        error: function () {
            $("#verify_confirm_dialog").modal("hide");
            popUpHintDialog("更新遥控索引操作失败");
        }
    });
}

function publishUnpublished() {
    var date = formatDate(new Date(), "yyyy-MM-dd");
    JSONToCSVConvertor(brandsToPublish, "Unpublihshed Brand " + date, true);
    JSONToCSVConvertor(remoteIndexesToPublish, "Unpublihshed Remote " + date, true);
}

function publishBrands() {
    $("#publish_hint").empty();
    $("#publish_hint").append('正在发布新增品牌，请稍候...');
    $.ajax({
        url: "/irext/int/publish_brands?id="+id+"&token="+token,
        type: "POST",
        timeout: 200000,
        success: function (response) {
            if(response.status.code == 0) {
                $("#publish_hint").empty();
                $("#publish_hint").append('正在发布新增遥控码，请稍候...');
                publishRemoteIndexes();
                // loadRemoteList();
                // $("#publish_dialog").modal("hide");
            } else {
                popUpHintDialog("发布遥控码表操作失败");
                $("#publish_dialog").modal("hide");
            }
        },
        error: function () {
            popUpHintDialog("发布遥控码表操作失败");
            $("#publish_dialog").modal("hide");
        }
    });
}

function publishRemoteIndexes() {
    $.ajax({
        url: "/irext/int/publish_remote_index?id="+id+"&token="+token,
        type: "POST",
        timeout: 200000,
        success: function (response) {
            if(response.status.code == 0) {
                $("#publish_dialog").modal('hide');
                popUpHintDialog("已成功发布遥控码表");
                loadRemoteList();
            } else {
                $("#publish_dialog").modal('hide');
                popUpHintDialog("发布遥控码表操作失败");
            }
        },
        error: function () {
            $("#publish_dialog").modal('hide');
            popUpHintDialog("发布遥控码表操作失败");
        }
    });
}

function createBrand() {
    var newName = $("#brand_name_b").val();
    var newNameEn = $("#brand_name_en_b").val();
    var newNameTw = $("#brand_name_tw_b").val();
    var brandPriority = $("#brand_priority").val();
    var districtProtect = $("#protector_selection_b").val();
    var protector = "";

    if (null == newName || "" == newName ||
        null == newNameEn || "" == newNameEn ||
        null == newNameTw) {
        popUpHintDialog("请填写名称");
        return;
    }

    if (isBrandExists(newName)) {
        popUpHintDialog("这个品牌已经存在");
        return;
    }

    if (null == districtProtect || districtProtect.length == 0) {
        popUpHintDialog("请选中保护区域");
        return;
    }
    for (var i = 0; i < districtProtect.length; i++) {
        protector += districtProtect[i];
    }

    $.ajax({
        url: "/irext/int/create_brand?id="+id+"&token="+token,
        type: "POST",
        data: {
            category_id : currentCategory.id,
            category_name : currentCategory.name,
            name : newName,
            name_en : newNameEn,
            name_tw : newNameTw,
            priority: brandPriority,
            protector: protector
        },
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                $("#create_brand_dialog").modal("hide");
                popUpHintDialog("已成功添加品牌");
                initializeBrands();
            } else {
                $("#create_brand_dialog").modal("hide");
                popUpHintDialog("品牌添加的操作失败");
            }
        },
        error: function () {
            $("#create_brand_dialog").modal("hide");
            popUpHintDialog("品牌添加的操作失败");
        }
    });
}

function createProtocol() {
    var protocolName = $('#protocol_name_b').val();
    var protocolFile = $('#protocol_file').val();
    var protocolType = $('#protocol_type').val();

    if(!protocolName || "" == protocolName) {
        popUpHintDialog("请输入协议名称");
        return;
    }

    if(!protocolFile || "" == protocolFile) {
        popUpHintDialog("请输入协议XML文件");
        return;
    }

    console.log("protocolName = " + protocolName + ", protocolFile = " + protocolFile +
        ", protocolType = " + protocolType);

    var form = $('#protocol_upload_form');
    form.attr('action', '/irext/int/create_protocol?id='+id+"&token="+token);
    //form.attr('method', 'post');
    //form.attr('encoding', 'multipart/form-data');
    //form.attr('enctype', 'multipart/form-data');

    form.submit();
    $("#create_protocol_dialog").modal("hide");
    $("#creating_protocol_dialog").modal();
    initializeProtocols();
}

function createBleTestInfo() {
    var bleRemoteIndexInfo = $("#ble_test_info").val();
    $("#ble_remote_index").val(bleRemoteIndexInfo);
    $("#create_ble_test_dialog").modal("hide");
}

///////////////////////////// Data process /////////////////////////////
function initializeRadioTypes() {
    $('#radio_type').select2({
        placeholder: '选择无线类型'
    });
}

function initializeProtocols() {
    $.ajax({
        url: "/irext/int/list_ir_protocols?from=0&count=200&id="+id+"&token="+token,
        dataType: 'JSON',
        type: 'GET',
        timeout: 20000,
        success: function(response) {
            if(response.status.code == 0) {
                var protocols = response.entity;
                fillProtocolList(protocols);

                if(protocols && protocols.length > 0) {
                    currentProtocol = {
                        id: protocols[0].id,
                        name: protocols[0].name
                    }
                }
            } else {
                console.log('failed to get protocols');
            }
        },
        error: function() {
            console.log('failed to get protocols');
        }
    });
}

function initializeCategories() {
    $.ajax({
        url: "/irext/int/list_categories?from=0&count=200&id="+id+"&token="+token,
        dataType: 'JSON',
        type: 'GET',
        timeout: 20000,
        success: function(response) {
            if(response.status.code == 0) {
                var categories = response.entity;
                g_categories = categories;

                fillCategoryList(categories);

                if(categories && categories.length > 0) {
                    currentCategory = {
                        id: categories[0].id,
                        name: categories[0].name,
                        name_en: categories[0].name_en,
                        name_tw: categories[0].name_tw
                    }
                }

                initializeBrands();
            } else {
                console.log('failed to get categories');
            }
        },
        error: function() {
            console.log('failed to get categories');
        }
    });
}

function initializeProvince() {
    $.ajax({
        url: "/irext/int/list_provinces?id="+id+"&token="+token,
        dataType: 'JSON',
        type: 'GET',
        timeout: 20000,
        success: function(response) {
            if(response.status.code == 0) {
                var provinces = response.entity;
                fillProvinceList(provinces);

                if(provinces && provinces.length > 0) {
                    currentProvince = {
                        code: provinces[0].code,
                        name: provinces[0].name
                    }
                }

                initializeCity();
            } else {
                console.log('failed to get provinces');
            }
        },
        error: function() {
            console.log('failed to get provinces');
        }
    });
}

function initializeCity() {
    var provincePrefix = currentProvince.code.substring(0, 2);
    $.ajax({
        url: "/irext/int/list_cities?province_prefix="+provincePrefix+"&id="+id+"&token="+token,
        dataType: 'JSON',
        type: 'GET',
        timeout: 20000,
        success: function(response) {
            if(response.status.code == 0) {
                var cities = response.entity;
                if (cities && cities.length > 0) {
                    cities.push({
                        code: provincePrefix + '0000',
                        name: '所有城市'
                    });
                } else {
                    cities = [{
                        code: provincePrefix + '0000',
                        name: '所有城市'
                    }];
                }
                g_cities = cities;

                fillCityList(cities);

                if(cities && cities.length > 0) {
                    currentCity = {
                        code: cities[0].code,
                        name: cities[0].name,
                        name_tw: cities[0].name_tw
                    }
                }

                initializeOperator();
            } else {
                console.log('failed to get cities');
            }
        },
        error: function() {
            console.log('failed to get cities');
        }
    });
}

function initializeOperator() {
    $.ajax({
        url: "/irext/int/list_operators?city_code="+currentCity.code+"&from=0&count=50&id="+id+"&token="+token,
        dataType: 'JSON',
        type: 'GET',
        timeout: 20000,
        success: function(response) {
            if(response.status.code == 0) {
                var operators = response.entity;

                if (operators && operators.length > 0) {
                    operators.push({
                        operator_id: '0',
                        operator_name: '--'
                    });
                } else {
                    operators = [{
                        operator_id: '0',
                        operator_name: '--'
                    }];
                }
                g_stbOperators = operators;

                fillOperatorList(operators);

                if(operators && operators.length > 0) {
                    currentOperator = {
                        operator_id: operators[0].operator_id,
                        operator_name: operators[0].operator_name,
                        operator_name_tw: operators[0].operator_name_tw
                    }
                }
            } else {
                console.log('failed to get operators');
            }
        },
        error: function() {
            console.log('failed to get operators');
        }
    });
}

function initializeBrands() {
    $.ajax({
        url: "/irext/int/list_brands?category_id="+currentCategory.id+"&from=0&count=300&id="+id+"&token="+token,
        dataType: 'JSON',
        type: 'GET',
        timeout: 20000,
        success: function(response) {
            if(response.status.code == 0) {
                var brands = response.entity;
                g_brands = brands;

                fillBrandList(brands);

                if(brands && brands.length > 0) {
                    currentBrand = {
                        id: brands[0].id,
                        name: brands[0].name,
                        name_en: brands[0].name_en,
                        name_tw: brands[0].name_tw
                    }
                }
            } else {
                console.log('failed to get brands');
            }
        },
        error: function() {
            console.log('failed to get brands');
        }
    });
}

function initializeFilterCategories() {
    $.ajax({
        url: "/irext/int/list_categories?from=0&count=200&id="+id+"&token="+token,
        dataType: 'JSON',
        type: 'GET',
        timeout: 20000,
        success: function(response) {
            if(response.status.code == 0) {
                var categories = response.entity;
                fillFilterCategoryList(categories);

                if(categories && categories.length > 0) {
                    currentFilterCategory = {
                        id: categories[0].id,
                        name: categories[0].name
                    }
                }

                initializeFilterBrands();
            } else {
                console.log('failed to get categories');
            }
        },
        error: function() {
            console.log('failed to get categories');
        }
    });
}

function initializeFilterProvince() {
    $.ajax({
        url: "/irext/int/list_provinces?id="+id+"&token="+token,
        dataType: 'JSON',
        type: 'GET',
        timeout: 20000,
        success: function(response) {
            if(response.status.code == 0) {
                var provinces = response.entity;
                fillFilterProvinceList(provinces);

                if(provinces && provinces.length > 0) {
                    currentFilterProvince = {
                        code: provinces[0].code,
                        name: provinces[0].name
                    }
                }

                initializeFilterCity();
            } else {
                console.log('failed to get provinces');
            }
        },
        error: function() {
            console.log('failed to get provinces');
        }
    });
}

function initializeFilterCity() {
    var provincePrefix = currentFilterProvince.code.substring(0, 2);
    $.ajax({
        url: "/irext/int/list_cities?province_prefix="+provincePrefix+"&id="+id+"&token="+token,
        dataType: 'JSON',
        type: 'GET',
        timeout: 20000,
        success: function(response) {
            if(response.status.code == 0) {
                var cities = response.entity;
                fillFilterCityList(cities);

                if(cities && cities.length > 0) {
                    currentFilterCity = {
                        code: cities[0].code,
                        name: cities[0].name
                    }
                }
                if(currentFilterCategory.id == 3) {
                    loadRemoteList();
                }
            } else {
                console.log('failed to get cities');
            }
        },
        error: function() {
            console.log('failed to get cities');
        }
    });
}

function initializeFilterBrands() {
    $.ajax({
        url: "/irext/int/list_brands?category_id="+currentFilterCategory.id+"&from=0&count=300&id="+id+"&token="+token,
        dataType: 'JSON',
        type: 'GET',
        timeout: 20000,
        success: function(response) {
            if(response.status.code == 0) {
                var brands = response.entity;
                fillFilterBrandList(brands);

                if(brands && brands.length > 0) {
                    currentFilterBrand = {
                        id: brands[0].id,
                        name: brands[0].name
                    }
                }
                if(currentFilterCategory.id != 3) {
                    console.log("reload remote table after brand is refreshed");
                    loadRemoteList();
                }
            } else {
                console.log('failed to get brands');
            }
        },
        error: function() {
            console.log('failed to get brands');
        }
    });
}

///////////////////////////// Event handler /////////////////////////////

function onCreateRemote() {
    $("#create_remote_dialog").modal();
}

function onProtocolChange() {
    currentProtocol = {
        id: $('#protocol_id').val(),
        name: $('#protocol_id option:selected').text()
    };
}

function onRadioTypeChange() {
    currentRadioType = $('#radio_type').val();
    console.log("update current radio type to " + currentRadioType);

    switch (parseInt(currentRadioType)) {
        case RADIO_TYPE_IRDA:
            showBleRemoteInfo(false);
            switchCategory();
            break;
        case RADIO_TYPE_BLE_CENTRAL:
            showBleRemoteInfo(true);
            showProtocolSelector(false);
            break;
        default:
            break;
    }
}

function onSubCateChange() {
    currentSubCate = $('#sub_cate').val();
    console.log("update current sub category type to " + currentSubCate);
}

function onProtocolTypeChange() {
    currentProtocolType = $('#protocol_type').val();
    console.log("update current protocol type to " + currentProtocolType);
}

function onCategoryChange() {
    /*
    currentCategory = {
        id: $('#category_id').val(),
        name: $('#category_id option:selected').text()
    };
    */
    var currentCategoryID = $('#category_id').val();
    currentCategory = getCategoryByID(currentCategoryID);

    if (currentRadioType == RADIO_TYPE_IRDA) {
        switchCategory();
    } else if (currentRadioType == RADIO_TYPE_BLE_CENTRAL) {
        if (currentCategoryID != CATEGORY_STB) {
            showBrandSelector();
        } else {
            showCitySelector();
        }
    }
}

function switchCategory() {
    switch(parseInt(currentCategory.id)) {
        case CATEGORY_AC:
            showBrandSelector();
            showProtocolSelector(false);
            break;
        case CATEGORY_TV:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_STB:
            showCitySelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_NW:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_IPTV:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_DVD:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_FAN:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_PROJECTOR:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_STEREO:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_LIGHT_BULB:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_BSTB:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_CLEANING_ROBOT:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_AIR_CLEANER:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        default:
            console.log("Wrong category : " + currentCategory.id);
            break;
    }
}

function onBrandChange() {
    /*
    currentBrand = {
        id: $('#brand_id').val(),
        name: $('#brand_id option:selected').text()
    };
    */
    var currentBrandID = $('#brand_id').val();

    currentBrand = getBrandByID(currentBrandID);
}

function onProvinceChange() {
    currentProvince = {
        code: $('#province_id').val(),
        name: $('#province_id option:selected').text()
    };

    initializeCity();
}

function onCityChange() {
    /*
    currentCity = {
        code: $('#city_code').val(),
        name: $('#city_code option:selected').text()
    };
    */
    var currentCityCode = $('#city_code').val();

    currentCity = getCityByCode(currentCityCode);

    if (currentCity.code != '000000') {
        initializeOperator();
    } else {
        // if 'city not specified' is specified, empty operator list
        var operators = [{
            operator_id: '0',
            operator_name: '--'
        }];

        fillOperatorList(operators);

        if(operators && operators.length > 0) {
            currentOperator = {
                operator_id: operators[0].operator_id,
                operator_name: operators[0].operator_name,
                operator_name_tw: operators[0].operator_name_tw
            }
        }
    }
}

function onOperatorChange() {
    /*
    currentOperator = {
        operator_id: $('#operator_id').val(),
        operator_name: $('#operator_id option:selected').text()
    };
    */
    var currentOperatorID = $('#operator_id').val();

    currentOperator = getStbOperatorByID(currentOperatorID);
    console.log("currentOperator = " + JSON.stringify(currentOperator));
}

function discoverCityCode() {
    popUpHintDialog(currentCity.code);
}

function onFilterCategoryChange() {
    currentFilterCategory = {
        id: $('#filter_category_id').val(),
        name: $('#filter_category_id option:selected').text()
    };

    console.log("onFilterCategoryChange, id = " + currentFilterCategory.id);

    switch(parseInt(currentFilterCategory.id)) {
        case CATEGORY_AC:
            showFilterBrandSelector();
            break;
        case CATEGORY_TV:
            showFilterBrandSelector();
            break;
        case CATEGORY_STB:
            showFilterCitySelector();
            break;
        case CATEGORY_NW:
            showFilterBrandSelector();
            break;
        case CATEGORY_IPTV:
            showFilterBrandSelector();
            break;
        case CATEGORY_DVD:
            showFilterBrandSelector();
            break;
        case CATEGORY_FAN:
            showFilterBrandSelector();
            break;
        case CATEGORY_PROJECTOR:
            showFilterBrandSelector();
            break;
        case CATEGORY_STEREO:
            showFilterBrandSelector();
            break;
        case CATEGORY_LIGHT_BULB:
            showFilterBrandSelector();
            break;
        case CATEGORY_BSTB:
            showFilterBrandSelector();
            break;
        case CATEGORY_CLEANING_ROBOT:
            showFilterBrandSelector();
            break;
        case CATEGORY_AIR_CLEANER:
            showFilterBrandSelector();
            break;
        default:
            break;
    }
}

function onFilterBrandChange() {
    currentFilterBrand = {
        id: $('#filter_brand_id').val(),
        name: $('#filter_brand_id option:selected').text()
    };
    loadRemoteList();
}

function onFilterProvinceChange() {
    currentFilterProvince = {
        code: $('#filter_province_id').val(),
        name: $('#filter_province_id option:selected').text()
    };

    initializeFilterCity();
}

function onFilterCityChange() {
    currentFilterCity = {
        code: $('#filter_city_code').val(),
        name: $('#filter_city_code option:selected').text()
    };
    loadRemoteList();
}

function onCreateBrand() {
    $("#category_name_b").val(currentCategory.name);
    $('#create_brand_dialog').modal({backdrop: 'static', keyboard: false});
}

function onCreateProtocol() {
    $('#create_protocol_dialog').modal({backdrop: 'static', keyboard: false});
}

function onBleTestInfo() {
    $('#create_ble_test_dialog').modal({backdrop: 'static', keyboard: false});
}

function onSelectRemote(data) {
    selectedRemote = data;
}

function onFallbackRemote() {
    var hintText = '';
    if (null == selectedRemote) {
        popUpHintDialog('请先选中一个遥控器索引');
        return;
    }

    if (currentFilterCategory.id == 3) {
        hintText = '确认要回退' + selectedRemote.city_name + ' ' + selectedRemote.category_name + ' ' +
            selectedRemote.protocol + ' ' + selectedRemote.remote + ' 吗?';
    } else {
        hintText = '确认要回退' + selectedRemote.brand_name + ' ' + selectedRemote.category_name + ' ' +
            selectedRemote.protocol + ' ' + selectedRemote.remote + ' 吗?';
    }

    $("#fallback_hint").empty();
    $("#fallback_hint").append(hintText);
    $("#fallback_confirm_dialog").modal();
}

function onDeleteRemote() {
    var hintText = '';
    if (null == selectedRemote) {
        popUpHintDialog('请先选中一个遥控器索引');
        return;
    }
    if (currentFilterCategory.id == 3) {
        hintText = '确认要删除' + selectedRemote.city_name + ' ' + selectedRemote.category_name + ' ' +
            selectedRemote.protocol + ' ' + selectedRemote.remote + ' 吗?';
    } else {
        hintText = '确认要删除' + selectedRemote.brand_name + ' ' + selectedRemote.category_name + ' ' +
            selectedRemote.protocol + ' ' + selectedRemote.remote + ' 吗?';
    }

    $("#delete_hint").empty();
    $("#delete_hint").append(hintText);
    $("#delete_confirm_dialog").modal();
}

function onSearchRemote() {
    $('#search_dialog').modal({backdrop: 'static', keyboard: false});
}

function onVerifyRemote(isPass) {
    pass = isPass;
    var hintText = '';
    var passText = 0 == pass ? '通过':'不通过';
    if (null == selectedRemote) {
        popUpHintDialog('请先选中一个遥控器索引');
        return;
    }
    if (currentFilterCategory.id == 3) {
        hintText = '确认要' + passText + selectedRemote.city_name + ' ' + selectedRemote.category_name + ' ' +
            selectedRemote.protocol + ' ' + selectedRemote.remote + ' 吗?';
    } else {
        hintText = '确认要' + passText + selectedRemote.brand_name + ' ' + selectedRemote.category_name + ' ' +
            selectedRemote.protocol + ' ' + selectedRemote.remote + ' 吗?';
    }

    $("#verify_hint").empty();
    $("#verify_hint").append(hintText);
    $("#verify_confirm_dialog").modal();
}

function onPublishRemote() {
    getUnpublishedBrands();
}

function getUnpublishedBrands() {
    $.ajax({
        url: "/irext/int/list_unpublished_brands?id="+id+"&token="+token,
        dataType: 'JSON',
        type: 'GET',
        timeout: 20000,
        success: function(response) {
            if(response.status.code == 0) {
                brandsToPublish = response.entity;
                getUnpublishedRemoteIndexes();
            } else {
                console.log('failed to get unpublished brands');
            }
        },
        error: function() {
            console.log('failed to get unpublished brands');
        }
    });
}

function getUnpublishedRemoteIndexes() {
    $.ajax({
        url: "/irext/int/list_unpublished_remote_indexes?id="+id+"&token="+token,
        dataType: 'JSON',
        type: 'GET',
        timeout: 20000,
        success: function(response) {
            if(response.status.code == 0) {
                remoteIndexesToPublish = response.entity;
                showPublishDialog();
            } else {
                console.log('failed to get unpublished remote indexes');
            }
        },
        error: function() {
            console.log('failed to get unpublished remote indexes');
        }
    });
}

function downloadBin() {
    var downloadURL = "http://irext-code-ii-debug.oss-cn-hangzhou.aliyuncs.com/ykir_";
    if(null == selectedRemote) {
        popUpHintDialog('请先选中一个遥控器索引');
        return;
    }
    downloadURL += selectedRemote.protocol + "_" + selectedRemote.remote + ".bin";

    if (null != client && client == "console") {
        // directly download binary to remote via serial port
    } else {
        window.open(
            downloadURL,
            '_blank'
        );
    }
}

function showPublishDialog() {
    var hintText = '共有 <font color="#FF0000">' + brandsToPublish.length + '</font> 个新增品牌，以及 <font color="#FF0000">' + remoteIndexesToPublish.length + '</font> 个新增遥控码待发布，请确认';
    $("#publish_hint").empty();
    $("#publish_hint").append(hintText);
    $("#publish_dialog").modal();
}

///////////////////////////// UI functions /////////////////////////////
function fillProtocolList(protocols) {
    $('#protocol_id')
        .find('option')
        .remove()
        .end();

    $.each(protocols, function (i, protocol) {
        $('#protocol_id').append($('<option>', {
            value: protocol.id,
            text : protocol.name
        }));
    });

    $('#protocol_id').select2({
        placeholder: 'Select Protocol'
    });
}

function fillCategoryList(categories) {
    $.each(categories, function (i, category) {
        $('#category_id').append($('<option>', {
            value: category.id,
            text : category.name
        }));
    });

    $('#category_id').select2({
        placeholder: '选择类型'
    });
}

function fillProvinceList(provinces) {
    $.each(provinces, function (i, province) {
        $('#province_id').append($('<option>', {
            value: province.code,
            text : province.name
        }));
    });

    $('#province_id').select2({
        placeholder: '选择省份'
    });
}

function fillCityList(cities) {
    $('#city_code')
        .find('option')
        .remove()
        .end();

    $.each(cities, function (i, city) {
        $('#city_code').append($('<option>', {
            value: city.code,
            text : city.name
        }));
    });

    $('#city_code').select2({
        placeholder: '选择城市'
    });
}

function fillOperatorList(operators) {
    $('#operator_id')
        .find('option')
        .remove()
        .end();

    $.each(operators, function (i, operator) {
        $('#operator_id').append($('<option>', {
            value: operator.operator_id,
            text : operator.operator_name
        }));
    });

    $('#operator_id').select2({
        placeholder: '选择SP'
    });
}

function fillBrandList(brands) {
    $('#brand_id')
        .find('option')
        .remove()
        .end();

    $.each(brands, function (i, brand) {
        $('#brand_id').append($('<option>', {
            value: brand.id,
            text : brand.name
        }));
    });

    $('#brand_id').select2({
        placeholder: '选择品牌'
    });
}

function fillFilterCategoryList(categories) {
    $('#filter_category_id')
        .find('option')
        .remove()
        .end();

    $.each(categories, function (i, category) {
        $('#filter_category_id').append($('<option>', {
            value: category.id,
            text : category.name
        }));
    });

    $('#filter_category_id').select2({
        placeholder: '选择品牌'
    });
}

function fillFilterProvinceList(provinces) {
    $('#filter_province_id')
        .find('option')
        .remove()
        .end();

    $.each(provinces, function (i, province) {
        $('#filter_province_id').append($('<option>', {
            value: province.code,
            text : province.name
        }));
    });

    $('#filter_province_id').select2({
        placeholder: '选择省份'
    });
}

function fillFilterCityList(cities) {
    $('#filter_city_code')
        .find('option')
        .remove()
        .end();

    $.each(cities, function (i, city) {
        $('#filter_city_code').append($('<option>', {
            value: city.code,
            text : city.name
        }));
    });

    $('#filter_city_code').select2({
        placeholder: '选择城市'
    });
}

function fillFilterBrandList(brands) {
    $('#filter_brand_id')
        .find('option')
        .remove()
        .end();

    $.each(brands, function (i, brand) {
        $('#filter_brand_id').append($('<option>', {
            value: brand.id,
            text : brand.name
        }));
    });

    $('#filter_brand_id').select2({
        placeholder: '选择品牌'
    });
}

function showCitySelector() {
    $('#brand_panel').hide();
    $('#province_panel').show();
    $('#city_panel').show();
    $('#operator_panel').show();
    initializeProvince();
}

function showBrandSelector() {
    $('#brand_panel').show();
    $('#province_panel').hide();
    $('#city_panel').hide();
    $('#operator_panel').hide();
    initializeBrands();
}

function showFilterCitySelector() {
    $('#filter_brand_panel').hide();
    $('#filter_province_panel').show();
    $('#filter_city_panel').show();
    initializeFilterProvince();
}

function showFilterBrandSelector() {
    $('#filter_brand_panel').show();
    $('#filter_province_panel').hide();
    $('#filter_city_panel').hide();
    initializeFilterBrands();
}

function showProtocolSelector(show) {
    if (true == show) {
        $('.protocol_panel').show();
    } else {
        $('.protocol_panel').hide();
    }
}

function showBleRemoteInfo(show) {
    if (true == show) {
        $('.ble_central_panel').show();
    } else {
        $('.ble_central_panel').hide();
    }
}

function popUpHintDialog(hint) {
    $("#text_hint").empty();
    $("#text_hint").append(hint);
    $("#hint_dialog").modal();
}

///////////////////////////// Utilities /////////////////////////////

function isBrandExists(newBrandName) {
    var i = 0;
    for(i = 0; i < g_brands.length; i++) {
        if(g_brands[i].name == newBrandName) {
            return true;
        }
    }
    return false;
}

function getCategoryByID(categoryID) {
    for(var i = 0; i < g_categories.length; i++) {
        var category = g_categories[i];
        if (category.id == categoryID) {
            return category;
        }
    }
    return null;
}

function getBrandByID(brandID) {
    for(var i = 0; i < g_brands.length; i++) {
        var brand = g_brands[i];
        if (brand.id == brandID) {
            return brand;
        }
    }
    return null;
}

function getCityByCode(cityCode) {
    for(var i = 0; i < g_cities.length; i++) {
        var city = g_cities[i];
        if (city.code == cityCode) {
            return city;
        }
    }
    return null;
}

function getStbOperatorByID(operatorID) {
    for(var i = 0; i < g_stbOperators.length; i++) {
        var operator = g_stbOperators[i];
        if (operator.operator_id == operatorID) {
            return operator;
        }
    }
    return null;
}

function translateToTC(textID, targetTextID) {
    var val = $("#" + textID).val();
    var tcVal = "";
    Chinese.prototype.loaded.onkeep(function() {
        var chinese = new Chinese();
        tcVal = chinese.toTraditional(val);
        if (null == tcVal) {
            tcVal = val;
        }
        $("#" + targetTextID).val(tcVal);
    });
}