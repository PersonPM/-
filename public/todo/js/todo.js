// 创建一个空的数组
let taskAry = [];
//获取到ul
let taskBox = $('.todo-list');
//获取到增加数据的input文本框
let taskIpn = $(".new-todo");

$(document).on('ajaxStart',function() {
    NProgress.start();  // 进度条开始运动 
})

$(document).on('ajaxComplete',function() {
   NProgress.done();   // 进度条结束运动
})



//发送ajax 请求
$.ajax({
    type: "get",
    url: "/todo/task",
    success: function (response) {
        taskAry = response;
        render();
        countNum();
    }
});

//实现添加功能
taskIpn.on('keyup', function (event) {
    //先判断用户是否按下了回车键
    if (event.keyCode == 13) {
        //先获取到文本框taskIpn 的value值
        let $val = $(this).val();
        $.ajax({
            type: "post",
            url: "/todo/addTask",
            data: JSON.stringify({
                title: $val
            }),
            contentType: "application/json",
            success: function (response) {
                taskAry.push(response);
                render();
        countNum();

            }
        });
        $(this).val('');
    }
});


//实现删除功能
taskBox.on('click','.destroy',function() {
    //先获取到要删除的数据的id 属性
    let id = $(this).attr('data-id');
    // console.log(id);
    $.ajax({
        type: "get",
        url: "/todo/deleteTask",
        data: { _id: id},
        success: function (response) {
            //通过这个id 属性删除掉当前属性所在的数据
            let index = taskAry.findIndex(item => item._id==id);
            taskAry.splice(index,1);
            render(); 
        countNum();

        }
    });
})

//实现修改功能
taskBox.on('dblclick','label' ,function() {
    //双击显示数据框
    $(this).parents('li').addClass('editing');
    //将原来的内容赋值给数据框并获取焦点
    $(this).parent().siblings('input').val($(this).text()).focus();
})

//注册一个光标离开事件 光标离开则修改完成
taskBox.on('blur','.edit',function() {
    //获取到当前任务最新的值
    let newVal = $(this).val();
    //获取到当前input框的id
    let id = $(this).siblings().find('button').attr('data-id');
    $.ajax({
        type: "post",
        url: "/todo/modifyTask",
        data: JSON.stringify({
            _id:id,
            title: newVal
        }),
        contentType: "application/json",
        success: function (response) {
           let obj= taskAry.find(item=>item._id==id);
          obj.title = response.title;
          render();
        countNum();

        }
    });
    $(this).parent().removeClass('editing');
    
})


//注册一个change事件 改变复选框的状态同时改变复选框所在li标签的样式
taskBox.on('change','.toggle',function() {
    //先获取到当前input框的选中状态为true 或者false
    let status = $(this).prop('checked');
    //获取当当前的id值
    let id = $(this).siblings('button').attr('data-id');
    $.ajax({
        type: "post",
        url: "/todo/modifyTask",
        data: JSON.stringify({
            _id:id,
            completed: status
        }),
        contentType:'application/json',
        success: function (response) {
            // console.log(response);
            
            let newCon = taskAry.find(item => item._id == response._id);
            // console.log(taskAry);
            // return;
            newCon.completed = response.completed;
            render();
        countNum();

        }
    });
});

// 1. 为active按钮添加点击事件
// 3. 使用模板引擎将过滤结果显示在页面中
$('.active').on('click',function() {
    // 2. 从任务列表数组中将未完成任务过滤出来
    let newArray = taskAry.filter(item => item.completed == false);
    // console.log(newArray);
    let html = template('tpl',{taskData: newArray});
    taskBox.html(html);
    // render();

})

//封装一个显示当前正在进行的任务的数量的函数
function countNum() {
    //先定义一个变量
    let count = 0;
    //查找到当前未完成的任务的数量
    let newAry = taskAry.filter(item => item.completed == false);
    // console.log(newAry)
    $('.count').html(newAry.length);
}

//封装一个render函数用来渲染页面
function render() {
    let html = template('tpl', {
        taskData: taskAry
    });
    taskBox.html(html);
}

