$(function () {
  var dateNow = new Date();
  var yesterYMDdate = dateNow.getFullYear() + '-' + parseInt(dateNow.getMonth() + 1, 10) + '-' + parseInt(dateNow.getDate() - 1, 10);
  var todayYMDdate = dateNow.getFullYear() + '-' + parseInt(dateNow.getMonth() + 1, 10) + '-' + dateNow.getDate();
  // 申请数据
  var applyOne = {
    time: "",
    name: "",
    document: [],
    idNumber: "",
    email: "",
    phoneNumber: "",
    useTo: "",
    joinTime: "",
    leaveTime: "",
    company: ""
  }
  // 初始化入职日期输入框
  var calendar = new LCalendar();
  calendar.init({
    'trigger': '#inputEntryJobTime',
    'type': 'date',
    'minDate': '1970-1-1',
    'maxDate': yesterYMDdate
  });

  //监听入职日期输入框，有输入则初始化离职输入框
  $("#inputEntryJobTime").on("input", function () {
    // console.log($(this).val())
    setEndDate($(this).val())
  })

  // 初始化离职输入框
  function setEndDate(start) {
    calendar.init({
      'trigger': '#inputLeaveJobTime',
      'type': 'date',
      'minDate': start,
      'maxDate': todayYMDdate
    });
  }
  //上一步按钮
  $("#backStep").on('touchstart', function () {
    if ($(this)[0].dataset.step == "infoFill") {
      $("#dateChoseMain").show();
      $("#fillInfo").hide();
      $("#backStep").addClass("visibility-hidden");
      $("#backStep")[0].dataset.step = "choseDate";
    } else if ($(this)[0].dataset.step == "confirm") {
      $("#fillInfo").show();
      $("#confirmInfo").hide();
      $("#backStep").removeClass("visibility-hidden");
      $("#backStep")[0].dataset.step = "infoFill";
    }
  })

  setTimeout(function () {
    window.scrollTo(0, 0);
  }, 200);
  //获取可预约时间
  function getDateData() {
    $("#choseDateUl").html("<i class='iconfont icon-jiazai rotations'></i>")
    $.ajax({
      type: 'GET',
      url: 'https://www.easy-mock.com/mock/599e32d8059b9c566dcdc9ca/netRe/timeList',
      dataType: 'json',
      success: function (data) {
        renderDateChose(data)
        $("#choseTimeUl .rotationsbtn").hide();
        $("#choseTimeUl li").show();
      },
      error: function (xhr, type) {
        alert('Ajax error!')
      }
    })
  }

  //获取日期数据
  getDateData();

  //渲染可预约时间
  function renderDateChose(data) {
    var dateHTML = "";
    var initNum = 1;
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        // console.log(key, data[key]);
        // console.log(parseInt(key.slice(-2),10));
        var monthStr = parseInt(key.slice(4, 6), 10) + "月";
        var dateStr = parseInt(key.slice(-2), 10)
        var gray = data[key] > 2 ? " reservation-full" : ""
        dateHTML += "<li class='chose-date-li" + gray + "' data-date='" + key + "' data-status='" + data[key] + "'>" +
          "<div><p class='this-month'>" + monthStr + "</p>" +
          "<p class='this-date'>" + dateStr + "</p>" +
          "<p class='this-week'>" + getWeek(key, initNum) + "</p>" +
          "<i class='iconfont icon-xuanze chose-date-i-sign'></i>" +
          "</div><span class='iconfont icon-dian-copy'></span></li>"
      }
      initNum++;
    }
    $("#choseDateUl").html(dateHTML)

    //监听日期点击
    $("#choseDateUl").on("touchstart","li", function () {
      //重置上下午时间
      applyOne.time = "";
      //status  0:全天空 1：上午空  2：下午空 3：全天满
      var status = $(this)[0].dataset.status
      //点击的日期
      var date = $(this)[0].dataset.date
      //兄弟节点
      var siblings = $(this)[0].parentNode.childNodes;

      //3：全天满 如果状态不为3添加选中样式
      if (status != 3) {
        for (var j = 0; j < siblings.length; j++) {
          siblings[j].classList.remove("chose-this-date")
        }
        $(this).addClass("chose-this-date");
        $("#nextStepDate").removeClass("next-step-go").off("touchstart");
        //设置日期
        applyOne.date = date;
      }
      if (status == 0) {
        //0:全天空 
        $("#choseMorning").removeClass("reservation-time-full").removeClass("chose-this-time");
        $("#choseAfternon").removeClass("reservation-time-full").removeClass("chose-this-time");
        $("#choseMorning").on("touchstart", choseTime);
        $("#choseAfternon").on("touchstart", choseTime);
      } else if (status == 1) {
        // 1：上午空
        $("#choseMorning").removeClass("reservation-time-full").removeClass("chose-this-time");
        $("#choseAfternon").removeClass("chose-this-time").addClass("reservation-time-full");
        $("#choseMorning").on("touchstart", choseTime)
        $("#choseAfternon").off("touchstart")
      } else if (status == 2) {
        // 2：下午空
        $("#choseMorning").removeClass("chose-this-time").addClass("reservation-time-full");
        $("#choseAfternon").removeClass("reservation-time-full").removeClass("chose-this-time");
        $("#choseAfternon").on("touchstart", choseTime)
        $("#choseMorning").off("touchstart")
      }
    })
  }


  //选择时间，给下一步按钮添加事件和样式
  function choseTime() {
    $("#choseMorning").removeClass("chose-this-time")
    $("#choseAfternon").removeClass("chose-this-time")
    applyOne.time = $(this)[0].dataset.time
    $(this).addClass("chose-this-time");
    // console.log(applyOne)
    $("#nextStepDate").addClass("next-step-go")
    $("#nextStepDate").on("touchstart", nextStepToFillInfo)
  }
  //获取周几
  function getWeek(date, num) {
    var week = new Date(date.slice(0, 4), date.slice(4, 6) - 1, date.slice(6));
    var _week = ["周日", "周一", "周二", "周三", "周四", "周五"];
    if (num == 1) return "今天";
    if (num == 2) return "最近";
    return _week[week.getDay()];
  }

  //下一步到填充资料
  function nextStepToFillInfo() {
    $("#dateChoseMain").hide();
    $("#fillInfo").show();
    $("#backStep").removeClass("visibility-hidden");
    $("#backStep")[0].dataset.step = "infoFill";

    $('#inputEmployer').css('pointer-events', 'none');

    setTimeout(function () {
      $('#inputEmployer').css('pointer-events', 'auto');
    }, 400);

    window.scrollTo(0, 0);
  }


  // chose-date-end

  //fill information start
  //姓名 检查
  $("#inputName").on('input', function () {
    $(this).css("border", "1px solid #f00")
    var value = $(this).val();
    if ((/[\u4E00-\u9FA5]{2,5}(?:·[\u4E00-\u9FA5]{2,5})*/).test(value)) {
      $(this).css("border", "1px solid #6ec4e8")
      applyOne.name = value;
    } else {
      $(this).css("border", "1px solid #f00")
      applyOne.name = "";
    }
  })

  //手机号码检查
  $("#inputPhoneNum").on('input', function () {
    var value = $(this).val();
    if ((/^1[34578]\d{9}$/).test(value)) {
      $(this).css("border", "1px solid #6ec4e8")
      applyOne.phoneNumber = value;
    } else {
      $(this).css("border", "1px solid #f00")
      applyOne.phoneNumber = "";
    }
  })
  //邮箱检查
  $("#inputMail").on('input', function () {
    var value = $(this).val();
    if ((/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/).test(value)) {
      $(this).css("border", "1px solid #6ec4e8")
      applyOne.email = value;
    } else {
      $(this).css("border", "1px solid #f00")
      applyOne.email = "";
    }
  })
  //身份证检查
  $("#inputId").on('input', function () {
    var value = $(this).val();
    if ((/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/).test(value)) {
      $(this).css("border", "1px solid #6ec4e8")
      applyOne.idNumber = value;
    } else {
      $(this).css("border", "1px solid #f00")
      applyOne.idNumber = "";
    }
  })

  //用途检查
  $("#inputUseto").on('input', function () {
    var value = $(this).val();
    if (value.length > 1) {
      $(this).css("border", "1px solid #6ec4e8")
      applyOne.useTo = value;
    } else {
      $(this).css("border", "1px solid #f00")
      applyOne.useTo = "";
    }
  })

  //工作单位检查
  $("#inputEmployer").on('input', function () {
    var value = $(this).val();
    if (value.length > 2) {
      $(this).css("border", "1px solid #6ec4e8")
      applyOne.company = value;
    } else {
      $(this).css("border", "1px solid #f00")
      applyOne.company = "";
    }
  })

  // 信息填写完毕点击下一步
  $("#nextStepConfirm").on("touchstart", function () {
    var docu = [];
    var obj = document.getElementsByName("filescata")
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].checked) docu.push(parseInt(obj[i].value, 10)); //如果选中，将value添加到变量s中 
    }
    //选择证明为0个
    applyOne.document = docu

    if (docu.length == 0) {
      $(".id-prove span").css("border", "1px solid #f00")
      return
    }
    if (applyOne.name == "") {
      $("#inputName").css("border", "1px solid #f00")
      return
    }
    if (applyOne.phoneNumber == "") {
      $("#inputPhoneNum").css("border", "1px solid #f00")
      return
    }
    if (applyOne.idNumber == "") {
      $("#inputId").css("border", "1px solid #f00")
      return
    }
    if (applyOne.email == "") {
      $("#inputMail").css("border", "1px solid #f00")
      return
    }
    if (applyOne.useTo == "") {
      $("#inputUseto").css("border", "1px solid #f00")
      return
    }
    if (applyOne.company == "") {
      $("#inputEmployer").css("border", "1px solid #f00")
      return
    }

    //填充入职时间
    if ($("#inputEntryJobTime").val().trim() != "") {
      $("#inputEntryJobTime").css("border", "1px solid #6ec4e8")
      applyOne.joinTime = $("#inputEntryJobTime").val().trim()
    } else {
      $("#inputEntryJobTime").css("border", "1px solid #f00")
      return
    }
    //填充离职时间
    if ($("#inputLeaveJobTime").val().trim() != "") {
      $("#inputLeaveJobTime").css("border", "1px solid #6ec4e8")
      applyOne.leaveTime = $("#inputLeaveJobTime").val().trim()
    } else {
      $("#inputLeaveJobTime").css("border", "1px solid #f00")
      return
    }

    $("#fillInfo").hide();
    $("#confirmInfo").show();
    $("#backStep").removeClass("visibility-hidden");
    $("#backStep")[0].dataset.step = "confirm";
    window.scrollTo(0, 0);
    //检查填写资料
    infoCheck()
  })

  //检查填写资料
  function infoCheck() {
    // 填充证明
    for (var key in applyOne.document) {
      var element = applyOne.document[key];
      if (element == 1) {
        $("#workProveIcon").show()
      } else if (element == 2) {
        $("#leaveProveIcon").show()
      } else if (element == 3) {
        $("#incomeProveIcon").show()
      }
    }

    // 填充日期
    var dateStr = applyOne.date.slice(0, 4) + "年" + applyOne.date.slice(4, 6) + "月" + applyOne.date.slice(6, 8) + "日";
    $("#confirmDate").html(dateStr + " (" + getWeek(applyOne.date, 3) + ") " + (applyOne.time == 1 ? "09:00" : "14:00"));

    //填充姓名
    $("#confirmName").html(applyOne.name)
    //填充姓名
    $("#confirmPhone").html(applyOne.phoneNumber)
    //填充姓名
    $("#confirmEmail").html(applyOne.email)
    //绑定提交事件
    $("#submitData").on("touchstart", confirmSubmit)
  }

  function confirmSubmit() {
    //提交
    $("#conCover").show();
    $("#submitLoading").show();
    $.ajax({
      type: 'get',
      url: 'https://www.easy-mock.com/mock/599e32d8059b9c566dcdc9ca/netRe/getData',
      dataType: 'json',
      data: applyOne,
      success: function (data) {
        var congraTetx = "开具";
        for (var key in applyOne.document) {
          var element = applyOne.document[key];
          if (element == 1) {
            congraTetx += "工作证明、"
          } else if (element == 2) {
            congraTetx += "离职证明、"
          } else if (element == 3) {
            congraTetx += "收入证明、"
          }
        }
        $("#congratDoFor").html(congraTetx.slice(0, congraTetx.length - 1))
        $("#congratBlock").show();
        console.log(data);
        //绑定返回主页事件
        $("#backHomeBtn").on("touchstart", function () {
          setTimeout(function () {
            location.reload(true);
          }, 200);
        });
      },
      error: function (xhr, type) {
        $("#conCover").hide();
        $("#submitLoading").hide();
        alert("提交失败，请检查输入信息");
      }
    })
  }



})