// FEATURES TODO
//
// FEATURES DONE
// start on sight
// reset
// prefix
// basic timer
// rounding
// pad display
// delay

module.exports = function(){
    let Counter = Object.getPrototypeOf(fw).Counter = class Counter extends fw.Component{
        static {
            this.debug = false;
            this.createdAt  = "3.0.0";
            this.lastUpdate = "3.0.0";
            this.version = "2.0.0";
            this.tpl = utils.getNodeFromString(require('bundle-tpl:./counter.html')).outerHTML;
            // this.describe();
        }
        onCreate(){
            let counter = this;
            counter.log("onCreate start");
            counter.start               = counter.start               ?? Number(counter.getData('start', 0));
            counter.end                 = counter.end                 ?? Number(counter.getData('end',   0));
            counter.decimals            = counter.decimals            ?? Number(counter.getData('decimals', counter.getMaxDecimals()));
            counter.duration            = counter.duration            ?? Number(counter.getData('duration', 2000));
            counter.steps               = counter.steps               ?? Number(counter.getData('steps', 1));
            counter.delay               = counter.delay               ?? Number(counter.getData('delay', 0));
            counter.prefix              = counter.prefix              ?? counter.getData('prefix',   '');
            counter.separator           = counter.separator           ?? counter.getData('separator',' ');
            counter.decimal             = counter.decimal             ?? counter.getData('decimal',  '.');
            counter.roundingStrategy    = counter.roundingStrategy    ?? counter.getData('rounding-strategy','trunc');
            counter.padDisplay          = counter.padDisplay          ?? counter.getData('pad-display','0');
            counter.resetOnViewportExit = counter.resetOnViewportExit ?? counter.getData('reset-on-viewport-exit',true);
            counter.totalTime           = 0;

            // config timing and steps
            counter.isInt = (Number.isInteger(counter.start) && Number.isInteger(counter.end)) || counter.decimals == 0;
            if (!counter.isInt){
                if(counter.steps == 1)
                    counter.steps = Number('0.'+''.padEnd(counter.decimals-1,'0')+'1');
            }
            counter.timing  = counter.duration / ((counter.end - counter.start) / counter.steps);
            if (counter.timing < 10){
                counter.timing = 10;
                counter.steps = Number((((counter.end - counter.start) * counter.timing) / counter.duration).toFixed(counter.decimals));
            }

            // HTML construction
            counter.display_value = counter.el.querySelector('.counter__value') ?? utils.getNodeFromString('<span class="counter__value"></span>');
            counter.display_unit  = counter.el.querySelector('.counter__unit')  ?? utils.getNodeFromString('<span class="counter__unit"></span>');
            counter.display_label = counter.el.querySelector('.counter__label') ?? utils.getNodeFromString('<div class="counter__label"></div>');

            // counter.display_value.innerHTML = counter.display_value.innerHTML !== '' ? counter.display_value.innerHTML : counter.start;
            counter.updateDisplay(counter.start);
            counter.display_unit.innerHTML  = counter.display_unit.innerHTML  !== '' ? counter.display_unit.innerHTML  : counter.getData('unit','');
            counter.display_label.innerHTML = counter.display_label.innerHTML !== '' ? counter.display_label.innerHTML : counter.getData('label','');

            counter.el.append(counter.display_value);
            counter.el.append(counter.display_unit);
            counter.el.append(counter.display_label);


            counter.intersectObserver = new IntersectionObserver((entries)=>{
                entries.forEach((entry)=>{
                    let counter = entry.target.component ?? false;
                    if(!counter)
                        return;
                    if (entry.isIntersecting) {
                        if (counter.state == 'ready' || (counter.state != 'running' && counter.resetOnViewportExit)) {
                            counter.updateState('delayed')
                            setTimeout(()=>{counter.startCounter()},counter.delay)
                        }
                    } else {
                        if (counter.resetOnViewportExit)
                            counter.reset()
                    }
                })
            });
            counter.intersectObserver.observe(counter.el);
            counter.log("onCreate end",'',true)
            counter.updateState('ready');
        }

        async startCounter(){
            let counter = this;
            counter.log('startCounter');
            counter.updateState('running');
            for (counter.value = counter.start; counter.value <= counter.end; counter.value = Number((counter.value+counter.steps).toFixed(counter.decimals))) {
                await new Promise(function(resolve,reject){
                    setTimeout(()=>{
                        counter.updateDisplay();
                        resolve()
                    },counter.timing)
                });
                counter.totalTime += counter.timing;
                if (counter.state != 'running')
                    return;
            }
            counter.updateDisplay(counter.end);
            counter.updateState('ended');
            return this;
        }
        updateDisplay(numValue = this.value){
            let counter = this;
            let strValue;
            if (counter.isInt) {
                switch(counter.roundingStrategy){
                    case 'trunc':
                    case 'floor':
                    case 'ceil' :
                    case 'round':
                        strValue = Math[counter.roundingStrategy](numValue);
                        break;
                    case 'fixed':
                        strValue = numValue.toFixed(counter.decimals);
                        break;
                }
            } else {
                strValue = numValue.toFixed(counter.decimals);
            }
            if(counter.padDisplay)
                strValue = String(strValue).padStart(String(counter.end).length,counter.padDisplay)
            if(counter.separator)
                strValue = counter.formatWithSeparators(strValue);

            counter.display_value.innerHTML = counter.prefix+strValue;
            return this;
        }
        reset(){
            this.log('reset')
            this.value = this.start;
            this.totalTime = 0;
            this.updateDisplay();
            this.updateState('ready');
            return this;
        }
        updateState(state){
            this.log(state, this.totalTime ? 'total time: '+this.totalTime+'ms' : false);
            this.state = state;
            this.el.classList.remove('running','ready','ended','delayed');
            this.el.classList.add(state);
            return this;
        }
        formatWithSeparators(num){
            let parts = String(num).split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.separator);
            return parts.join(".");
        }
        getMaxDecimals(){
            return Math.max(
                this.start.toString().split('.')[1]?.length??0,
                this.end.toString().split('.')[1]?.length??0,
            );
        }
    }

    


    return Counter;
}




