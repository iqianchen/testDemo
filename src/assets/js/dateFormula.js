/* eslint-disable */
class DateFormula {
    constructor() {}

    /**
     * 日期格式化
     * @param { Date } date     日期
     * @param { String } fmt    格式化  例：yyyy-MM-dd  yyyy/MM/dd hh:mm:ss
     */
    format (date, fmt) {
        var o = {   
            "M+" : date.getMonth()+1,                 //月份   
            "d+" : date.getDate(),                    //日   
            "h+" : date.getHours(),                   //小时   
            "m+" : date.getMinutes(),                 //分   
            "s+" : date.getSeconds(),                 //秒   
            "q+" : Math.floor((date.getMonth()+3)/3), //季度   
            "S"  : date.getMilliseconds()             //毫秒   
        };   
        if(/(y+)/.test(fmt))   
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
        for(var k in o)   
        if(new RegExp("("+ k +")").test(fmt))   
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
        return fmt;
    }

    /**
     * 获取当前周的起始和终止日期
     * @param { Number } AddWeekCount  0代表当前周   为-1代表上一个周   为1代表下一个周以此类推
     */
    getWeekStartAndEnd (AddWeekCount) {
        var startStop = new Array();
        var millisecond = 1000 * 60 * 60 * 24;      //一天的毫秒数
        var currentDate = new Date();
        // 相对于当前日期AddWeekCount个周的日期
        currentDate = new Date(currentDate.getTime() + (millisecond * 7*AddWeekCount));
        var week = currentDate.getDay();            //返回date是一周中的某一天
        var minusDay = week != 0 ? week - 1 : 6;    //减去的天数
        // 获得当前周的第一天   
        var currentWeekFirstDay = new Date(currentDate.getTime() - (millisecond * minusDay)); 
        // 获得当前周的最后一天
        var currentWeekLastDay = new Date(currentWeekFirstDay.getTime() + (millisecond * 6));
        // 添加至数组
        startStop.push(this.format(currentWeekFirstDay,'yyyy-MM-dd'))
        startStop.push(this.format(currentWeekLastDay,'yyyy-MM-dd'))
        // 返回
        return startStop
    }

    /**
     * 获取当前月的起始和终止日期
     * @param { Number } AddMonthCount  0代表当前月   为-1代表上一个月   为1代表下一个月以此类推
     */
    getMonthStartAndEnd(AddMonthCount) { 
        var startStop = new Array();    //起止日期数组 
        var currentDate = new Date();   //获取当前时间 
        var month = currentDate.getMonth()+AddMonthCount;
        if(month < 0){
            var n = parseInt((-month)/12);
            month += n*12;
            currentDate.setFullYear(currentDate.getFullYear()-n);
        }
        currentDate = new Date(currentDate.setMonth(month));
        // 获得当前月份0-11   
        var currentMonth = currentDate.getMonth(); 
        // 获得当前年份4位年   
        var currentYear = currentDate.getFullYear(); 
        // 获得上一个月的第一天   
        var currentMonthFirstDay = new Date(currentYear, currentMonth,1); 
        // 获得上一月的最后一天   
        var currentMonthLastDay = new Date(currentYear, currentMonth+1, 0); 
        // 添加至数组   
        startStop.push(this.format(currentMonthFirstDay,'yyyy-MM-dd')); 
        startStop.push(this.format(currentMonthLastDay,'yyyy-MM-dd')); 
        // 返回   
        return startStop; 
    }

    /**
     * 获取本月份的开始月份
     * @param { Number } month 当前月份
     */
    getQuarterSeasonStartMonth (month) {
        var quarterMonthStart = 0;
        var spring = 0; //春 
        var summer = 3; //夏 
        var fall = 6;   //秋 
        var winter = 9; //冬 
        //月份从0-11 
        if (month < 3) return spring
        if (month < 6) return summer
        if (month < 9) return fall
        return winter;
    }

    /**
     * 获得该月的天数
     * @param { Number } year   年
     * @param { Number } month  月
     */
    getMonthDays (year, month) {         
         var relativeDate = new Date(year, month, 1);       //本月第一天 1-31         
         var relativeMonth = relativeDate.getMonth();       //获得当前月份0-11     
         var relativeYear = relativeDate.getFullYear();     //获得当前年份4位年 
         //当为12月的时候年份需要加1 
         //月份需要更新为0 也就是下一年的第一个月 
         if (relativeMonth == 11) {
             relativeYear++;
             relativeMonth = 0;
         } else {
             //否则只是月份增加,以便求的下一月的第一天 
             relativeMonth++;
         }
         //一天的毫秒数 
         var millisecond = 1000 * 60 * 60 * 24;
         //下月的第一天 
         var nextMonthDayOne = new Date(relativeYear, relativeMonth, 1);
         //返回得到上月的最后一天,也就是本月总天数 
         return new Date(nextMonthDayOne.getTime() - millisecond).getDate();
    }

    /**
     * 获取当前季度的起始和终止日期
     * @param { Number } AddMonthCount 0代表当前季   为-1代表上一个季   为1代表下一个周以此类推
     */
    getSeasonStartAndEnd (AddMonthCount) {
        var startStop = new Array();
        var currentDate = new Date();   //获取当前时间 
        var month = currentDate.getMonth() + 4*AddMonthCount;
        if(month < 0){
            var n = parseInt((-month)/12);
            month += n*12;
            currentDate.setFullYear(currentDate.getFullYear()-n);
        }else if (month > 11) {
            var n = parseInt((month)/12);
            month += n*12;
            currentDate.setFullYear(currentDate.getFullYear()+n);
        }
        currentDate = new Date(currentDate.setMonth(month));
          
        var currentMonth = currentDate.getMonth();      // 获得当前月份0-11 
        var currentYear = currentDate.getFullYear();    // 获得当前年份4位年
        //获得本季度开始月份 
        var quarterSeasonStartMonth = this.getQuarterSeasonStartMonth(currentMonth);
        //获得本季度结束月份 
        var quarterSeasonEndMonth = quarterSeasonStartMonth + 2;
        //获得本季度开始的日期 
        var quarterSeasonStartDate = new Date(currentYear, quarterSeasonStartMonth, 1);
        //获得本季度结束的日期 
        var quarterSeasonEndDate = new Date(currentYear, quarterSeasonEndMonth, this.getMonthDays(currentYear, quarterSeasonEndMonth));
        //加入数组返回 
        startStop.push(this.format(quarterSeasonStartDate, 'yyyy-MM-dd'));
        startStop.push(this.format(quarterSeasonEndDate, 'yyyy-MM-dd'));
        //返回 
        return startStop;
    }

    /**
     * 获取当前年份的起始和终止日期
     * @param { Number } AddMonthCount 0代表当前季   为-1代表上一个季   为1代表下一个周以此类推
     */
    getYearStartAndEnd (addYear) {
        var startStop = new Array();
        var currentDate = new Date();                   // 获取当前时间 
        var currentYear = currentDate.getFullYear();    // 获得当前年份4位年
        currentYear += addYear
        // 本年第一天 
        var currentYearFirstDate = new Date(currentYear, 0, 1);
        // 本年最后一天 
        var currentYearLastDate = new Date(currentYear, 11, 31);
        // 添加至数组 
        startStop.push(this.format(currentYearFirstDate, 'yyyy-MM-dd'));
        startStop.push(this.format(currentYearLastDate, 'yyyy-MM-dd'));
        // 返回 
        return startStop;
    }
}

export default new DateFormula()