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


// let bk = './static/bus-bookmark.json'
let bk = './static/db-bookmark.json'
function convert() {
    let bm = require(bk)
    bm = bm.map(item => {
        return { ...item, f: `https://www.javbus.com/${item.n}` }
    })
    fs.writeFileSync(bk, JSON.stringify(bm))
}
// convert()
function getAllName() {
    let bm = JSON.parse(fs.readFileSync(bk))
    console.log(bm.map(any => any.n).join(','));
}
getAllName()


let bm = require(bk)
function sorted(attr, convert, reverse = false) {
    let fn = Function("v", `return v${attr}`)
    let callback = (x, y) => {
        x = convert(fn(x)); y = convert(fn(y));
        return (reverse && (x - y)) || (y - x)
    }
    let { sort, slice, toSorted } = Array.prototype
    return toSorted?.call(this, callback) || sort.call(slice.call(this), callback)
}

// let sortd = sorted.call([{ v: [41, 87] }, { v: [74, 57] }], '.v[0]', x => x, false)

// console.log(sortd);

// git config --global http.proxy http://127.0.0.1:7890
// git config --global https.proxy https://127.0.0.1:7890
// a ? b : c ? d : e ? f : g ? h : i ? j : k ? l : m ? n : o ? p : q ? r : s ? t : v ? v : w ? x : y ? z : null
// git remote set-url origin   https://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@github.com/a5774/realtimeCategory.git
// git config --global http.proxy http://127.0.0.1:7890
// git rebase --continue
// git checkout --theirs .
// docker exec -it 40f324f67e40 /bin/bash 