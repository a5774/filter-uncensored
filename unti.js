const readline = require('readline');
// const a = require('./static/genre_table.json')
const fs = require('fs')


let b = []
async function s() {
    for (const key in a) {
        await new Promise(r => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question(`SAVE KEY OF ${key}-->${a[key]}\n`, c => {
                if (c.includes('e')) {
                    fs.writeFileSync('./final.json', JSON.stringify(b))
                }
                if (c.includes('y')) {
                    b.push(key)
                }
                r(rl.close())
            });
        })

    }
}
// s()



/* const allElements = document.querySelectorAll('*');
allElements.forEach(element => {
  const eventListeners = getEventListeners(element)
  for (const eventType in eventListeners) {
    eventListeners[eventType].forEach(listener => {
      element.removeEventListener(eventType, listener.listener);
    });
  }
});
 */



/* 

let size = fs.statSync('./temp.txt').size
console.log(size);
let c = fs.createWriteStream('./temp.txt', {
    // start:size,
    encoding: "utf-8",
    flags: 'a'
}) */


/* function attrInject(origin, inject, update) {
    
    let update = {
        attr:'i',
        callback:function(){}
    }
   let {attr,callback} = update
    
    return { ...origin, ...inject, [attr]:callback.call(origin[attr])}
}
let a_ = {
    x:'1',
    y:[1,5,7]
}
attrInject(a_,{y:3},{})


 */
