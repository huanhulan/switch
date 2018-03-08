function generateNoise(canvas, opacity, h, w) {
    opacity = Math.floor(opacity * 0x255) << 24;

    function randomise(data, opacity) {
        let i, x;
        for (i = 0; i < data.length; ++i) {
            x = Math.floor(Math.random() * 0xffffff);
            data[i] = x | opacity;
        }
    }

    const context = canvas.getContext('2d'),
        image = context.createImageData(h, w),
        data = new Uint32Array(image.data.buffer);

    return function () {
        randomise(data, opacity);
        context.putImageData(image, 0, 0);
    };

}

export default ($canvas: HTMLCanvasElement) => {
    const ctx = $canvas.getContext('2d') as CanvasRenderingContext2D;
    const imgData = ctx.createImageData($canvas.width, $canvas.height);
    let timer: number|null = null;
    const noise = generateNoise($canvas, .13, $canvas.width, $canvas.height);

    const api = {
        $canvas,
        run(){
            noise();
            timer = requestAnimationFrame(api.run);
        },
        stop(){
            if (timer !== null) {
                cancelAnimationFrame(timer);
            }
            ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        },
        hide(){
            this.stop();
            this.$cavas.classList.add('hidden')
        },
        show(){
            this.run();
            this.$canvas.classList.remove('hidden');
        }
    };

    return api;
};