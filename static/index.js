// import constant from '/constant.json' assert { type: 'json' };
(async () => {
    let { protocol, port, host, search } = location
    let { v, f } = Object.fromEntries(new URLSearchParams(location.search))
    function sorted(attr, convert, flip = false) {
        let callback = (x, y) => flip ? convert(x[attr]) - convert(y[attr]) : convert(y[attr]) - convert(x[attr])
        let { sort, slice, toSorted } = Array.prototype
        return toSorted?.call(this, callback) || sort.call(slice.call(this), callback)
    }
    function uniqueObjectsByKey(arrLike, key) {
        const s = new Set();
        return arrLike.filter(({ value }) => {
            const n = value[key];
            return !s.has(n) ? s.add(n) : null
        });
    }
    let constant = await fetch("/constant").then(resp => resp.json())
    let vm = new Vue({
        el: '#box',
        data: {
            originDomain: constant.domain.originDomain,
            thirdDomain: constant.domain.thirdDomain,
            instruction: null,
            overlay: {
                pics: false,
                error: false,
                serial: true,
                history: false,
                magnet: false,
                reflow: false,
                isfloat: false,
                proxies: false,
                sidenav: false,
                dashboard: false,
            },
            fragment: {
                size: constant.dataOptionsNomarl.fragment.size,
                idx: constant.dataOptionsNomarl.fragment.idx
            },
            chat: {
                overlay: {
                    textSwitch: false
                },
                textMessage: '',
                group: [],
                state: constant.dataOptionsNomarl.chat.state,
                enable: false,
                session: '',
                socket: null,
                mediaRecorder: null,
                voiceChunks: []
            },
            main: {
                page: 0,
                log: constant.dataOptionsNomarl.main.log,
                error: '',
                select: constant.dataOptionsNomarl.main.select,
                mode: constant.dataOptionsNomarl.main.mode,
                state: constant.dataOptionsNomarl.main.state,
                serial: '',
                keyWord: '',
                socket: null,
                heartbeat: 0,
                slideSpeed: constant.dataOptionsNomarl.main.slideSpeed,
                needReconnect: true,
                reconnectTimeout: constant.dataOptionsNomarl.main.reconnectTimeout
            },
            manual: {
                bookmark: false,
                origin: true
            },
            status: {
                isdone: true,
                vthumb: true,
                autoview: false,
                single: false,
                stars: false,
                genre: false,
                studio: false,
                label: false,
                director: false,
                onsunc: false
            },
            preview: {
                pics: [],
                picsIndex: -1,
                picsEl: null,
                picsSwipe: false
            },
            magnet: [],
            reflow: [],
            bookmark: [],
            taglist: {},
            dynamiclist: [],
            history: [],
            sconf: null,
            observer: null,
            offset: null,
            throttled: {
                nav: null,
                load: null,
                slide: null,
                scroll: null,
                update: null,
                heartbeat: null,
                prefixscroll: null
            },
            pressTimer: null,
            proxies: [],
            theme: 'normal',
            description: 'standard'

        },
        methods: {
            async selectProxy(idx) {
                if (this.status.isdone) {
                    this.status.isdone = false
                    this.overlay.reflow = false;
                    this.overlay.proxies = false;
                    this.main.log = await fetch(`${constant.resourceRouter.toggleProxy}${idx + constant.constantNumber.passProxy}`).then(r => r.text())
                    this.proxies = this.snippetArray((await fetch(constant.resourceRouter.proxies).then(resp => resp.json())).slice(constant.constantNumber.passProxy), constant.snippet.proxy)
                    this.status.isdone = !this.status.isdone
                    return null
                }
                alert(constant.constantString.alertString.selectProxy)
            },
            async updateProxy() {
                this.overlay.reflow = false;
                this.main.log = await fetch(constant.resourceRouter.updateProxy).then(r => r.text());
            },
            flushHistory() {
                this.overlay.history = true && this.history.length
                this.history = Object.keys(localStorage).filter(h => h != constant.constantString.flagString._data);
                return null
            },
            loadHistory(key) {
                let data_ = JSON.parse(localStorage.getItem(key))
                this.jumpLocation(data_['sconf']['keyWord'], data_['description'])
                return null
            },
            autoScroll({ touches: [point] }) {
                this.throttled.prefix = setTimeout(() => {
                    this.offset = Math.floor(this.$refs.box.scrollTop)
                    let up = point['clientX'] >= window.innerHeight >> 2
                    cancelAnimationFrame(this.throttled.slide)
                    let animateScroll = () => {
                        let offset = this.offset += (up ? this.main.slideSpeed : -this.main.slideSpeed)
                        this.scrollToTop(offset, constant.constantString.flagString.autoScrollBehavior)
                        this.throttled.slide = requestAnimationFrame(animateScroll)
                    }
                    animateScroll()
                }, constant.timer.invokeSlideTimeout)
            },
            stopScroll() {
                clearTimeout(this.throttled.prefix)
                cancelAnimationFrame(this.throttled.slide)
            },
            import_() {
                console.log(this.main.serial);
                if (/^[a-zA-Z]+-\d+(\s*,\s*[a-zA-Z]+-\d+)*$/.test(this.main.serial)) {
                    this.dynamiclist = []
                    this.overlay.reflow = false
                    this.overlay.serial = false
                    let serial = this.main.serial.split(',')
                    serial.forEach(k => {
                        this.main.socket.send(JSON.stringify({ type: 'search', keyWord: k, range: [1] }))
                    })
                    this.main.log = `${constant.constantString.flagString.import}:${serial.length}`
                    return null
                }
                alert(constant.constantString.alertString.import_)
            },
            export_() {
                let text = this.filterRule.map(({ m }) => m.find(({ href, text: [desc] }) => /uncen/ig.test(desc) ? href : null)).map(um => um.href).join(';')
                navigator.clipboard.writeText(text)
                this.main.log = constant.constantString.alertString.export_
                return null

            },
            toggleItem(index) {
                this.instruction[index].expand = !this.instruction[index].expand;
                this.instruction.forEach((it, ix) => {
                    if (!(ix == index)) {
                        it.expand = false
                    }
                })
                return null
            },
            recordStart(evt) {
                this.chat.voiceChunks = []
                evt.target.classList.toggle('bgc')
                this.chat.mediaRecorder.start()
                this.pressTimer = setTimeout(() => {
                    this.chat.mediaRecorder.stop()
                }, 1000 * 60);
                return null
            },
            recordStop(evt) {
                this.chat.mediaRecorder.stop()
                evt.target.classList.toggle('bgc')
                return clearTimeout(this.pressTimer);
            },
            // can be optimized
            search() {
                // return null
                if (!this.status.isdone) return alert(constant.constantString.alertString.search)
                if (!this.main.socket.readyState == 3) return this.main.log = constant.constantString.flagString.socketDisconnect
                this.reflow = [];
                this.dynamiclist = [];
                this.status.isdone = false;
                this.overlay.proxies = false;
                this.description = (this.status.stars && 'star') || (this.status.genre && 'genre') || (this.status.studio && 'studio') || (this.status.label && 'label') || (this.status.director && 'director') || 'standard'
                let template = { type: 'search', stars: this.status.stars, genre: this.status.genre, onsunc: this.status.onsunc, director: this.status.director, studio: this.status.studio, label: this.status.label };
                if (this.main.keyWord.includes(constant.constantString.flagString.searchSplit)) {
                    let [keyWord, range] = this.main.keyWord.split(constant.constantString.flagString.searchSplit);
                    range = range.split(constant.constantString.flagString.searchPageSplit);
                    this.main.page = range.length > 1 ? range[1] : range[0]
                    this.sconf = { ...template, keyWord, range }
                    this.main.socket.send(JSON.stringify(this.sconf))
                    return null;
                }
                // duplicate
                this.main.page = 1;
                this.sconf = { ...template, keyWord: this.main.keyWord, range: [this.main.page] };
                this.main.socket.send(JSON.stringify(this.sconf))
                return null
            },
            async sleep(time) {
                return new Promise(r => {
                    setTimeout(() => {
                        r(null);
                    }, time);
                })
            },
            async loadView(item) {
                this.main.log = item.n
                this.status.isdone = false
                let view = (await fetch(`${constant.resourceRouter.views}${item.n}`).then(resp => resp.text()));
                this.main.log = `${item.n}${constant.constantString.flagString.logFormat}${view}`
                vm.$set(item, 'v', parseInt(view))
                this.main.log = constant.constantString.flagString.done
                this.status.isdone = true
                return null
            },
            async loadViews() {
                if (!this.dynamiclist.length) return null;
                let queueView = []
                this.main.log = this.filterRule.length
                this.status.isdone = false;
                let fragment = this.snippetArray(this.filterRule, constant.snippet.views)
                for (let i = 0; i <= fragment.length - 1; i++) {
                    await this.sleep(constant.timer.viewsLoadDealy);
                    fragment[i].forEach(async (it, ix) => {
                        queueView.push(
                            (async () => {
                                if (!it?.['v'] || it.v == -1) {
                                    let view = (await fetch(`${constant.resourceRouter.views}${it.n}`).then(resp => resp.text()))
                                    this.main.log = `${it.n}${constant.constantString.flagString.logFormat}${view}`
                                    vm.$set(it, 'v', parseInt(view))
                                    return { n: it.n, view }
                                }
                            })()
                        )
                    })
                }
                Promise.allSettled(queueView).then((ps) => {
                    console.log(ps);
                    this.main.log = constant.constantString.flagString.done
                    this.status.isdone = true
                })
                return null
            },
            reflowBack(n, idx) {
                this.status.isdone = false
                this.main.socket.send(JSON.stringify({ type: 'search', keyWord: n, range: [1] }))
                return null
            },
            reflowList() {
                this.reflow.forEach(({ value: { n } }) => {
                    this.main.socket.send(JSON.stringify({ type: 'search', keyWord: n, range: [1] }))
                })
                return null
            },
            clearList() {
                return this.reflow = []
            },
            onlyPush(n, extra, idx) {
                this.dynamiclist.push({ n, ...extra, r: false })
                this.reflow.splice(idx, 1)
                return null
            },
            stop() {
                this.main.socket.send(JSON.stringify({ type: 'abort' }))
                return null
            },
            reset() {
                this.main.socket.close()
                location.href = location.origin
                localStorage.clear()
                return null
            },
            home(){
                location.href = location.origin
                return null
            },
            save() {
                let page = document.documentElement.outerHTML
                let url = URL.createObjectURL(new Blob([page], { type: 'text/html' }))
                let dl = document.createElement('a')
                dl.href = url
                dl.download = this.main.keyWord
                document.body.appendChild(dl)
                dl.click()
                document.body.removeChild(dl)
                return null
            },
            jumpLocation(v, f) {
                return location.href = `${location.origin}?v=${v}&f=${f.includes('star') ? `${f}s` : f}`
            },
            jumpTag(v) {
                this.pressTimer = setTimeout(() => {
                    let paths = new URL(v).pathname.split('/');
                    this.jumpLocation(paths[2], paths[1])
                }, constant.timer.jumpTagTimeout)
            },
            cancelJump() {
                return clearTimeout(this.pressTimer)
            },
            loadMorePage({ target }) {
                clearTimeout(this.throttled.scroll)
                this.throttled.scroll = setTimeout(() => {
                    let { clientHeight, scrollHeight, scrollTop } = target
                    let diff = scrollHeight - Math.ceil(scrollTop)
                    this.offset = Math.floor(scrollTop)
                    if (clientHeight - 2 <= diff && diff <= clientHeight + 2 && !this.throttled.load && this.status.isdone && this.dynamiclist.length) {
                        this.main.page++
                        this.main.socket.send(JSON.stringify({ ...this.sconf, range: [this.main.page] }))
                        this.status.isdone = false
                        this.throttled.load = setTimeout(() => {
                            this.throttled.load = null
                        }, constant.timer.morePageInterval)
                    }
                }, constant.timer.scrollThrottled);
                return null
            },
            snippetArray(arr, size) {
                let i, j; i = j = 0;
                const sliced = [];
                while (j <= arr.length) {
                    [j, i] = [i + size, j]
                    if (!(i == j)) {
                        sliced.push(arr.slice(i, j))

                    }
                }
                return sliced;
            },
            zoomPics({ i }) {
                this.preview.pics = i || []
                this.overlay.pics = i?.length && true
                return null
            },
            openSwipe(idx, { target }) {
                this.preview.picsIndex = idx
                this.preview.picsEl = target
                this.preview.picsEl.classList.add(constant.constantString.classString.swipe)
                setTimeout(() => {
                    this.preview.picsSwipe = !this.preview.picsSwipe
                }, 300);

            },
            closeSwipe() {
                this.preview.picsIndex = -1
                this.preview.picsSwipe = !this.preview.picsSwipe
                setTimeout(() => {
                    this.preview.picsEl.classList.remove(constant.constantString.classString.swipe)
                }, 100);
                return null
            },
            expandMagnet(m) {
                this.magnet = m
                this.overlay.magnet = m?.length && true
                return null
            },
            async updateBookmark(e, _data, action) {
                let { target: { children: [{ children: [polygon] }] } } = e
                let config = constant.bookmark[action]
                switch (action) {
                    case 'insert':
                        polygon.style.fill = config.color
                        this.main.socket.send(JSON.stringify({ type: 'INSERT', data: _data }))
                        _data.inserted = true
                        break;
                    case 'remove':
                        polygon.style.fill = config.color
                        this.main.socket.send(JSON.stringify({ type: 'REMOVE', data: _data.n }))
                        break;
                }
                await this.sleep(config.delay)
                polygon.style.display = 'none'
                this.flushBookMark()
                return null
            },

            async flushBookMark() {
                this.status.isdone = false;
                this.bookmark = await fetch(constant.resourceRouter.bookmark).then(resp => resp.json())
                return null
            },
            visibNav() {
                this.overlay.sidenav = true
                clearTimeout(this.throttled.nav)
                this.throttled.nav = setTimeout(() => {
                    this.overlay.sidenav = false
                }, constant.timer.visibilityNavBar);
                return null
            },
            connect() {
                console.log('connect');
                return new Promise(r => {
                    this.main.socket = new WebSocket(`${protocol.includes('https:') ? 'wss' : 'ws'}://${host}${constant.websocket.main}`)
                    this.main.socket.onopen = () => {
                        r(null)
                        console.log('WebSocket OPEN');
                        this.main.socket.addEventListener('message', async ({ data }) => {
                            let message = JSON.parse(data)
                            switch (message.type) {
                                case 'ping':
                                    let data = Date.now() - parseInt(message.data)
                                    this.main.socket.send(JSON.stringify({ type: 'pong', data }))
                                    this.main.heartbeat = data
                                    clearInterval(this.throttled.heartbeat)
                                    this.throttled.heartbeat = setInterval(() => {
                                        this.main.socket.close();
                                    }, constant.timer.heartbeatThrottled)
                                    break;
                                case 'LOG':
                                    this.main.log = `${message.data.n}<==>${message.data.c}`
                                    break;
                                case 'DONE':
                                    this.main.log = message.data.m;
                                    this.reflow = uniqueObjectsByKey([...this.reflow, ...message.data.reflow], 'n')
                                    this.status.isdone = true
                                    if (this.sconf?.keyWord) {
                                        // save history 
                                        localStorage.setItem(`${this.sconf?.keyWord}${constant.constantString.flagString._data}`, JSON.stringify({ ...vm._data, taglist: null, instruction: null, constant: null }))
                                        this.flushHistory()
                                    }
                                    break;
                                case 'ERROR':
                                    this.main.log = message.data.err
                                    break;
                                case 'START':
                                    this.main.log = message.data.m
                                    break;
                                case 'CENSORED':
                                    this.dynamiclist.push({ ...message.data, i: message.data.i.map(pi => ({ pt: pi, loaded: false })), gs: false, vs: false, inserted: false, })
                                    this.reflow.find(({ value: { n } }, idx) => (message.data.n == n) ? this.reflow.splice(idx, 1) : null)
                                    break;
                            }
                        })
                    };
                    this.main.socket.onclose = () => {
                        console.log('WebSocket CLOSE');
                        clearInterval(this.main.heartbeat)
                        if (this.main.needReconnect) {
                            setTimeout(this.connect, this.main.reconnectTimeout);
                        }

                    };
                    this.main.socket.onerror = (evt) => {
                        console.log('WebSocket ERROR');
                        //   this.main.needReconnect = false;
                        this.main.socket.close();
                    };

                })
            },

            scrollToTop(offset, behavior) {
                this.$refs.box.scrollTo({
                    top: offset || 0,
                    behavior
                });
                return null
            },
            loadNext() {
                if (this.status.isdone && this.sconf) {
                    this.main.page++
                    this.main.socket.send(JSON.stringify({ ...this.sconf, range: [this.main.page] }))
                    this.status.isdone = false;
                } else {
                    alert(constant.constantString.alertString.loadNext)
                }
                return null
            },
            filterCallback() {
                let conditions = [];
                !(this.main.select == 'NONE' && this.main.factor) || (conditions.push('(i.n?.toLocaleLowerCase()?.includes(this.main.factor))'));
                !(this.main.select == 'TIME' && (this.main.factor?.length == 4)) || (conditions.push('(i.d?.slice(0, 4) <= this.main.factor)'));
                !this.status.single || conditions.push('(i.s?.length || -1) <= 1');
                !(this.main.mode == 'censored') || conditions.push('i');
                !(this.main.mode == 'uncensored') || conditions.push('i.r');
                return conditions.join(` && `)
            },
            connectDetect() {
                setInterval(() => {
                    switch (this.main.socket.readyState) {
                        case this.main.socket.CONNECTING:
                            this.main.state = constant.websocket.connectState.connecting
                            break;
                        case this.main.socket.OPEN:
                            this.main.state = constant.websocket.connectState.open
                            break;
                        case this.main.socket.CLOSING:
                            this.main.state = constant.websocket.connectState.closing
                            break;
                        case this.main.socket.CLOSED:
                            this.main.state = constant.websocket.connectState.closed
                            break;
                    }
                }, constant.timer.connectDetect);
                return null
            },
            getTimeRange() {
                let hours = new Date().getHours()
                // return (8 <= hours && hours <= 17) ? 'day' : (18 <= hours && hours <= 24) ? 'night' : 'night'
                return (constant.themes.day.range[0] <= hours && hours <= constant.themes.day.range[1]) ? constant.themes.day.name : (constant.themes.night.range[0] <= hours && hours <= constant.themes.night.range[1]) ? constant.themes.night.name : constant.themes.normal.name
            },
            flexible() {
                let { height, width } = document.documentElement.getBoundingClientRect()
                // document.documentElement.style.fontSize = (360 <= width && height <= 740) ? '14px' : '16px'
                document.documentElement.style.fontSize = (360 >= width) ? constant.flexibleSize.small : constant.flexibleSize.big
                return null
            },
            cssTemplate(cssObject) {
                return Object.keys(cssObject).map(key => {
                    let cssStatements = [];
                    for (const [k, v] of Object.entries(cssObject[key])) {
                        cssStatements.push(`${k}:${v};`)
                    }
                    return `${key}{${cssStatements.join('')}}`
                }).join('')
            },
            thumbSucess({target}){
                this.$nextTick(()=>{
                    target.classList.add('class','loaded')
                })
                return null
            },
            initVueOption($data, data, overWrite = {}) {
                let _data = {
                    ...data,
                    ...overWrite
                }
                for (const key in _data) {
                    $data[key] = _data[key]
                }
                return null
            },
            inintObserver() {
                // 元素可视状态的变化都将执行IntersectionObserver回调
                this.observer = new IntersectionObserver((entries, observer) => {
                    // console.log(`active:${entries.length}`);
                    //可能出现多个监听元素同时出现
                    entries.forEach(async ({ target, isIntersecting }) => {
                        // console.log(target, isIntersecting);
                        if (isIntersecting) {
                            !(target.src == target.dataset.src) && target.setAttribute('src', target.dataset.src)
                            if (this.status.autoview && !this.filterRule[target.dataset.i]['v']) {
                                this.main.log = target.dataset.n
                                const view = await fetch(`${constant.resourceRouter.views}${target.dataset.n}`).then(resp => resp.text());
                                vm.$set(this.filterRule[target.dataset.i], 'v', parseInt(view))
                            }
                            observer.unobserve(target)
                        }
                    });
                }, {
                    rootMargin: '0px 0px 0px 0px',
                    threshold: 0.5
                })
            },
            chatConnect() {
                return new Promise(r => {
                    this.chat.socket = new WebSocket(`${protocol.includes('https:') ? 'wss' : 'ws'}://${host}${constant.websocket.chat}`)
                    this.chat.socket.onopen = () => {
                        r(null)
                        console.log('WebSocket OPEN');
                        this.chat.socket.addEventListener('message', async ({ data }) => {
                            console.log(data);
                            if (data instanceof Blob) {
                                const remoteAudioBlob = new Blob([data], { type: 'audio/wav' });
                                const audioBin = URL.createObjectURL(remoteAudioBlob);
                                const audioElement = new Audio(audioBin);
                                audioElement.setAttribute('controls', 1)
                                audioElement.setAttribute('autoplay', 1)
                                document.body.appendChild(audioElement);
                                return null
                            }
                            let message = JSON.parse(data);
                            switch (message.type) {
                                case 'AUTH':
                                    this.chat.session = message.UUID
                                    // localStorage.setItem('UUID',message.UUID)
                                    break;
                                case 'ONLINE':
                                    this.chat.group = message.group
                                    break;
                                case 'TEXT':
                            }
                        })
                    };
                    this.chat.socket.onclose = () => {
                        console.log('WebSocket CLOSE');
                        // if (this.main.needReconnect) {
                        // setTimeout(this.chatConnect, reconnectTimeout);
                        // }
                    };
                    this.chat.socket.onerror = (evt) => {
                        console.log('WebSocket ERROR');
                        //   this.main.needReconnect = false;
                        this.chat.socket.close();
                    };
                })
            },
        },
        filters: {
            actorTotal(v) {
                return (!(v = v?.length)) ? -1 : v
            },
            extract(v, o) {
                v = (v && v.match(/\/(\w+)$/)[1]) ?? v
                return o ? o[v] : v
            },
            getProgress(v) {
                return v?.filter(({ loaded }) => (loaded == true))?.length || 0
            },
            purgeSuffix(v) {
                return v?.replace(constant.constantString.flagString._data, '')
            }
        },
        directives: {
            // v-for > v-bind 
            lazyLoadOberver: {
                bind: (el, binding, vnode) => {
                    // vnode.context.observer.observe(el)
                },
                inserted: (el, binding, vnode) => {
                    console.log(el.dataset.i);
                    console.log(t++);
                    // vnode.context.observer.observe(el)
                }
            }
        },
        watch: {
            //push > computed > watch > list render(dom)
            filterRule: {
                async handler() {
                    // console.log(this.$refs.monitor.length);//n
                    // dom渲染完成之后，新的事件循环之前(因涉及到dom操作，在list render之前无法获取dom，所以在nextTick中执行上一次watch的回调时的数据(此时dom已经渲染完成可被获取)
                    await this.$nextTick(() => {
                        // console.log(this.$refs.monitor.length);//n+1
                        this.$refs.monitor?.forEach(this.observer.observe.bind(this.observer))
                    })
                },
                deep: false
            },
            "main.factor": {
                handler(v) {
                    return this.main.factor = v?.length >= 4 ? this.main.factor.slice(0, 4) : v
                },
                deep: false
            },
            "main.select": {
                handler(v) {
                    this.main.factor = ''
                }
            },
            "status.stars": {
                handler(ic) {
                    ic ? this.status.genre = !ic : null
                }
            },
            "status.genre": {
                handler(ic) {
                    ic ? this.status.stars = !ic : null
                }
            },
            "preview.picsIndex": {
                handler(idx) {
                    this.preview.picsIndex = idx >= this.preview.pics?.length ? 0 : (idx < 0 ? this.preview.pics?.length - 1 : idx);
                },
                deep: false
            },
            "fragment.idx": {
                handler(v) {
                    this.fragment.idx = v > this.pageTotal ? 1 : (v < 1 ? this.pageTotal : v);
                },
                deep: false
            },
            "overlay.pics": {
                handler(v) {
                    v ? this.overlay.reflow = !v : null
                },
                deep: false
            },
            "manual.bookmark": {
                async handler(v) {
                    v ? this.flushBookMark() : this.status.isdone = true
                }
            },
            "main.error": {
                handler(v) {
                    this.overlay.error = true
                    setTimeout(() => {
                        this.main.error = ''
                    }, constant.timer.errorMessageTimeout);
                }
            }


        },
        computed: {
            // render list
            filterRule() {
                // Function socpe window
                // let cb = Function(`return function(i){ console.log(this); return ${this.filterCallback()}}`)().bind(this)
                // generator funcation template
                let cb = Function(`return i=>${this.filterCallback()}`).call(this)
                if (this.manual.bookmark) {
                    return this.bookmark.filter(cb)
                }
                let reverse = this.main.factor?.includes(constant.constantString.flagString.atniSortFlag) ?? false
                switch (this.main.select) {
                    case "NONE":
                        return this.dynamiclist.filter(cb)
                    case "TIME":
                        return sorted.call(this.dynamiclist.filter(cb), 'd', x => new Date(x).getTime(), reverse)
                    case "VIEW":
                        return sorted.call(this.dynamiclist.filter(cb), 'v', x => x, reverse)
                }
            },
            sliceReflow() {
                return this.reflow.slice(this.fragment.size * (this.fragment.idx - 1), this.fragment.idx * this.fragment.size)
            },
            pageTotal() {
                let len = (this.reflow.length % this.fragment.size)
                let total = (Math.floor(this.reflow.length / this.fragment.size))
                return len ? total + 1 : total
            },
            switchTheme() {
                let style = document.createElement('style')
                let color = constant.themes[this.theme]['color'];
                let strokeWidth = constant.themes[this.theme]['strokeWidth'];
                let bgcColor = constant.themes[this.theme]['backgroundColor'];
                style.textContent = this.cssTemplate({
                    "*": {
                        "color": color,
                        "--br-color": color,
                        "--hv-color": bgcColor,
                        "background-color": bgcColor,
                        "visibility": "visible"
                    },
                    ".info-product polygon": {
                        "stroke": color,
                        "stroke-width": strokeWidth
                    },
                })
                document.body.append(style)
            },
            async chatDeviceRequest() {
                console.log('init');
                // await this.chatConnect()
                let stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                let devices = await navigator.mediaDevices.enumerateDevices()
                let constraints = await navigator.mediaDevices.getSupportedConstraints();
                let deviceName = navigator.userAgent;
                let tracks = stream.getAudioTracks()
                tracks.forEach(track => {
                    console.log(track);
                    let trackInfo = { id: track.id, kind: track.kind, label: track.label, muted: track.muted, enabled: track.enabled, readyState: track.readyState }
                    // console.log(track.getCapabilities());
                    // console.log(track.getSettings());
                    // console.log(track.getConstraints());
                })
                this.chat.mediaRecorder = new MediaRecorder(stream);
                this.chat.mediaRecorder.ondataavailable = (e) => {
                    (e.data.size > 0) ? this.chat.voiceChunks.push(e.data) : null
                }
                this.chat.mediaRecorder.onstop = async () => {
                    console.log(this.chat.voiceChunks);
                    const audioBlob = new Blob(this.chat.voiceChunks, { type: 'audio/wav' });
                    this.chat.socket.send(await audioBlob.arrayBuffer())
                };
                return null
                // this.chat.socket.send(JSON.stringify({ type: 'CODES', deviceName, constraints, devices, tracks, ratio: this.chat.mediaRecorder.audioBitsPerSecond }))
            }

        },
        async created() {
            // init errorHandler
            Vue.config.errorHandler = (err, vm, info) => {
                console.log('Vue Error:', err);
                console.log('Vue Error Info:', info);
                this.main.error = err
            };
            // init Vue Option
            let data = JSON.parse(localStorage.getItem(`${v || ''}${constant.constantString.flagString._data}`) ?? '{}')
            this.initVueOption(this.$data, data, constant.defaultStroageMeger)
            // init observer
            this.inintObserver()
            // init websocket
            await this.connect();
            this.connectDetect()
            // init query data
            if (v) {
                this.main.keyWord = v
                this.status[f] = true;
                // relation websockert 
                !(this.dynamiclist.length) ? this.search() : null
            }
        },
        async mounted() {
            // init rem
            this.flexible()
            window.addEventListener('resize', this.flexible)
            // init theme
            this.theme = this.getTimeRange()
            this.scrollToTop(this.offset, constant.constantString.flagString.scrollBehavior)
            // init resource
            this.proxies = this.snippetArray((await fetch(constant.resourceRouter.proxies).then(resp => resp.json())).slice(constant.constantNumber.passProxy), constant.snippet.proxy)
            this.taglist = await fetch(constant.resourceRouter.tag).then(resp => resp.json())
            this.instruction = await fetch(constant.resourceRouter.instruction).then(resp => resp.json())
            // this.constant = await fetch('/constant').then(resp => resp.json())
            this.history = Object.keys(localStorage).filter(h => h != constant.constantString.flagString._data);
            new IntersectionObserver((entries, observer) => {
                entries.forEach(async entry => {
                    entry.isIntersecting ?
                        this.overlay.isfloat = false :
                        this.overlay.isfloat = true
                })
            }, {
                rootMargin: '10px 0px 0px 0px',
                threshold: 1
            }).observe(this.$refs.log)
        },
        updated() {
            clearTimeout(this.throttled.update)
            this.throttled.update = setTimeout(() => {
                if (this.main.socket) {
                    // save current 解决 v 存档被覆盖
                    localStorage.setItem(`${(v && (v == this.sconf.keyWord) && v) || ''}${constant.constantString.flagString._data}`, JSON.stringify({ ...vm._data, taglist: null, instruction: null }))
                }
            }, constant.timer.updateHookThrottled);
        },
    })
})()