// var CountUp = require('countup.js').CountUp;
// module.exports = function(app){
//     var CountUpFW = Object.getPrototypeOf(app).CountUpFW = new app.Component("countUpFW");
//     // CountUpFW.debug = true;
//     CountUpFW.createdAt      = "2.0.0";
//     CountUpFW.lastUpdate     = "2.6.0";
//     CountUpFW.version        = "1.2.2";
//     // CountUpFW.factoryExclude = true;
//     // CountUpFW.loadingMsg     = "This message will display in the console when component will be loaded.";
//     // CountUpFW.requires       = [];

//     CountUpFW.prototype.onCreate = function(){
//         var countUp = this;
//         countUp.startVal = (countUp.startVal !== undefined) ? countUp.startVal : countUp.getData('startval',0);
//         countUp.endVal = (countUp.endVal !== undefined) ? countUp.endVal : countUp.getData('endval',0);
//         countUp.decimals = (countUp.decimals !== undefined) ? countUp.decimals : countUp.getData('decimals',0);
//         countUp.duration = (countUp.duration !== undefined) ? countUp.duration : countUp.getData('duration',2);
//         countUp.delay = (countUp.delay !== undefined) ? countUp.delay : countUp.getData('delay',0);
//         countUp.prefix = (countUp.prefix !== undefined) ? countUp.prefix : countUp.getData('prefix','');
//         countUp.separator = (countUp.separator !== undefined) ? countUp.separator : countUp.getData('separator',true);
//         countUp.decimal = (countUp.decimal !== undefined) ? countUp.decimal : countUp.getData('decimal','.');
//         countUp.target = (countUp.$el.find('.countUpFW__num').length) ? countUp.$el.find('.countUpFW__num').get(0) : countUp.$el.get(0);
//         countUp.options = {
//             useEasing: true,
//             useGrouping: true,
//             separator: countUp.separator==true?' ':countUp.separator!=false?countUp.separator:'',
//             decimal: countUp.decimal,
//             prefix: countUp.prefix,
//             enableScrollSpy: true,
//             scrollSpyDelay: countUp.delay*1000,
//             startVal: countUp.startVal,
//             decimalPlaces: countUp.decimals,
//             duration: countUp.duration,
//         }

//         countUp.anim = new CountUp(countUp.target,countUp.endVal,countUp.options);
//     }
//     return CountUpFW;
// }