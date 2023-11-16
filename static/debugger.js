eval((() => {
    if (!/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())) {
        alert('请使用移动设备!')
        window.stop()
        function blocking() {
            setInterval(() => {
                Function('debugger')()
            }, 50)
        }
        try {
            blocking()
        } catch {
            // blocking()        
        }
    }
    window.addEventListener('resize',blocking)
}))()
