const fs = require('fs')
const { URL } = require('url');
const cp = require('child_process');
const { Buffer } = require('buffer');
const serializeYML = require('js-yaml');
const { router,sleep,  PROXIESPATH, proxy, CLASHYAMLPATH,ax ,ef_sub} = require('../config')
async function get_trojan() {
    return new Promise((reslove, rej) => {
        let base64_str_full = ''
        let base64_str = ''
        https.get(ef_sub, resp => {
            resp.setEncoding('utf-8')
            resp.addListener('readable', () => {
                if ((base64_str = resp.read()) != null) base64_str_full += base64_str
            })
            resp.addListener('end', () => {
                reslove(base64_str_full)
            })
            resp.addListener('error', err => {
                rej('订阅更新失败')
            })
        })
    })
}
async function get_trojan_axios() {
    try {
        cp.execSync(`nc -zv  ${proxy.host} ${proxy.port}`, { encoding: 'utf8' })
        let resp = await ax.get(ef_sub)
        return resp.data
    } catch (e) {
        return e || null
    }
}
function toggle_proxy_node(index, json, proxies_desc) {
    json = json || serializeYML.load(fs.readFileSync(CLASHYAMLPATH, { encoding: 'utf-8' }))
    proxies_desc = proxies_desc || JSON.parse(fs.readFileSync(PROXIESPATH, { encoding: 'utf-8' }));
    let selected_proxy = proxies_desc.find(proxy => proxy.selected && proxy)
    let select = proxies_desc[index];
    [select.selected, selected_proxy.selected] = [selected_proxy.selected, select.selected];
    json['proxy-groups'].forEach(group => {
        group.proxies = [select['name']]
    })
    let update_yaml = serializeYML.dump(json)
    fs.writeFileSync(PROXIESPATH, JSON.stringify(proxies_desc), { encoding: 'utf-8' })
    fs.writeFileSync(CLASHYAMLPATH, update_yaml, { encoding: 'utf-8' })
    return select.name
}
async function set_proxies_js_yml() {
    let proxies_desc = []
    let b64_full = await get_trojan_axios() || await get_trojan()
    if (!b64_full) return
    let utf8_str = Buffer.from(b64_full, 'base64').toString('utf-8')
    let proxies = utf8_str.split('\r\n').slice(0, -1).map((proxyURL, idx) => {
        // WHATWG standard
        const parsedUrl = new URL(proxyURL)
        const query = parsedUrl.searchParams
        let name = decodeURIComponent(parsedUrl.hash.slice(1))
        proxies_desc.push({ name, type: parsedUrl.protocol, selected: idx === 0 })
        return {
            name,
            type: parsedUrl.protocol.slice(0, -1),
            server: parsedUrl.hostname,
            port: parseInt(parsedUrl.port),
            password: parsedUrl.username,
            udp: true,
            sni: query.get('sni'),
            'skip-cert-verify': query.get('allowInsecure') === '1',
        }
    })
    fs.writeFileSync(PROXIES, JSON.stringify(proxies_desc), { encoding: 'utf-8' })
    let json = serializeYML.load(fs.readFileSync(CLASHYAMLPATH, { encoding: 'utf-8' }))
    json.proxies = proxies
    return toggle_proxy_node(18, json, proxies_desc)
}

function rollback() {
    return cp.execSync(`cp -f ${CLASHYAMLPATH}.bak ${CLASHYAMLPATH}`)
}
function backup() {
    return cp.execSync(`cp -f ${CLASHYAMLPATH} ${CLASHYAMLPATH}.bak`)
}
async function sysctl(action, service) {
    cp.execSync(`systemctl ${action} ${service}`)
    await sleep(1000);
    return cp.execSync(`nc -zv  ${proxy.host} ${proxy.port}`, { encoding: 'utf8', stdio: 'ignore' })
}
router.get('/proxies', async (ctx, next) => {
    ctx.status = 200
    ctx.body = (process.argv[2] && []) || JSON.parse(fs.readFileSync(PROXIESPATH, { encoding: 'utf-8' }))
})

router.get('/updateProxy', async (ctx, next) => {
    try {
        backup()
        await set_proxies_js_yml();
        await sysctl('restart', 'clash')
        ctx.body = `updated`
    } catch (e) {
        rollback()
        await sysctl('restart', 'clash')
        ctx.body = 'rollback'
    }
})
router.get('/toggleProxy/:idx', async (ctx, next) => {
    try {
        backup()
        let selected = toggle_proxy_node(ctx.params.idx)
        await sysctl('restart', 'clash')
        ctx.body = `Toggle ${selected}`
    } catch (e) {
        rollback()
        await sysctl('restart', 'clash')
        ctx.body = 'rollback'
    }
})
router.get('/clash', async (ctx, next) => {
    ctx.status = 200
    ctx.body = (await ax.get(ef_sub)).data
})
