// import constant from '/constant.json' assert { type: 'json' };
(async () => {
    let { protocol, host, search, origin } = location
    let { v, f } = Object.fromEntries(new URLSearchParams(search))
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
                serial: false,
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
                actors: constant.dataOptionsNomarl.main.actors,
                log: constant.dataOptionsNomarl.main.log,
                select: constant.dataOptionsNomarl.main.select,
                mode: constant.dataOptionsNomarl.main.mode,
                state: constant.dataOptionsNomarl.main.state,
                error: '',
                factor: '',
                serial: '',
                keyWord: '',
                heartbeat: null,
                slideRate: constant.dataOptionsNomarl.main.slideRate,
                socket: null,
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
                deny: false,
                onunc: false,
            },
            preview: {
                pics: [],
                picsIndex: -1,
                picsEl: null,
                carouselEl: null,
                picsSwipe: false,
                picsSwipeSize: 0,
                desktopSwipeScale: 2,
                picsFailed: constant.domain.picsFailed,
                touches: 0,
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
            debounce: {
                nav: null,
                slide: null,
                scroll: null,
                update: null,
                observer: null,
                heartbeat: null,
                swipeInterval: null,
                prefixScroll: null,
            },
            throttled: {
                load: null,
                press: null,
                slowSwipe: null,
            },
            demoDebug: {
                name: constant.demoDebug.name,
                enable: constant.demoDebug.enable,
                magnet: constant.demoDebug.magnet,
                genre: constant.demoDebug.genre,
                single: constant.demoDebug.single,
                vendor: constant.demoDebug.vendor,
                actor: constant.demoDebug.actor,
                actorOrigin: constant.demoDebug.actorOrigin,
                previewOrigin: constant.demoDebug.previewOrigin
            },
            deviceMeta: {
                viewWidth: 0,
                viewHeight: 0,
                isMobile: false,
                isTablet: false,
                isDesktop: false,
                destopExpandWScale: 2,
                destopExpandHScale: 1.5,
                os: null
            },
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
                    this.status.isdone = true
                    return null
                }
                alert(constant.constantString.alertString.selectProxy)
            },
            async updateProxy() {
                this.overlay.reflow = false;
                this.main.log = await fetch(constant.resourceRouter.updateProxy).then(r => r.text());
            },
            flushHistory() {
                this.overlay.history = this.history.length
                /*  this.$nextTick(() => {
                     let { main, history, } = this.$refs
                     history.style.height = `${main.getBoundingClientRect().height}px`
                 }) */
                this.history = Object.keys(localStorage).filter(h => h != constant.constantString.flagString._data);
                return null
            },
            loadHistory(key) {
                let data_ = JSON.parse(localStorage.getItem(key))
                this.jumpLocation(data_['sconf']['keyWord'], data_['description'])
                return null
            },
            autoScroll({ touches: [point] }) {
                this.debounce.prefix = setTimeout(() => {
                    this.offset = Math.floor(this.$refs.box.scrollTop)
                    let up = point['clientX'] >= window.innerHeight >> 2
                    cancelAnimationFrame(this.debounce.slide)
                    let animateScroll = () => {
                        this.offset += (up ? this.main.slideRate : -this.main.slideRate)
                        this.scrollToTop(null, constant.constantString.flagString.autoScrollBehavior)
                        this.debounce.slide = requestAnimationFrame(animateScroll)
                    }
                    animateScroll()
                }, constant.timer.invokeAutoScroll)
            },
            stopScroll() {
                clearTimeout(this.debounce.prefix)
                cancelAnimationFrame(this.debounce.slide)
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
                console.log(evt);
                evt.target.classList.toggle('bgc')
                this.chat.mediaRecorder.start()
                this.throttled.press = setTimeout(() => {
                    this.chat.mediaRecorder.stop()
                }, 1000 * 60);
                return null
            },
            recordStop(evt) {
                console.log('sss');
                this.chat.mediaRecorder.stop()
                evt.target.classList.toggle('bgc')
                return clearTimeout(this.throttled.press);
            },
            // can be optimized
            search() {
                // return null
                if (!this.status.isdone) return alert(constant.constantString.alertString.search)
                if (!this.main.socket.readyState == 3) return this.main.log = constant.constantString.flagString.socketDisconnect
                this.reflow = [];
                this.dynamiclist = [];
                this.status.isdone = false;
                this.overlay.history = false;
                this.description = (this.status.stars && 'star') || (this.status.genre && 'genre') || (this.status.studio && 'studio') || (this.status.label && 'label') || (this.status.director && 'director') || 'standard'
                let template = { type: 'search', stars: this.status.stars, genre: this.status.genre, onsunc: this.status.onsunc, director: this.status.director, studio: this.status.studio, label: this.status.label, deny: this.status.deny };
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
            searchGenre(k) {
                this.main.keyWord = k
                this.search()
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
                this.status.isdone = false;
                let queueView = []
                let pending = this.filterRule.filter(({ v }) => !v)
                this.main.log = pending.length
                let fragment = this.snippetArray(pending, constant.snippet.views)
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
                    // console.log(ps);
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
                localStorage.clear()
                this.main.socket.close()
                location.href = origin
                return null
            },
            home() {
                location.href = origin
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
                return location.href = `${origin}?v=${v}&f=${f.includes('star') ? `${f}s` : f}`
            },
            jumpTag(v) {
                this.throttled.press = setTimeout(() => {
                    let paths = new URL(v).pathname.split('/');
                    this.jumpLocation(paths[2], paths[1])
                }, constant.timer.jumpTagTimeout)
            },
            cancelJump() {
                return clearTimeout(this.throttled.press)
            },
            // closure
            debouncefn(fu, delay) {
                let timerID;
                return function (...args) {
                    clearTimeout(timerID);
                    timerID = setTimeout(() => {
                        fu(...args);
                    }, delay);
                };
            },
            throttledfn(fn, delay) {
                let timerID = null;
                return function (...args) {
                    if (!timerID) {
                        fn(...args);
                        timerID = setTimeout(() => {
                            timerID = null;
                        }, delay);
                    }
                };
            },
            loadMorePage({ target }) {
                clearTimeout(this.debounce.scroll)
                this.debounce.scroll = setTimeout(() => {
                    let { clientHeight, scrollHeight, scrollTop } = target
                    let diff = scrollHeight - Math.ceil(scrollTop)
                    this.offset = Math.floor(scrollTop)
                    if (Math.abs(diff - clientHeight) <= 2 && !this.throttled.load && this.status.isdone && this.dynamiclist.length && !this.manual.bookmark) {
                        this.main.page++
                        this.status.isdone = false
                        this.main.socket.send(JSON.stringify({ ...this.sconf, range: [this.main.page] }))
                        // 防止在加载开始之前再次触发
                        this.throttled.load = setTimeout(() => {
                            this.throttled.load = null
                        }, constant.timer.morePageInterval)
                    }
                }, constant.timer.scrollDebounce);
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
                this.overlay.pics = i.length
                return null
            },
            async openSwipe(idx, { target }) {
                this.preview.picsIndex = idx
                this.preview.picsEl = target
                this.preview.picsEl.classList.add(constant.constantString.classString.swipe)
                await this.sleep(constant.timer.openSwipeTimeout)
                this.preview.picsSwipe = !this.preview.picsSwipe

            },
            async closeSwipe() {
                this.preview.picsIndex = -1
                this.preview.picsSwipe = !this.preview.picsSwipe
                await this.sleep(constant.timer.closeSwipeTimeout)
                this.preview.picsEl.classList.remove(constant.constantString.classString.swipe)
                return null
            },
            nextSwipePics() {
                let el = this.preview.carouselEl
                el.style.transitionDuration = `${constant.timer.swipeTransitionTimeout}ms`
                if (!el.lock) {
                    el.lock = true
                    this.preview.picsIndex++
                    this.$nextTick(() => {
                        this.debounce.swipeInterval = setTimeout(() => {
                            if (this.preview.picsIndex == (vm.preview.pics.length + 1)) {
                                el.style.transitionDuration = '0s'
                                this.preview.picsIndex = 1
                            }
                            el.lock = false
                        }, constant.timer.swipeTransitionTimeout);
                    })
                }
                return null

            },
            prevSwipePics() {
                let el = this.preview.carouselEl
                el.style.transitionDuration = `${constant.timer.swipeTransitionTimeout}ms`
                if (!el.lock) {
                    el.lock = true
                    this.preview.picsIndex--
                    this.$nextTick(() => {
                        this.debounce.swipeInterval = setTimeout(() => {
                            if (this.preview.picsIndex == 0) {
                                el.style.transitionDuration = '0s'
                                this.preview.picsIndex = this.preview.pics.length
                            }
                            el.lock = false
                        }, constant.timer.swipeTransitionTimeout);
                    })
                }
            },
            expandMagnet(m) {
                this.magnet = m
                this.overlay.magnet = m?.length
                return null
            },
            async updateBookmark(_data, action) {
                this.main.log = action
                let config = constant.bookmark[action]
                switch (action) {
                    case 'insert':
                        this.main.socket.send(JSON.stringify({ type: 'INSERT', data: _data }))
                        break;
                    case 'remove':
                        this.main.socket.send(JSON.stringify({ type: 'REMOVE', data: _data.n }))
                        break;
                }
                _data.active = false
                await this.sleep(config.delay)
                this.flushBookMark()
                return null
            },

            async flushBookMark(lock) {
                lock && (this.status.isdone = !lock)
                this.bookmark = await fetch(constant.resourceRouter.bookmark).then(resp => resp.json())
                return null
            },
            visibNav() {
                this.overlay.sidenav = true
                clearTimeout(this.debounce.nav)
                this.debounce.nav = setTimeout(() => {
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
                                    clearInterval(this.debounce.heartbeat)
                                    this.debounce.heartbeat = setInterval(() => {
                                        this.main.socket.close();
                                    }, constant.timer.heartbeatDetectCycle)
                                    break;
                                case 'LOG':
                                    this.main.log = `${message.data.n}<==>${message.data.c}`
                                    break;
                                case 'DONE':
                                    this.main.log = message.data.m;
                                    message.data.reflow.length ? this.reflow = uniqueObjectsByKey([...this.reflow, ...message.data.reflow], 'n') : null
                                    this.status.isdone = true
                                    if (this.sconf?.keyWord) {
                                        // save history 
                                        localStorage.setItem(`${this.sconf?.keyWord}${constant.constantString.flagString._data}`, JSON.stringify({ ...vm._data, taglist: null, instruction: null, constant: null, bookmark: null }))
                                    }
                                    break;
                                case 'ERROR':
                                    this.main.log = message.data.err
                                    break;
                                case 'START':
                                    this.main.log = message.data.m
                                    break;
                                case 'CENSORED':
                                    let inject = { ...message.data, i: message.data.i.map(pi => ({ pt: pi, loaded: false })), gs: false, vs: false, as: false, active: false }
                                    this.dynamiclist.push(inject)
                                    this.reflow.length && this.reflow.find(({ value: { n } }, idx) => (message.data.n == n) ? this.reflow.splice(idx, 1) : null)
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
                    top: offset || this.offset || 0,
                    behavior: behavior || constant.constantString.flagString.scrollBehavior
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
                !(this.main.select == 'TIME' && (this.main.factor?.length == 4)) || (conditions.push('(i.d?.slice(0, 4) >= this.main.factor)'));
                !this.status.single || conditions.push('(i.s?.length || -1) <= this.main.actors');
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
            initTheme() {
                let hours = new Date().getHours()
                // return (8 <= hours && hours <= 17) ? 'day' : (18 <= hours && hours <= 24) ? 'night' : 'night'
                this.theme = (constant.themes.day.range[0] <= hours && hours <= constant.themes.day.range[1]) ? constant.themes.day.name : (constant.themes.night.range[0] <= hours && hours <= constant.themes.night.range[1]) ? constant.themes.night.name : constant.themes.normal.name
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
            thumbSucess({ target }) {
                target.classList.add(constant.constantString.classString.loaded)

                return null
            },
            //onloadstart 
            thumbFailed() {

            },
            listenTouches() {
                window.addEventListener('touchstart', (e) => {
                    this.preview.touches = e.touches.length
                    e.touches.length >= 2 && e.preventDefault();
                }, { passive: false });
            },
            listenResize() {
                window.addEventListener('resize', this.debouncefn(this.initDeviceMeta, constant.timer.initSwipeDebounce))
            },
            initDeviceMeta() {
                // offsetH/W w+p+b+s ,clientH/W, w+p  windowH/W w+p+b+s  rectH/W w+p+b
                const platform = navigator.platform.toLowerCase();
                const userAgent = navigator.userAgent.toLowerCase();
                //  const { width } = document.documentElement.getBoundingClientRect()
                this.deviceMeta.os = platform.includes('win') && 'Windows' || platform.includes('mac') && 'MacOS' || platform.includes('linux') && 'Linux' || 'Unknown'
                this.deviceMeta.isMobile = /mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent) || ('ontouchstart' in window || navigator.maxTouchPoints || false);
                this.deviceMeta.isTablet = /ipad|android/i.test(userAgent) && !this.deviceMeta.isMobile;
                this.deviceMeta.isDesktop = !this.deviceMeta.isMobile && !this.deviceMeta.isTablet;
                // this.$refs.box.style.height = `${visualViewport.height}px`
                this.deviceMeta.viewWidth = window.innerWidth
                this.deviceMeta.viewHeight = window.innerHeight;
                this.$refs.box.style.height = `${this.deviceMeta.viewHeight}px`;
                document.documentElement.style.fontSize = (constant.snippet.smallScreenWidth >= this.deviceMeta.viewWidth) ? constant.flexibleSize.small : constant.flexibleSize.big;
                // this.main.error = this.deviceMeta
                // console.log( this.deviceMeta);
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
                        } else target.classList.contains(constant.constantString.classString.loaded) && target.classList.remove(constant.constantString.classString.loaded)

                    });
                }, {
                    rootMargin: '0px 0px 0px 0px',
                    threshold: 0
                })
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
            },
            chatConnect() {
                return new Promise(r => {
                    // this.chatDeviceRequest()
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
                return v?.length || -1
            },
            extract(v, o) {
                v = (v.match(/\/(\w+)$/)?.[1]) ?? v
                return o ? o?.[v] ?? v : v
            },
            getProgress(v) {
                return v?.filter(({ loaded }) => (loaded == true))?.length ?? 0
            },
            purgeSuffix(v) {
                return v?.replace(constant.constantString.flagString._data, '')
            },
            uniqueKey(v) {
                return `${Date.now()}`
            },
            lastSuffix(v, len) {
                return (v >= len - constant.snippet.endFlag) && `${v}${constant.constantString.flagString.endFlag}` || v

            }
        },
        directives: {
            // v-for > v-bind 
            lazyLoadOberver: {
                bind(el, binding, vnode) {
                    // vnode.context.observer.observe(el)
                },
                inserted(el, binding, vnode) {
                    console.log(el.dataset.i);
                    console.log(t++);
                    // vnode.context.observer.observe(el)
                }
            },
            pressAutoScroll: {
                bind(el, binding) {
                    let vm = binding.value
                    el.__stopScroll = () => {
                        clearTimeout(vm.debounce.prefix)
                        cancelAnimationFrame(vm.debounce.slide)
                    }
                    el.__autoScroll = ({ touches: [point] }) => {
                        vm.debounce.prefix = setTimeout(() => {
                            vm.offset = Math.floor(vm.$refs.box.scrollTop)
                            let up = point['clientX'] >= window.innerHeight >> 2
                            cancelAnimationFrame(vm.debounce.slide)
                            let animateScroll = () => {
                                vm.offset += (up ? vm.main.slideRate : -vm.main.slideRate)
                                vm.scrollToTop(null, constant.constantString.flagString.autoScrollBehavior)
                                vm.debounce.slide = requestAnimationFrame(animateScroll)
                            }
                            animateScroll()
                        }, constant.timer.invokeAutoScroll)
                    }
                    el.addEventListener("touchstart", el.__autoScroll, { passive: true })
                    el.addEventListener("touchmove", el.__stopScroll, { passive: true })
                    el.addEventListener("touchend", el.__stopScroll)
                    el.addEventListener("touchcancel", el.__stopScroll)
                },
                unbind(el) {
                    el.removeEventListener("touchstart", el.__autoScroll)
                    el.removeEventListener("touchmove", el.__stopScroll)
                    el.removeEventListener("touchend", el.__stopScroll)
                    el.removeEventListener("touchcancel", el.__stopScroll)
                }
            },
            swipeCarouselPics: {
                bind(el, binding) {
                    let vm = binding.value
                    el.lock = false;
                    el.enterSwipe = (deltaX, currentX) => {
                        clearTimeout(vm.throttled.slowSwipe)
                        // clearTimeout(vm.debounce.swipeInterval)
                        el.style.transitionDuration = `${constant.timer.swipeTransitionTimeout}ms`
                        if (Math.abs(deltaX) >= (((el.swipeMode == 'fast') && el.threshold) || ((el.swipeMode == 'slow') && el.slowSwipe))) {
                            if (!((vm.preview.picsIndex == (vm.preview.pics.length + 1)) && (vm.preview.picsIndex == 0))) {
                                deltaX > 0 ? vm.preview.picsIndex++ : vm.preview.picsIndex--
                            }
                        }
                        vm.$nextTick(() => {
                            vm.debounce.swipeInterval = setTimeout(() => {
                                if (el.picsChangeIndex = (((vm.preview.picsIndex == vm.preview.pics.length + 1) && (deltaX >= 0)) && 1) || (((vm.preview.picsIndex == 0) && (deltaX <= 0)) && vm.preview.pics.length)) {
                                    el.style.transitionDuration = '0s'
                                    vm.preview.picsIndex = el.picsChangeIndex
                                }
                                el.lock = false
                            }, constant.timer.swipeTransitionTimeout);
                        })
                        el.style.transform = `translate3d(${currentX}px,0,0)`
                    }
                    el.initPicsSwipeSize = () => {
                        vm.preview.picsSwipeSize = -el.getBoundingClientRect().width
                        el.slowSwipe = Math.abs(vm.preview.picsSwipeSize / 2)
                    }
                    // moblie
                    vm.preview.carouselEl = el
                    vm.$nextTick(el.initPicsSwipeSize)
                    window.addEventListener('resize', vm.debouncefn(el.initPicsSwipeSize, constant.timer.initSwipeDebounce))
                    el.threshold = constant.snippet.swipeThreshold
                    el.swipeMode = 'fast'
                    el.__handleTouchStart = ({ touches: [point] }) => {
                        el.touchDeltaX = 0
                        el.touchStartX = 0
                        el.style.transitionDuration = '0s'
                        el.touchCurrentX = vm.preview.picsSwipeSize * vm.preview.picsIndex;
                        el.touchStartX = point['clientX']
                        el.swipeMode = 'fast'
                        clearTimeout(vm.throttled.slowSwipe)
                        vm.throttled.slowSwipe = setTimeout(() => {
                            el.swipeMode = 'slow'
                        }, constant.timer.swipeSlowTimeout);

                    }
                    el.__handleTouchMove = ({ touches: [point] }) => {
                        if (!el.lock) {
                            el.touchDeltaX = el.touchStartX - point['clientX'];
                            el.style.transform = `translate3d(${el.touchCurrentX - el.touchDeltaX}px,0,0)`
                        }
                    }
                    el.__handleTouchEnd = () => {
                        if (!el.lock) {
                            el.lock = true
                            el.enterSwipe(el.touchDeltaX, el.touchCurrentX)
                        }
                    }
                    el.addEventListener('touchstart', el.__handleTouchStart, { passive: true });
                    el.addEventListener('touchmove', el.__handleTouchMove, { passive: true });
                    el.addEventListener('touchend', el.__handleTouchEnd);
                    // desktop
                    el.__handleMouseDown = (e) => {
                        el.MouseDeltaX = 0
                        el.MouseStartX = 0
                        el.style.transitionDuration = '0s'
                        el.MouseCurrentX = vm.preview.picsSwipeSize * vm.preview.picsIndex;
                        el.MouseStartX = e['clientX']
                        el.addEventListener('mousemove', el.__handleMouseMove);
                        el.addEventListener('mouseleave', el.__handleMouseUpAndLeave);
                        el.swipeMode = 'fast'
                        vm.throttled.slowSwipe = setTimeout(() => {
                            el.swipeMode = 'slow'
                        }, constant.timer.swipeSlowTimeout);
                    }
                    el.__handleMouseMove = (e) => {
                        if (!el.lock) {
                            el.MouseDeltaX = el.MouseStartX - e['clientX'];
                            el.style.transform = `translate3d(${el.MouseCurrentX - el.MouseDeltaX}px,0,0)`
                        }
                    }
                    el.__handleMouseUpAndLeave = () => {
                        el.removeEventListener('mousemove', el.__handleMouseMove)
                        el.removeEventListener('mouseleave', el.__handleMouseUpAndLeave)
                        if (!el.lock) {
                            el.lock = true
                            el.enterSwipe(el.MouseDeltaX, el.MouseCurrentX)
                        }
                    }
                    el.addEventListener('mousedown', el.__handleMouseDown);
                    el.addEventListener('mouseup', el.__handleMouseUpAndLeave);
                },
                unbind(el) {
                    window.removeEventListener('resize', el.initPicsSwipeSize)
                    el.removeEventListener('mousedown', el.__handleMouseDown);
                    el.removeEventListener('mouseup', el.__handleMouseUpAndLeave);
                    el.removeEventListener('touchstart', el.__handleTouchStart);
                    el.removeEventListener('touchmove', el.__handleTouchMove);
                    el.removeEventListener('touchend', el.__handleTouchEnd);
                },
            },
            swipeToReveal: {
                bind(el, binding) {
                    let vm = binding.value;
                    let data_ = binding.arg
                    // directive在渲染中绑定，需要等待渲染完成获取
                    vm.$nextTick(() => {
                        let { width, height } = el.getBoundingClientRect()
                        el.__halfX = width / 2
                        el.__revealY = height
                        el.__halfY = el.__revealY / 2
                    })
                    el.__handleTouchStart = ({ touches: [point] }) => {
                        // Not updated due to changes
                        vm.filterRule.forEach(i => i.active = false)
                        // keep updateBookmark available
                        data_.active = true
                        el.touchDeltaX = 0
                        el.touchStartX = 0
                        el.touchDeltaY = 0
                        el.touchStartY = 0
                        el.touchCurrentX = 0
                        el.revealing = false
                        el.style.transitionDuration = '0s'
                        el.touchStartX = point['clientX'];
                        el.touchStartY = point['clientY'];
                    }
                    el.__handleTouchMove = (e) => {
                        // e.preventDefault()
                        if (vm.preview.touches == 1) {
                            el.touchDeltaX = el.touchStartX - e.touches[0]['clientX'];
                            el.touchDeltaY = el.touchStartY - e.touches[0]['clientY'];
                            el.slope = el.touchDeltaY / el.touchDeltaX
                            // vm.main.log = el.slope
                            if ((Math.abs(el.slope) <= constant.snippet.tiltFactor) || el.revealing) {
                                e.preventDefault()
                                vm.$refs.box.style.overflowY = "hidden"
                                if (!el.isOpen && (Math.abs(el.touchDeltaX) <= el.__revealY) && (el.touchDeltaX > 0)) {
                                    el.style.transform = `translate3d(${-el.touchDeltaX}px,0,0)`
                                    el.revealing = true
                                }
                                // limit offset direction 
                                if (el.isOpen && (el.__revealY >= Math.abs(el.touchDeltaX)) && (el.touchDeltaX < 0)) {
                                    // limit offset distance 
                                    vm.main.error = 'back'
                                    el.style.transform = `translate3d(${-el.__revealY - el.touchDeltaX}px,0,0)`
                                    el.revealing = true
                                }
                            }

                        }
                    }
                    el.__handleTouchEnd = () => {
                        vm.$refs.box.style.overflowY = "scroll"
                        el.style.transitionDuration = `${constant.timer.revealTransitionTimeout}ms`;
                        if (!el.isOpen && (Math.abs(el.touchDeltaX) >= el.__halfY) && (el.touchDeltaX >= 0) && (Math.abs(el.slope) <= constant.snippet.tiltFactor)) {
                            // if (!el.isOpen && (Math.abs(el.touchDeltaX) >= el.__halfY) && (el.touchDeltaX >= 0) && (Math.abs(el.touchDeltaY) <= el.thresholdY)) {
                            el.style.transform = `translate3d(${-el.__revealY}px,0,0)`
                            el.isOpen = true
                            // el.openOffset = Number.parseInt(el.style.transform.match(/(\d+\.*\d*)/g)?.[0])
                        } else {
                            // roll back
                            el.style.transform = `translate3d(${el.touchCurrentX}px,0,0)`
                            el.isOpen = false
                        }
                    }
                    el.addEventListener('touchstart', el.__handleTouchStart, { passive: true });
                    el.addEventListener('touchmove', el.__handleTouchMove, { passive: false });
                    el.addEventListener('touchend', el.__handleTouchEnd);
                },
                unbind(el) {
                    el.removeEventListener('touchstart', el.__handleTouchStart);
                    el.removeEventListener('touchmove', el.__handleTouchMove);
                    el.removeEventListener('touchend', el.__handleTouchEnd);
                }
            }
        },
        watch: {
            //push > computed > watch（可阻塞模板渲染）> list render(dom)
            filterRule: {
                async handler(v) {
                    console.log('watch');
                    // console.log(this.$refs.monitor.length);//n
                    // dom渲染完成之后，新的事件循环之前(因涉及到dom操作，在list render之前无法获取dom，所以在nextTick中执行上一次watch的回调时的数据(此时dom已经渲染完成可被获取)
                    // v?.forEach(s => s.tl && (s.tl=!s.tl))
                    clearTimeout(this.debounce.observer)
                    this.debounce.observer = setTimeout(async () => {
                        await this.$nextTick(() => {
                            // console.log(this.$refs.monitor?.length);//n+1
                            this.$refs.monitor?.forEach(this.observer.observe.bind(this.observer))
                        })
                    }, constant.timer.observerDebounce);
                },
                deep: false
            },
            "main.factor": {
                handler(v) {
                    return this.main.factor = v?.length >= 4 ? this.main.factor.slice(0, 4) : v
                },
                deep: false
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
                    // this.preview.picsIndex = idx >= this.preview.pics?.length ? 0 : (idx < 0 ? this.preview.pics?.length - 1 : idx);
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
                // first init dont emit watch ,sequence:computed > watch 
                async handler(v) {
                    v ? this.flushBookMark(true) : this.status.isdone = true
                }
            },
            "main.error": {
                handler(v) {
                    if (v) {
                        this.overlay.error = true
                        setTimeout(() => {
                            this.main.error = ''
                        }, constant.timer.errorMessageTimeout);
                    }
                }
            }
        },
        computed: {
            // render list
            filterRule() {
                console.log('computed');
                // Function socpe window
                // let cb = Function(`return function(i){ console.log(this); return ${this.filterCallback()}}`)().bind(this)
                // generator funcation template
                let cb = Function(`return i=>${this.filterCallback()}`).call(this)
                if (this.manual.bookmark) {
                    this.$nextTick(this.scrollToTop)
                    return this.bookmark?.filter(cb) ?? []
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
                let bgcColor = constant.themes[this.theme]['backgroundColor'];
                style.textContent = this.cssTemplate({
                    "*": {
                        "color": color,
                        "--br-color": color,
                        "--hv-color": bgcColor,
                        "background-color": bgcColor,
                        "visibility": "visible"
                    },
                    ".bookmark-action-svg path": {
                        "fill": color,
                    },
                })
                document.body.append(style)
            }
        },
        // hook fn dont block init 阻塞钩子函数执行，并不会阻塞vue 实例渲染
        async created() {
            console.log('created');
            // init errorHandler
            Vue.config.errorHandler = async (err, vm, info) => {
                console.log('Vue Error:', err);
                console.log('Vue Error Info:', info);
                // filters 处于渲染阶段，修改实例属性将会触发新的渲染导致循环触发errorHandler
                vm.main.error = err
            };
            // init Vue Option
            let data = JSON.parse(localStorage.getItem(`${v || ''}${constant.constantString.flagString._data}`) ?? '{}')
            this.initVueOption(this.$data, data, constant.defaultStroageMeger)
            // init observer
            this.inintObserver()
            // init websocket
            await this.connect();
            // await this.chatConnect();
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
            console.log('mounted');
            this.listenTouches()
            // init rem
            this.initDeviceMeta()
            this.listenResize()

            // init theme
            this.initTheme()
            // load scroll position
            this.scrollToTop()
            // init resource
            this.proxies = this.snippetArray((await fetch(constant.resourceRouter.proxies).then(resp => resp.json())).slice(constant.constantNumber.passProxy), constant.snippet.proxy)
            this.taglist = await fetch(constant.resourceRouter.tag).then(resp => resp.json())
            this.instruction = await fetch(constant.resourceRouter.instruction).then(resp => resp.json())
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
            clearTimeout(this.debounce.update)
            this.debounce.update = setTimeout(() => {
                if (this.main.socket) {
                    console.log('updated');
                    // save current 解决 v 存档被覆盖
                    localStorage.setItem(`${(v && (v == this.sconf.keyWord) && v) || ''}${constant.constantString.flagString._data}`, JSON.stringify({ ...vm._data, taglist: null, instruction: null, bookmark: null }))
                }
            }, constant.timer.updateHookDebounce);
        },
    })
})()