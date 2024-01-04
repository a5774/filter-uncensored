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


function  convert(){
    let bm = require('./static/bus-bookmark.json')
    bm = bm.map(item=>{
        return {...item,f:`https://www.javbus.com/${item.n}`}
    })
    fs.writeFileSync('./static/bus-bookmark.json',JSON.stringify(bm))
}
// convert()
function getAllName(){
    let bm = JSON.parse(fs.readFileSync('./static/db-bookmark.json'))
    console.log(bm.map(any=>any.n).join(','));
}
getAllName()

// SSIS-840,MIDV-253,JUKF-093,MUDR-197,MUDR-200,MIAA-828,TENN-006,SDAB-278,JRBA-012,SSIS-736,CAWD-570,SSIS-862,MIAD-954,MIAA-702
// MUDR-197,SSIS-736,MIDV-253,JRBA-012,SSIS-862,MIAA-828,MIFD-070,SSIS-840,CAWD-570,JUKF-093,MIAD-954,MUDR-200
// bus
// MIAD-954,SSIS-840,SSIS-736,MIAA-828,SDAB-278,MIAA-702,JUKF-093,CAWD-570,TENN-006,MUDR-200,MIDV-253,SSIS-862
// db
// MIFD-070,CAWD-404,STARS-978,STARS-771,MIAD-954

