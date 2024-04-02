// import constant from '/constant.json' assert { type: 'json' };defaultStroageMeger
(async () => {
    let { protocol, host, search, origin, pathname } = location
    origin = `${origin}${pathname}`;
    let gstyle = document.createElement('style')
    document.body.append(gstyle)
    let { v, f, m } = Object.fromEntries(new URLSearchParams(search))
    let { dataOptionsNomarl, websocket, resourceRouter, flexibleSize, constantString: { flagString, alertString, classString, styleString }, themes, timer, numberSnippet, defaultStroageMeger } = await fetchResource("/constant", 'json', {})
    let { render, tags } = await fetchResource(resourceRouter.demoDebug, 'json', {})
    function sorted(attr, convert, reverse = false) {
        let fn = Function("v", `return v${attr}`)
        let callback = (x, y) => {
            x = convert(fn(x)); y = convert(fn(y));
            return (reverse && (x - y)) || (y - x)
        }
        let { sort, slice, toSorted } = Array.prototype
        return toSorted?.call(this, callback) || sort.call(slice.call(this), callback)
    }
    function uniqueKeyByArray(arrLike, key) {
        const s = new Set();
        return arrLike.filter(({ value }) => {
            const n = value[key];
            return !s.has(n) && s.add(n)
        });
    }
    function debouncefn(fu, delay) {
        let timerd;
        return function (...args) {
            clearTimeout(timerd);
            timerd = setTimeout(() => {
                fu(...args);
            }, delay);
        };
    }
    function throttledfn(fn, delay) {
        let timerd = null;
        return function (...args) {
            if (!timerd) {
                fn(...args);
                timerd = setTimeout(() => {
                    timerd = null;
                }, delay);
            }
        };
    }
    function cssTemplate(cssObject) {
        return Object.keys(cssObject).map(key => {
            let cssStatements = [];
            for (const [k, v] of Object.entries(cssObject[key])) {
                cssStatements.push(`${k}:${v};`)
            }
            return `${key}{${cssStatements.join('')}}`
        }).join('')
    }
    function snippetArray(arr, size) {
        let i, j; i = j = 0;
        const sliced = [];
        while (j < arr.length) {
            [j, i] = [i + size, j]
            if (!(i == j)) {
                sliced.push(arr.slice(i, j))
            }
        }
        return sliced;
    }
    async function sleep(t) {
        return new Promise(r => {
            setTimeout(() => {
                r(null);
            }, t);
        })
    }
    async function fetchResource(u, t, e) {
        let response = await fetch(u)
        if (response.status == 200 || response.status == 304) {
            switch (t) {
                case 'text':
                    e = response.text()
                    break;
                case 'json':
                    e = response.json()
                    break;
                case 'blob':
                    e = response.blob()
                    break;
                case 'body':
                    e = response.body()
                    break;
                case 'arrayBuffer':
                    e = response.arrayBuffer()
                    break;
            }
            return await e
        }
        return e
    }
    function isObject(v) {
        return Object.prototype.toString.call(v).slice(8, -1) == "Object"
    }
    function once(fn) {
        var called = false;
        return function (...args) {
            if (!called) {
                called = true;
                fn.apply(this, args);
            }
        }
    }


    window.vm = new Vue({
        component: {
        },
        data: {
            overlay: {
                pics: false,
                error: false,
                format: false,
                history: false,
                magnet: false,
                reflow: false,
                proxies: false,
                sidenav: false,
                dashboard: false,
                comment: false,
                increment: false,
                stdout: false
            },
            pager: {
                reflow: [],
                fragidx: dataOptionsNomarl.pager.fragidx,
                fragsize: dataOptionsNomarl.pager.fragsize
            },
            main: {
                page: 0,
                offset: 0,
                actors: dataOptionsNomarl.main.actors,
                log: dataOptionsNomarl.main.log,
                select: dataOptionsNomarl.main.select,
                review: dataOptionsNomarl.main.review,
                state: dataOptionsNomarl.main.state,
                error: '',
                keyWord: '',
                dbsort: dataOptionsNomarl.main.dbsort,
                dbsortsb: dataOptionsNomarl.main.dbsortsb,
                dbsortvst: dataOptionsNomarl.main.dbsortvst,
                heartbeat: null,
                currboundel: null,
                sliderate: dataOptionsNomarl.main.sliderate,
                socket: null,
                reconn: true,
                reverse: false,
                reconintval: dataOptionsNomarl.main.reconintval
            },
            manual: {
                mode: dataOptionsNomarl.manual.mode,
                bookmark: false
            },
            status: {
                isdone: true,
                vthumb: true,
                autoview: false,
                watchable: false,
                single: false,
                star: false,
                genre: false,
                director: false,
                studio: false,
                label: false,
                actors: false,
                tags: false,
                directors: false,
                makers: false,
                publishers: false,
                series: false,
                codes: false,
            },
            preview: {
                pics: [],
                picsEl: null,
                swiperEl: null,
                picsSwipe: false,
                picsIndex: -1,
                picsSwiperSize: 0,
                desktopSwiperScale: 0,
                picsFailed: '',
            },
            reveal: {
                touches: 1,
                prevRevealEl: null,
            },
            resource: {
                instruction: dataOptionsNomarl.resource.instruction,
                tags: dataOptionsNomarl.resource.tags,
                bookmark: dataOptionsNomarl.resource.bookmark
            },
            dynamiclist: [],
            reusable: {
                format: '',
                magnet: [],
                stdout: [],
                history: [],
                proxies: [],
                comment: [],
                comments: -1,
            },
            sconf: null,
            observer: null,
            debounce: {
                nav: null,
                error: null,
                slide: null,
                press: null,
                scroll: null,
                update: null,
                observer: null,
                heartbeat: null,
                prefixScale: null,
                prefixScroll: null,
                swipeInterval: null,
            },
            throttled: {
                load: null,
                slowSwipe: null,
            },
            demoDebug: {
                tags,
                render,
                enable: false,
            },
            device: {
                viewWidth: 0,
                viewHeight: 0,
                isMobile: false,
                isTablet: false,
                isDesktop: false,
                destopExpandWScale: 0,
                destopExpandHScale: 0,
                fontSize: 0,
                rootEl: null,
                os: ''
            },
            model: dataOptionsNomarl.model,
            theme: 'normal',
            description: 'standard',
        },
        methods: {
            importFormat() {
                let matcher = this.reusable.format.match(/[a-zA-Z]+-\d+/ig)
                if (matcher) {
                    this.dynamiclist = []
                    this.overlay.format = false
                    this.overlay.reflow = false
                    matcher.forEach(this.singleSearch)
                    this.logReuse(`${flagString.import}:${matcher.length}`)
                    return null
                }
                alert(alertString.import)
            },
            exportJson() {
                let json = JSON.stringify(this.filterRender.map(({ m }) => m))
                let raw = new Blob([json], { type: 'application/json' })
                let body = document.body
                let el = document.createElement('a')
                let url = URL.createObjectURL(raw)
                el.href = url
                el.download = new Date().toJSON().slice(0, 10)
                body.append(el)
                el.click();
                URL.revokeObjectURL(url)
                body.removeChild(el)
                // navigator.clipboard.writeText(text)
                this.logReuse(alertString.export)
                return null
            },
            togglePlate(index) {
                this.resource.instruction[index].expand = !this.resource.instruction[index].expand;
                this.resource.instruction.forEach((it, ix) => {
                    if (!(ix == index)) {
                        it.expand = false
                    }
                })
                return null
            },
            // can be optimized
            search() {
                if (this.searchAction == 'abort') return this.abort()
                if (!this.status.isdone) return alert(alertString.search)
                if (this.main.socket.readyState != WebSocket.OPEN) return this.logReuse(flagString.socketDisconnect)
                this.lockSyncReuse();
                this.dynamiclist = [];
                this.pager.reflow = [];
                this.overlay.history = false;
                this.description = (this.status.star && 'star') || (this.status.genre && 'genre') || (this.status.studio && 'studio') || (this.status.label && 'label') || (this.status.actors && 'actors') || (this.status.tags && 'tags') || (this.status.directors && 'directors') || (this.status.directors && 'directors') || (this.status.makers && 'makers') || (this.status.publishers && 'publishers') || (this.status.series && 'series') || 'standard'
                let template = { type: 'SEARCH', star: this.status.star, genre: this.status.genre, director: this.status.director, studio: this.status.studio, label: this.status.label, actors: this.status.actors, tags: this.status.tags, directors: this.status.directors, makers: this.status.makers, publishers: this.status.publishers, series: this.status.series, codes: this.status.codes, mode: this.manual.mode, dbsorts: { dbsort: this.main.dbsort, dbsortsb: this.main.dbsortsb, dbsortvst: this.main.dbsortvst } };
                if (this.main.keyWord.includes(flagString.searchSplit)) {
                    let [keyWord, range] = this.main.keyWord.split(flagString.searchSplit);
                    range = range.split(flagString.searchPageSplit);
                    this.main.page = range.length > 1 ? range[1] : range[0]
                    this.sconf = { ...template, keyWord, range }
                    this.main.socket.send(JSON.stringify(this.sconf))
                    return null;
                }
                // duplicate
                this.main.page = 1
                this.sconf = { ...template, keyWord: this.main.keyWord, range: [this.main.page] };
                this.main.socket.send(JSON.stringify(this.sconf))
                return null
            },
            genreSearch(v) {
                this.jumpLocation(v, 'genre', this.manual.mode)
                return null
            },
            reloadItem(v) {
                console.log(v);
            },
            singleSearch(n) {
                this.lockSyncReuse()
                this.main.socket.send(JSON.stringify({ type: 'SEARCH', keyWord: n, mode: this.manual.mode, range: [1] }))
                return null
            },
            batchReflow() {
                this.pager.reflow.forEach(({ value: { n } }) => {
                    this.singleSearch(n)
                })
                this.overlay.reflow = false
                return null
            },
            clearReflow() {
                this.pager.reflow = []
                this.overlay.reflow = false
                return null
            },
            pushReflow(n, extra, idx) {
                this.injectProperty({ n, ...extra })
                this.pager.reflow.splice(idx, 1)
                return null
            },
            detectReflow(reflow) {
                if (reflow.length) {
                    this.pager.reflow = uniqueKeyByArray([...this.pager.reflow, ...reflow], 'n')
                }
            },
            flushReflow(v) {
                if (this.pager.reflow.length) {
                    this.pager.reflow.find(({ value: { n } }, idx) => {
                        v.n == n && this.pager.reflow.splice(idx, 1)
                    })
                }
            },
            home() {
                location.href = origin
                return null
            },
            abort() {
                return this.main.socket.send(JSON.stringify({ type: 'ABORT' }))
            },
            reset() {
                this.disconnect()
                localStorage.clear()
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
            injectProperty(v) {
                let inject = { ...v, i: v.i.map(pt => ({ pt, loaded: false })), gs: false, vs: false, as: false }
                this.dynamiclist.push(inject);
            },
            jumpLocation(v, f, m) {
                return location.href = `${origin}?v=${v}&f=${f}&m=${m}`
            },
            jumpTag(v, m) {
                this.debounce.press = setTimeout(() => {
                    if (v.includes('http')) {
                        v = new URL(v);
                        let paths = v.pathname.split('/');
                        v.search && (paths[2] = v.search.match(/([^?]+)$/)[0])
                        this.jumpLocation(paths[2], paths[1], m)
                        return null
                    }
                    this.jumpLocation(v, '', m)
                }, timer.jumpTagTimeout)
            },
            cancelJump() {
                return clearTimeout(this.debounce.press)
            },
            logReuse(v) {
                this.main.log = v
                return null
            },
            lockSyncReuse() {
                this.status.isdone = false;
                return null
            },
            unlockSyncReuse() {
                this.status.isdone = true;
                return null
            },
            async updateProxy() {
                this.overlay.reflow = false;
                this.logReuse(await fetchResource(resourceRouter.updateProxy, 'text', 'error'))
            },
            async flushNewProxy() {
                this.reusable.proxies = snippetArray((await fetchResource(resourceRouter.proxies, 'json', [])).slice(numberSnippet.passProxy), numberSnippet.proxy)
                return null
            },
            async switchProxy(idx) {
                if (this.status.isdone) {
                    this.lockSyncReuse()
                    this.overlay.reflow = false;
                    this.overlay.proxies = false;
                    this.logReuse(await fetchResource(`${resourceRouter.toggleProxy}${idx + numberSnippet.passProxy}`, 'text', 'error'))
                    this.flushNewProxy()
                    this.unlockSyncReuse();
                    return null
                }
                alert(alertString.proxy)
            },
            openHistory() {
                this.reusable.history = Object.keys(localStorage).filter(h => h != flagString._data);
                this.overlay.history = this.reusable.history.length
                return null
            },
            loadHistory(key) {
                let data_ = JSON.parse(localStorage.getItem(key))
                this.jumpLocation(data_['sconf']['keyWord'], data_['description'], data_["manual"]['mode'])
                return null
            },
            saveHistory(k) {
                // save history
                localStorage.setItem(`${k || ''}${flagString._data}`, JSON.stringify({ ...vm._data, resource: { instruction: [], tags: { javbus: {}, javdb: {} }, bookmark: { javbus: [], javdb: [] } } }))
            },
            loadNext() {
                if (this.status.isdone && this.sconf && !this.manual.bookmark) {
                    this.main.page++
                    this.lockSyncReuse()
                    this.main.socket.send(JSON.stringify({ ...this.sconf, range: [this.main.page] }))
                }
                return null
            },
            loadOnIncrement() {
                this.overlay.increment = !this.overlay.increment
                if (this.overlay.increment) {
                    this.loadNext();
                }
            },
            loadOnScroll({ target }) {
                clearTimeout(this.debounce.scroll)
                this.debounce.scroll = setTimeout(() => {
                    let { clientHeight, scrollHeight, scrollTop } = target
                    let diff = scrollHeight - Math.ceil(scrollTop)
                    this.main.offset = Math.floor(scrollTop)
                    if (Math.abs(diff - clientHeight) <= numberSnippet.scrollTolerance && !this.throttled.load) {
                        this.loadNext()
                        // 防止在加载开始之前再次触发
                        this.throttled.load = setTimeout(() => {
                            this.throttled.load = null
                        }, timer.onScrollInterval)
                    }
                }, timer.scrollDebounce);
                return null
            },
            async loadViews(n) {
                return parseInt(await fetchResource(`${resourceRouter.views}${n}`, 'text', -1))
            },
            async loadViewsByItem(v) {
                this.logReuse(v.n)
                this.lockSyncReuse();
                let views = await this.loadViews(v.n)
                this.logReuse(`${v.n}${flagString.logFormat}${views}`)
                // vm.$set(v, 'v', parseInt(views))
                v['v'][0] = views
                this.logReuse(flagString.done)
                this.unlockSyncReuse();
                return null
            },
            async loadViewsByBatch() {
                if (!this.dynamiclist.length) return null;
                this.lockSyncReuse()
                let queueViews = []
                let pending = this.filterRender.filter(({ v }) => v[0] == -1)
                this.logReuse(pending.length)
                let fragment = snippetArray(pending, numberSnippet.views)
                for (let i = 0; i <= fragment.length - 1; i++) {
                    await sleep(timer.viewsLoadDealy);
                    fragment[i].forEach(async v => {
                        queueViews.push(
                            (async () => {
                                if (v['v'] == -1) {
                                    let views = await this.loadViews(v.n)
                                    this.logReuse(`${v.n}${flagString.logFormat}${views}`)
                                    // vm.$set(v, 'v', views)
                                    v['v'][0] = views
                                    return { n: v.n, views }
                                }
                            })()
                        )
                    })
                }
                Promise.allSettled(queueViews).then((ps) => {
                    this.logReuse(flagString.done)
                    this.unlockSyncReuse()
                })
                return null
            },
            async openSwiper(idx, { target }) {
                this.preview.picsIndex = idx
                this.preview.picsEl = target
                this.preview.picsEl.classList.add(classString.swipe)
                await sleep(timer.openSwiperTimeout)
                this.preview.picsSwipe = this.preview.pics.length

            },
            async closeSwiper() {
                this.preview.picsIndex = -1
                this.preview.picsSwipe = !this.preview.picsSwipe
                await sleep(timer.closeSwiperTimeout)
                this.preview.picsEl.classList.remove(classString.swipe)
                return null
            },
            nextSwipe() {
                let el = this.preview.swiperEl
                console.log(el);
                el.style.transitionDuration = `${timer.swipeTransitionTimeout}ms`
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
                        }, timer.swipeTransitionTimeout);
                    })
                }
                return null
            },
            prevSwipe() {
                let el = this.preview.swiperEl
                el.style.transitionDuration = `${timer.swipeTransitionTimeout}ms`
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
                        }, timer.swipeTransitionTimeout);
                    })
                }
            },
            expandMagnet(m) {
                this.reusable.magnet = m
                this.overlay.magnet = m.length
                return null
            },
            expandComment(c, l) {
                this.reusable.comment = c
                this.reusable.comments = l
                this.overlay.comment = c.length
                return null
            },
            expandPicture(i) {
                this.preview.pics = i
                this.overlay.pics = i.length
                return null
            },
            async updateBookmark(_data) {
                this.logReuse(`${this.markAction}${flagString.logFormat}${_data.n}`)
                switch (this.markAction) {
                    case 'insert':
                        this.main.socket.send(JSON.stringify({ type: 'INSERT', data: _data }))
                        break;
                    case 'remove':
                        this.main.socket.send(JSON.stringify({ type: 'REMOVE', data: _data }))
                        break;
                }
                this.reveal.prevRevealEl.__recoverReveal()
                await sleep(timer.updateBookmarkTimeout)
                this.flushBookMark()
                return null
            },
            async flushBookMark(lock) {
                lock && this.lockSyncReuse()
                this.resource.bookmark[this.manual.mode] = await fetchResource(resourceRouter.bookmark[this.manual.mode], 'json', [])
                return lock
            },
            scrollToTop(offset, behavior) {
                this.$el.scrollTo({
                    top: offset || this.main.offset,
                    behavior: behavior || flagString.scrollBehavior
                });
                return null
            },
            filterTemp() {
                let conditions = [];
                !this.status.single || conditions.push('(i.s.length == this.main.actors)');
                !this.status.watchable || conditions.push('i.m.length');
                !(this.main.review == 'censored') || conditions.push('i');
                !(this.main.review == 'uncensored') || conditions.push('i.u');
                !(this.main.review == 'revelation') || conditions.push('i.r');
                return `return i=>${conditions.join(` && `)}`
            },
            visibNavigation() {
                this.overlay.sidenav = true
                clearTimeout(this.debounce.nav)
                this.debounce.nav = setTimeout(() => {
                    this.overlay.sidenav = false
                }, timer.visibilityNavBar);
                return null
            },
            clearErrorViewr() {
                this.overlay.error = true
                clearTimeout(this.debounce.error)
                this.debounce.error = setTimeout(() => {
                    this.main.error = ''
                    this.overlay.error = false
                }, timer.errorMessageTimeout);
            },
            thumbSucess({ target }) {
                target.classList.add(classString.loaded)
                return null
            },
            //onloadstart 
            thumbFailed() {

            },
            listenTouches() {
                window.addEventListener('touchstart', (e) => {
                    //console.log(  e.target.closest('.info-swipe-reveal'));
                    this.reveal.touches = e.touches.length
                    // 禁用缩放
                    e.touches.length >= 2 && e.preventDefault();
                }, { passive: false });
            },
            listenResize() {
                // resize被推迟至宏任务阶段,devTool无法监听数据变化
                window.addEventListener('resize', debouncefn(this.initDevice.bind(this), timer.resizeDeviceDebounce))
                // window.addEventListener('resize', debouncefn(this.fn.bind(this),timer.resizeDeviceDebounce))
            },
            initSwiper() {
                let el = this.preview.swiperEl || document.body
                this.$nextTick(() => {
                    this.preview.picsSwiperSize = -el.getBoundingClientRect().width
                    el.slowSwipe = Math.abs(vm.preview.picsSwiperSize / 2)
                })
            },
            flexible() {
                const { viewWidth } = this.device;
                const { small, big } = flexibleSize;
                const { smallScreenWidth, largeScreenWidth } = numberSnippet;
                if (viewWidth >= smallScreenWidth && viewWidth <= largeScreenWidth) {
                    return small + ((viewWidth - smallScreenWidth) / (largeScreenWidth - smallScreenWidth)) * (big - small);
                }
                return ((viewWidth >= largeScreenWidth) && big) || ((viewWidth <= smallScreenWidth) && small)
            },
            initTheme() {
                let hours = new Date().getHours()
                if (themes.day.range[0] <= hours && hours <= themes.day.range[1]) {
                    this.theme = themes.day.name
                } else {
                    this.theme = themes.night.name
                }
            },
            // offsetH/W w+p+b+s ,clientH/W, w+p  windowH/W w+p+b+s  rectH/W w+p+b
            initDevice() {
                const platform = navigator.platform.toLowerCase();
                const userAgent = navigator.userAgent.toLowerCase();
                //  const { width } = document.documentElement.getBoundingClientRect()
                this.device.os = platform.includes('win') && 'Windows' || platform.includes('mac') && 'MacOS' || platform.includes('linux') && 'Linux' || 'Unknown'
                this.device.isMobile = /mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent) || navigator.maxTouchPoints
                this.device.isTablet = /ipad|android/i.test(userAgent) && this.device.isMobile;
                this.device.isDesktop = !this.device.isMobile && !this.device.isTablet;
                // this.$el.style.height = `${visualViewport.height}px`
                this.device.rootEl = document.documentElement;
                this.device.viewWidth = window.innerWidth;
                this.device.viewHeight = window.innerHeight;
                this.device.fontSize = this.flexible()
                this.$el.style.height = `${this.device.viewHeight}px`;
                this.device.rootEl.style.fontSize = `${this.device.fontSize}px`;
                this.initSwiper()
                vm.$forceUpdate();
                return null
            },
            initVueOption($data, data, overWrite) {
                data = data || {}
                overWrite = overWrite || {}
                let _data = {
                    ...data,
                    ...overWrite
                }
                for (const key in _data) {
                    $data[key] = _data[key]
                }
                return null
            },
            initObserver() {
                // 元素可视状态的变化都将执行IntersectionObserver回调
                // observe() 属于同步任务,当存在多个observe调用时 observer callback 会在宏任务队列中执行
                this.observer = new IntersectionObserver((entries, observer) => {
                    // entries.length 并不等于被监听的总数,活动周期内的处于交叉状态的总数
                    // console.log(`active:${entries.length}`);
                    //可能出现多个监听元素同时出现
                    entries.forEach(async ({ target, isIntersecting }) => {
                        // console.log(target, isIntersecting);
                        if (isIntersecting) {
                            !(target.src == target.dataset.src) && target.setAttribute('src', target.dataset.src)
                            let v = this.status.autoview && this.filterRender[target.dataset.i]
                            if (v && (v['v'][0] == -1)) {
                                this.logReuse(target.dataset.n)
                                let views = await this.loadViews(target.dataset.n)
                                v['v'][0] = views
                                // vm.$set(this.filterRender[target.dataset.i], 'v',[views] )
                            }
                            observer.unobserve(target)
                        }
                    });
                }, {
                    root: this.$el,
                    rootMargin: `0px 0px 290px 0px`,
                    threshold: 0
                })
            },
            async initResource() {
                let resource = this.resource
                for (const k in resource) {
                    let v = resource[k]
                    if (isObject(v)) {
                        for (const _k in v) {
                            this.resource[k][_k] = await fetchResource(resourceRouter[k][_k], 'json', [])
                        }
                        continue;
                    }
                    this.resource[k] = await fetchResource(resourceRouter[k], 'json', [])
                }
            },
            connect() {
                console.log('connect');
                return new Promise(r => {
                    this.main.socket = new WebSocket(`${protocol.includes('https:') ? 'wss' : 'ws'}://${host}${websocket.main}`)
                    this.main.socket.onopen = () => {
                        r(null)
                        console.log('WebSocket OPEN');
                        this.main.socket.addEventListener('message', async (e) => {
                            let { data, type } = JSON.parse(e.data)
                            switch (type) {
                                case 'PING':
                                    this.main.heartbeat = Date.now() - parseInt(data)
                                    this.main.socket.send(JSON.stringify({ type: 'PONG', data: 4010 }))
                                    clearInterval(this.debounce.heartbeat)
                                    this.debounce.heartbeat = setInterval(() => {
                                        this.disconnect()
                                    }, timer.heartbeatDetectCycle)
                                    break;
                                case 'PROGRESS':
                                    this.logReuse(data.m)
                                    break;
                                case 'CENSORED':
                                    this.flushReflow(data)
                                    this.injectProperty(data)
                                    break;
                                case 'DONE':
                                    this.logReuse(data.m)
                                    this.unlockSyncReuse()
                                    this.saveHistory(this.sconf && this.sconf.keyWord)
                                    this.detectReflow(data.reflow)
                                    this.overlay.increment && data.len && this.loadNext()
                                    break;
                                case 'ERROR':
                                    this.logReuse(data.err)
                                    break;
                            }
                        })
                    };
                    this.main.socket.onclose = () => {
                        console.log('WebSocket CLOSE');
                        clearInterval(this.main.heartbeat)
                        this.main.reconn && setTimeout(this.connect, this.main.reconintval);
                    };
                    this.main.socket.onerror = (evt) => {
                        console.log('WebSocket ERROR');
                        this.disconnect()
                    };

                })
            },
            detectConnect() {
                setInterval(() => {
                    let { connectState } = websocket
                    switch (this.main.socket.readyState) {
                        case WebSocket.CONNECTING:
                            this.main.state = connectState.connecting
                            break;
                        case WebSocket.OPEN:
                            this.main.state = connectState.open
                            break;
                        case WebSocket.CLOSING:
                            this.main.state = connectState.closing
                            break;
                        case WebSocket.CLOSED:
                            this.main.state = connectState.closed
                            break;
                    }
                }, timer.detectConnect);
                return null
            },
            disconnect() {
                this.main.socket && this.main.socket.close();
                return null
            }
        },
        filters: {
            dataCapacity(v) {
                return v.length || -1
            },
            // optimization
            extractTag(v, o) {
                v = v && v.match(/([^\/]+)$/)?.[0]?.split('?')
                v = v?.[1] || v?.[0]
                return o?.[v] ?? v
            },
            getProgress(v) {
                return v.filter(({ loaded }) => (loaded == true)).length || 0
            },
            purgeSuffix(v) {
                return v.replace(flagString._data, '') || v
            },
            viemTemplate(v) {
                return (v == -1 && flagString.viewsEmpty) || v
            },
            uniqueKey(v) {
                return `${Date.now()}`
            },
            flagLast(v, len) {
                return len - numberSnippet.flagLastNth <= v && `${flagString.flagLastSuffix}${v}` || v
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
                        clearTimeout(vm.debounce.prefixScroll)
                        cancelAnimationFrame(vm.debounce.slide)
                    }
                    el.__autoScroll = ({ touches: [point] }) => {
                        vm.debounce.prefixScroll = setTimeout(() => {
                            vm.main.offset = Math.floor(vm.$el.scrollTop)
                            let up = point['clientX'] >= window.innerHeight >> 2
                            cancelAnimationFrame(vm.debounce.slide)
                            let animateScroll = () => {
                                vm.main.offset += (up ? vm.main.sliderate : -vm.main.sliderate)
                                vm.scrollToTop(null, flagString.autoScrollBehavior)
                                vm.debounce.slide = requestAnimationFrame(animateScroll)
                            }
                            animateScroll()
                        }, timer.invokeAutoScroll)
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
            pressScaleTarget: {
                bind(el, binding) {
                    let vm = binding.value
                    el.__targetScale = (e) => {
                        e.stopPropagation();
                        vm.debounce.prefixScale = setTimeout(() => {
                            el.classList.add(classString.thumbScale)
                        }, timer.scaleThumbTimeout);
                    }
                    el.__cancelScale = () => {
                        clearTimeout(vm.debounce.prefixScale)
                        el.classList.remove(classString.thumbScale)
                    }
                    el.addEventListener('touchstart', el.__targetScale, { passive: true })
                    el.addEventListener('touchend', el.__cancelScale, { passive: true })
                },
                unbind(el) {
                    el.removeEventListener("touchstart", el.__targetScale)
                    el.removeEventListener("touchend", el.__cancelScale)
                    el.removeEventListener("touchcancel", el.__cancelScale)
                }
            },
            swipeCarouselPics: {
                bind(el, binding) {
                    let vm = binding.value
                    el.lock = false;
                    el.enterSwipe = (deltaX, currentX) => {
                        clearTimeout(vm.throttled.slowSwipe)
                        // clearTimeout(vm.debounce.swipeInterval)
                        el.style.transitionDuration = `${timer.swipeTransitionTimeout}ms`
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
                                vm.$nextTick(() => [
                                    el.lock = false
                                ])
                            }, timer.swipeTransitionTimeout);
                        })
                        el.style.transform = `translate3d(${currentX}px,0,0)`
                    }
                    // moblie
                    vm.preview.swiperEl = el
                    vm.$nextTick(vm.initSwiper)
                    el.threshold = numberSnippet.swipeThreshold
                    el.__handleTouchStart = ({ touches: [point] }) => {
                        if (!el.lock) {
                            el.touchDeltaX = 0
                            el.touchStartX = 0
                            el.style.transitionDuration = '0s'
                            el.touchCurrentX = vm.preview.picsSwiperSize * vm.preview.picsIndex;
                            el.touchStartX = point['clientX']
                            el.swipeMode = 'fast'
                            clearTimeout(vm.throttled.slowSwipe)
                            vm.throttled.slowSwipe = setTimeout(() => {
                                el.swipeMode = 'slow'
                            }, timer.swipeSlowTimeout);
                        }
                    }
                    el.__handleTouchMove = ({ touches: [point] }) => {
                        if (!el.lock) {
                            // requestAnimationFrame(()=>{
                            el.touchDeltaX = el.touchStartX - point['clientX'];
                            el.style.transform = `translate3d(${el.touchCurrentX - el.touchDeltaX}px,0,0)`
                            // })
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
                        el.MouseCurrentX = vm.preview.picsSwiperSize * vm.preview.picsIndex;
                        el.MouseStartX = e['clientX']
                        el.addEventListener('mousemove', el.__handleMouseMove);
                        el.addEventListener('mouseleave', el.__handleMouseUpAndLeave);
                        el.swipeMode = 'fast'
                        vm.throttled.slowSwipe = setTimeout(() => {
                            el.swipeMode = 'slow'
                        }, timer.swipeSlowTimeout);
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
                    el.removeEventListener('mousedown', el.__handleMouseDown);
                    el.removeEventListener('mouseup', el.__handleMouseUpAndLeave);
                    el.removeEventListener('touchstart', el.__handleTouchStart);
                    el.removeEventListener('touchmove', el.__handleTouchMove);
                    el.removeEventListener('touchend', el.__handleTouchEnd);
                },
            },
            swipeToReveal: {
                bind(el, binding) {
                    // console.log(el);
                    let vm = binding.arg
                    // let data = binding.value;
                    // directive在渲染中绑定，需要等待渲染完成获取
                    vm.$nextTick(() => {
                        // console.log('swipeToReveal');
                        let { height } = el.getBoundingClientRect()
                        el.__revealY = height
                        el.__halfY = el.__revealY / 2
                    })
                    el.isOpen = false
                    el.opacityCurrent = ''
                    el.__recoverReveal = function () {
                        this.style.opacity = ''
                        this.style.transform = `translate3d(0,0,0)`
                        this.isOpen = false
                    }
                    el.__focusOutline = function () {
                        this.style.borderBottomColor = styleString.focusColor;
                    }
                    el.__blurOutline = function () {
                        this.style.borderBottomColor = ''
                    }
                    el.__handleTouchStart = ({ touches: [point] }) => {
                        if (vm.reveal.touches == 1) {
                            if (vm.reveal.prevRevealEl == null) {
                                vm.reveal.prevRevealEl = el;
                            }
                            if (vm.reveal.prevRevealEl != el) {
                                vm.reveal.prevRevealEl.__blurOutline();
                                vm.reveal.prevRevealEl.__recoverReveal()
                                vm.reveal.prevRevealEl = el
                            }
                            el.__focusOutline()
                            el.touchDeltaX = 0
                            el.touchStartX = 0
                            el.touchDeltaY = 0
                            el.touchStartY = 0
                            el.touchCurrentX = 0
                            el.opacity = 0
                            el.revealing = false
                            el.style.transitionDuration = '0s'
                            el.touchStartX = point['clientX'];
                            el.touchStartY = point['clientY'];
                        }
                    }
                    el.__handleTouchMove = (e) => {
                        if (vm.reveal.touches == 1) {
                            el.touchDeltaX = el.touchStartX - e.touches[0]['clientX'];
                            el.touchDeltaY = el.touchStartY - e.touches[0]['clientY'];
                            !el.revealing && (el.slope = el.touchDeltaY / el.touchDeltaX)
                            if ((Math.abs(el.slope) <= numberSnippet.tiltFactor) || el.revealing) {
                                // vm.reusable.stdout.push(el.innerText)
                                e.preventDefault()
                                el.revealing = true
                                el.opacity = ((Math.abs(el.touchDeltaX) * numberSnippet.revealOpacityFactor) / el.__revealY)
                                if (!el.isOpen && (Math.abs(el.touchDeltaX) <= el.__revealY) && (el.touchDeltaX > 0)) {
                                    el.opacityCurrent = 1 - el.opacity
                                    el.style.opacity = el.opacityCurrent
                                    el.style.transform = `translate3d(${-el.touchDeltaX}px,0,0)`
                                }
                                // limit offset direction 
                                if (el.isOpen && (el.__revealY >= Math.abs(el.touchDeltaX)) && (el.touchDeltaX < 0)) {
                                    // limit offset distance 
                                    el.style.opacity = el.opacityCurrent + el.opacity
                                    el.style.transform = `translate3d(${-el.__revealY - el.touchDeltaX}px,0,0)`
                                }
                            }
                        }
                    }
                    el.__handleTouchEnd = () => {
                        el.style.transitionDuration = `${timer.revealTransitionTimeout}ms`;
                        if (!el.isOpen && (Math.abs(el.touchDeltaX) >= el.__halfY)) {
                            if ((el.touchDeltaX >= 0) && (Math.abs(el.slope) <= numberSnippet.tiltFactor)) {
                                el.style.opacity = numberSnippet.revealOpacityFactor
                                el.style.transform = `translate3d(${-el.__revealY}px,0,0)`
                                el.isOpen = true
                            }
                        } else {
                            el.__recoverReveal()
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
            //push > computed > watch> list render(dom)
            filterRender: {
                handler(v) {
                    // console.log(this.$refs.monitor.length);//n
                    // dom渲染完成之后，新的事件循环之前(因涉及到dom操作，在list render之前无法获取dom，所以在nextTick中执行上一次watch的回调时的数据(此时dom已经渲染完成可被获取)
                    clearTimeout(this.debounce.observer)
                    // 数据加载+异步执行回调 导致节流超时,较大延迟节流可保证push完成后observer,但会存在图片不被加载
                    this.debounce.observer = setTimeout(async () => {
                        console.log('watch');
                        await this.$nextTick(() => {
                            // console.log(this.$refs.monitor?.length);//n+1
                            this.$refs.monitor?.forEach(this.observer.observe.bind(this.observer))
                        })
                    }, timer.observerDebounce);
                },
                deep: false,
            },
            "pager.fragidx": {
                handler(v) {
                    this.pager.fragidx = Math.max(1, Math.min(v, this.pagerSize))
                }
            },
            "status.star": {
                handler(v) {
                    v && (this.status.genre = !v)
                }
            },
            "status.genre": {
                handler(v) {
                    v && (this.status.star = !v)
                }
            },
            "status.actors": {
                handler(v) {
                    v && (this.status.tags = !v)
                }
            },
            "status.tags": {
                handler(v) {
                    v && (this.status.actors = !v)
                }
            },
            "manual.bookmark": {
                // first init dont emit watch ,sequence:computed > watch 
                handler(v) {
                    (v && this.flushBookMark(true)) || this.unlockSyncReuse()
                }
            },
            "main.error": {
                handler(v) {
                    v && this.clearErrorViewr();
                }
            }
        },
        computed: {
            // render list
            filterRender() {
                console.log('computed');
                // Function socpe window
                // generator funcation template
                let cb = Function(this.filterTemp()).call(this)
                if (this.demoDebug.enable) {
                    return render
                }
                if (this.manual.bookmark) {
                    this.$nextTick(this.scrollToTop)
                    return this.bookmark.filter(cb)
                }
                switch (this.main.select) {
                    case "none":
                        return this.dynamiclist.filter(cb)
                    case "time":
                        return sorted.call(this.dynamiclist.filter(cb), '.d', x => new Date(x).getTime(), this.main.reverse)
                    case "view":
                        return sorted.call(this.dynamiclist.filter(cb), '.v[0]', x => x, this.main.reverse)
                    case "repo":
                        return sorted.call(this.dynamiclist.filter(cb), '.l', x => x, this.main.reverse)
                }
                return []
            },
            switchTheme() {
                let color = themes[this.theme]['color'];
                let bgcColor = themes[this.theme]['backgroundColor'];
                gstyle.textContent = cssTemplate({
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
                return null
            },
            pagerRender() {
                return this.pager.reflow.slice(this.pager.fragsize * (this.pager.fragidx - 1), this.pager.fragidx * this.pager.fragsize)
            },
            pagerIndex() {
                return this.pagerSize && this.pager.fragidx
            },
            pagerSize() {
                return Math.ceil(this.pager.reflow.length / this.pager.fragsize)
            },
            modelAttr() {
                return this.model[this.manual.mode]
            },
            markAction() {
                return this.manual.bookmark ? 'remove' : 'insert'
            },
            searchAction() {
                return this.status.isdone ? 'search' : 'abort'
            },
            taglist() {
                return this.demoDebug.enable && tags || this.resource.tags[this.manual.mode]
            },
            bookmark() {
                return this.resource.bookmark[this.manual.mode]
            },
            isOddIndex() {
                return v => !(v % 2)
            },
            isOnlyOne() {
                // 柯里化
                return v => v?.length == 1 || 0
            },
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
            let data = JSON.parse(localStorage.getItem(`${v || ''}${flagString._data}`))
            this.initVueOption(this.$data, data, defaultStroageMeger)
            // init websocket
            await this.connect();
            this.detectConnect()
            // init query data
            if (v) {
                this.manual.mode = m
                this.main.keyWord = v
                f && (this.status[f] = true)
                // relation websockert 
                await this.$nextTick(() => {
                    !(this.dynamiclist.length) && this.search()
                })
            }
        },
        async mounted() {
            // console.log(this.$listeners);
            console.log('mounted');
            this.listenTouches()
            // init device info 
            this.listenResize()
            this.initDevice()
            // init observer
            this.initObserver()
            // init Reveal
            // this.initReveal();
            // init theme
            this.initTheme()
            // load scroll position
            this.scrollToTop()
            // init proxies
            this.flushNewProxy()
            // init resource
            this.initResource()
        },
        updated() {
            clearTimeout(this.debounce.update)
            this.debounce.update = setTimeout(() => {
                if (this.main.socket) {
                    console.log('updated');
                    // save current 解决 v 存档被覆盖
                    this.saveHistory(this.sconf && (this.sconf.keyWord == v) && v)
                }
            }, timer.updateHookDebounce);
        },
    })
    vm.$mount('#box')
})()