/**
 * 时间戳格式化函数
 * @param  {string} format    格式
 * @param  {int}    timestamp 要格式化的时间 默认为当前时间
 * @return {string}           格式化的时间字符串
 */
function dateTime(dateNum){
    var date=new Date(dateNum*1000);
    return date.getFullYear()+"-"+fixZero(date.getMonth()+1,2)+"-"+fixZero(date.getDate(),2);
    function fixZero(num,length){
        var str=""+num;
        var len=str.length;
        var s="";
        for(var i=length;i-->len;){
            s+="0";
        }
        return s+str;
    }
}