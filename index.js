$(function(){
    var httpurl='https://www.xingtu.cn'
    function pl_update_dome(){
       $("body").append("<div id=\"plcontent\">\n" +
           "    <div id=\"plxg-box\">\n" +
           "      <div id=\"plxg-form\">\n" +
           "        <input id=\"pl-input\" type=\"text\">\n" +
           "        <p id=\"pl-subimt\">修改</p>\n" +
           "        <p id=\"pl-gb\">取消</p>\n" +
           "        <p id=\"pl-jz\">正在修改。。</p>\n" +
           "      </div>\n" +
           "    </div>\n" +
           "  </div>");
       $("#plxg").on("click",function (){
           $('#plcontent').show()
       })
       $("#pl-gb").on("click",function (){
           $('#plcontent').hide()
           $('#pl-subimt').show()
       })
       $("#pl-subimt").on('click',function (){
            let value=$('#pl-input').val()
           if(value.length){
               update_url_fn(value)
               $(this).hide()
               $('#pl-gb').hide()
               $('#pl-jz').show()
           }else{
               alert('链接不能为空')
           }

       })
   }
    function getcookie(objname){//获取指定名称的cookie的值
        var arrstr = document.cookie.split("; ");
        for(var i = 0;i < arrstr.length;i ++){
            var temp = arrstr[i].split("=");
            if(temp[0] == objname) return unescape(temp[1]);
        }
    }
    function strpjmd(objdata){
        let arr=Object.keys(objdata)
        let arrstr=arr.map((t)=>{
            var n = objdata[t];
            return function (e){
                return null == e
            }(n) ? "" : t + function (e){
                return ['string','number'].includes(typeof n) ? n : t;
            }(n)
        }).join('')
        return  md5(arrstr+"e39539b8836fb99e1538974d3ac1fe98")
    }
    function daochu_fn(){
        $('#daochu').on('click',function (){
               let num=1;
               let arr=[]
               dcpl_fn(num,arr)
        })
    }
    function dcpl_fn(num,arr){
        let params={
            "limit": "10",
            "page": num,
            "query": { "universal_order_status":1,"system_type":1 },
            "service_method": "DemanderGetUniversalDemandList",
            "service_name": "task.AdStarTaskService",
        }

        params.sign=strpjmd(params)
        params.query='{"universal_order_status":1,"system_type":1}'
        $.ajax({
            type: "get",
            url: httpurl+"/h/api/gateway/handler_get/",
            headers:{
                'Content-Type':'application/json;charset=utf8',
                "x-csrftoken":  getcookie('csrftoken'),
                "x-login-source": 1,
                "x-star-service-method": "DemanderGetUniversalDemandList",
                "x-star-service-name": "task.AdStarOrdersService"},
            data:params,
            dataType:'json',
            success:function (page_data) {
                if(page_data.code===0){
                    let total_page=Math.ceil(page_data.data.pagination.total_count/10)
                    if(num<=total_page){
                        for (let i=0;i<page_data.data.demand_info_list.length;i++){
                            arr.push(page_data.data.demand_info_list[i])
                        }
                        num+=1
                        dcpl_fn(num,arr)
                    }else {
                        let task_num=0;
                        let task_arr=[]
                        getOrderInfo(arr,task_num,task_arr,1,'')
                    }
                }
            },
            error:function (message) {
                alert("提交失败"+JSON.stringify(message));
            }
        });

    }
    function getOrderInfo(arr,num,task_arr,type,val){
        if(arr[num]){
            $.ajax({
                url: httpurl+'/v/api/order/detail/?order_id='+arr[num].order_info_list[0].order_info.id,
                type:'GET',
                headers:{
                    "Accept": "application/json, text/plain, */*",
                    "X-CSRFToken":  getcookie('csrftoken'),
                    "x-login-source": 1,
                },
                dataType:'json',
                success:function(task_info_data){
                    if(task_info_data.code===0){
                        num+=1
                        task_arr.push(task_info_data.data)
                        getOrderInfo(arr,num,task_arr,type,val)
                    }else{
                        console.log(task_arr)
                    }
                }
            })

        }else{
            if(type===1){
                tableToExcel(task_arr,1)
            }else{
                update_item_url(task_arr,val)
            }

        }

    }
    function update_item_url(task_arr,val){
        let newarrupdate= task_arr.filter(item=> item.component.ecoms[0].status===2);
        let num=0;
        if(newarrupdate.length){
            update_item_url_fn(newarrupdate,num,val)
        }else{
            $('#pl-subimt').show()
            $('#pl-gb').show()
            $('#pl-jz').hide()
            alert('没有失效链接！！！')
        }

    }
    function update_item_url_fn(arr,num,val){
        if(arr[num]){
            let objdata={
                component_detail_id:arr[num].component.ecoms[0].component_detail_id,
                imgs:[
                    "https://p9-dy.byteimg.com/obj/temai/3ad726ccdd06528e15967af10a2019dewww600-600",
                    "https://p9-dy.byteimg.com/obj/temai/3ad726ccdd06528e15967af10a2019dewww600-600"
                ],
                product_link:val, //"https://haohuo.jinritemai.com/views/product/detail?id=3479925495439697287&origin_type=604",
                product_title:"资产配置训练营! ",
                service_method:"ModifyEcomProduct",
                service_name:"orders.AdStarOrdersService",
            }
            let imgstr="product_link"+val+"service_methodGetEcomProductInfoservice_nameorders.AdStarOrdersServicetask_category1"+"e39539b8836fb99e1538974d3ac1fe98"
            $.get(httpurl+"/h/api/gateway/handler_get/?product_link="+encodeURIComponent(val)+"&task_category=1&service_name=orders.AdStarOrdersService&service_method=GetEcomProductInfo&sign="+md5(imgstr),function (dataimgs){
                objdata.imgs=dataimgs.data.imgs
                objdata.sign=strpjmd(objdata)
                $.ajax({
                    type: "post",
                    url: httpurl+"/h/api/gateway/handler_post/",
                    headers:{
                        'Content-Type':'application/json;charset=utf8',
                        "x-csrftoken":  getcookie('csrftoken'),
                        "x-login-source": 1,
                        "x-star-service-method": "ModifyEcomProduct",
                        "x-star-service-name": "orders.AdStarOrdersService"},
                    data:JSON.stringify(objdata),
                    dataType:'json',
                    success:function (message) {
                        if(message.code===0){
                            num+=1
                            update_item_url_fn(arr,num,val)
                        }else{
                            $('#pl-subimt').show()
                            $('#pl-gb').show()
                            $('#pl-jz').hide()
                            alert(arr[num].demand.name + '==== 修改失败！！')
                        }
                    },
                    error:function (message) {
                        alert("提交失败"+JSON.stringify(message));
                    }
                });
            })
        }else{
            $('#pl-subimt').show()
            $('#pl-gb').show()
            $('#pl-jz').hide()
            $('#plcontent').hide()
            alert('更新已完成！')

        }
    }
    function tableToExcel(arr,type){
        //要导出的json数据
        const jsonData = [];
        let str;
        if(type===1){
            for (let i=0;i<arr.length;i++){
                let obj={}
                obj.nick_name=arr[i].author_info.nick_name
                obj.task_category=task_type_fn(arr[i].demand.task_category)
                obj.name=arr[i].demand.product_name
                obj.create_time=dateTime(arr[i].order.create_time)
                obj.money=arr[i].order.money
                obj.deposit_amount=arr[i].order.deposit_amount
                obj.balance_payment=(arr[i].order.money-arr[i].order.deposit_amount)
                obj.status= arr[i].order.author_price_modify_time!==null ? '修改报价' : ' ';
                jsonData.push(obj)
            }
          //列标题
            str = '<tr><td>达人名称</td><td>投放形式</td><td>学科</td><td>创建时间</td><td>订单金额</td><td>已付定金</td><td>待付尾款</td><td>达人状态</td></tr>';
        }else if(type===2){
            for (let i=0;i<arr.length;i++){
                let obj={}
                obj.title=arr[i].demand_info.demand_name
                obj.link=httpurl+"/ad/creator/task/detail/"+arr[i].order_info_list[0].order_info.id
                jsonData.push(obj)
            }
            //列标题
            str = '<tr><td>任务名称</td><td>确认链接</td></tr>';
        }
        //循环遍历，每行加入tr标签，每个单元格加td标签
        for(let i = 0 ; i < jsonData.length ; i++ ){
            str+='<tr>';
            for(let item in jsonData[i]){
                //增加\t为了不让表格显示科学计数法或者其他格式
                str+=`<td>${ jsonData[i][item] + '\t'}</td>`;
            }
            str+='</tr>';
        }
        //Worksheet名
        let worksheet = 'Sheet1'
        let uri = 'data:application/vnd.ms-excel;base64,';

        //下载的表格模板数据
        let template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:x="urn:schemas-microsoft-com:office:excel" 
      xmlns="http://www.w3.org/TR/REC-html40">
      <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>${worksheet}</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
        </x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        </head><body><table>${str}</table></body></html>`;
        //下载模板
        window.location.href = uri + base64(template)
    }
    function base64 (s) { return window.btoa(unescape(encodeURIComponent(s))) }
    function update_url_fn(val){
            let num=1;
            let arr=[]
            console.log(1,val)
            update_data(num,arr,val)
    }
    function update_data(num,arr,val){
        let params={
            "limit": "10",
            "page": num,
            "query": {'universal_order_status':3,'system_type':1},
            "service_method": "DemanderGetUniversalDemandList",
            "service_name": "task.AdStarTaskService",
            //db575449a032400f7ab1c35cf1acaf42
        }
        $.get(httpurl+"/h/api/gateway/handler_get/?limit=10&page="+num+"&query=%7B%22universal_order_status%22:3,%22system_type%22:1%7D&service_name=task.AdStarTaskService&service_method=DemanderGetUniversalDemandList&sign="+strpjmd(params),function(page_data){
            if(page_data.code===0){
                let total_page=Math.ceil(page_data.data.pagination.total_count/10)
                if(num<=total_page){
                    for (let i=0;i<page_data.data.demand_info_list.length;i++){
                        arr.push(page_data.data.demand_info_list[i])
                    }
                    num+=1
                    update_data(num,arr,val)
                }else {
                    let newarr=arr.filter(item => item.demand_info.task_category===1)
                    let update_url_arr= newarr.filter(item=> {
                        return item.order_info_list[0].order_info.status===1 || item.order_info_list[0].order_info.status=== 41|| item.order_info_list[0].order_info.status===43 || item.order_info_list[0].order_info.status===44 || item.order_info_list[0].order_info.status===52
                    })
                    let task_num=0;
                    let task_arr=[]
                    getOrderInfo(update_url_arr,task_num,task_arr,2,val)
                }
            }
        });
    }
    function export_link(){
        $('#daochu_link').on("click",function (){
            let num=1;
            let arr=[]
            export_link_page(num,arr)
        })
    }
    function get_page_type_data(num,arr){
         let params={
             "limit": "10",
             "page": num,
             "query": {'universal_order_status':3,'system_type':1},
             "service_method": "DemanderGetUniversalDemandList",
             "service_name": "task.AdStarTaskService",
         }
        params.sign=strpjmd(params)
        params.query='{"universal_order_status":3,"system_type":1}'
         $.ajax({
             type: "get",
             url: httpurl+"/h/api/gateway/handler_get/",
             headers:{
                 'Content-Type':'application/json;charset=utf8',
                 "x-csrftoken":  getcookie('csrftoken'),
                 "x-login-source": 1,
                 "x-star-service-method": "DemanderGetUniversalDemandList",
                 "x-star-service-name": "task.AdStarOrdersService"},
             data:params,
             dataType:'json',
             success:function(page_data){
                 if(page_data.code===0){
                     let total_page=Math.ceil(page_data.data.pagination.total_count/10)
                     if(num<=total_page){
                         for (let i=0;i<page_data.data.demand_info_list.length;i++){
                             arr.push(page_data.data.demand_info_list[i])
                         }
                         num+=1
                         get_page_type_data(num,arr)
                     }else {
                         let link_arr=arr.filter(item=>{
                             return (
                                 item.order_info_list[0].order_info.status===51 && item.order_info_list[0].order_info.video_type===2
                             ) || (
                                 item.order_info_list[0].order_info.status===51 && item.order_info_list[0].order_info.video_type===9
                             ) || (
                                 item.order_info_list[0].order_info.status===54 && item.order_info_list[0].order_info.video_type===1
                             ) || (
                                 item.order_info_list[0].order_info.status===41 && item.order_info_list[0].order_info.video_type===2
                             ) || (
                                 item.order_info_list[0].order_info.status===41 && item.order_info_list[0].order_info.video_type===53
                             ) ;
                         })
                         if(link_arr.length!==0){
                             tableToExcel(link_arr,2)
                         }

                     }
                 }
             }
         })
         // $.get("https://www.xingtu.cn/h/api/gateway/handler_get/?limit=10&page="+num+"&query=%7B%22universal_order_status%22:3,%22system_type%22:1%7D&service_name=task.AdStarTaskService&service_method=DemanderGetUniversalDemandList&sign="+strpjmd(params),function(page_data){
         //
         // });
    }
    function export_link_page(){
        let num=1;
        let arr=[]
        get_page_type_data(num,arr)
    }
    setTimeout(()=>{
      //批量修改
      $('.task-search').append('<p id=\'plxgbox\'><span id=\'plxg\'>批量修改(购物车失效链接)</span> <span id=\'daochu\'>导出(待付款数据)</span> <span id=\'daochu_link\'>导出(确认链接)</span> </p>')
      // 批量修改 失效链接
      pl_update_dome()
      // 导出 待付款 数据
      daochu_fn()
      // 导出 确人链
        export_link()

  },4000)
})