eval((() => {
    function blocking() {
        setInterval(() => {
            Function('debugger')()
        }, 50)
    }
    if (!/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())) {
        alert('请使用移动设备!')
        window.stop()
        try {
            blocking()
        } catch {
            blocking()
        }
    }
    window.addEventListener('resize', blocking)
}))()
