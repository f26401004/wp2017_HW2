export default class AudioVisualizer{
    constructor(mediaElement, canvas) {
        this.state = {
            audioContext : null,
            source : null, //the audio source
            animationId : null,
            status : 0, //flag for sound is playing 1 or stopped 0
            mediaElement : document.getElementById(mediaElement),
            canvas : document.getElementById(canvas)
        };

        if(!mediaElement || !canvas)
            console.log("You did not pass the correct MediaHTMLElement OR Canvas!");
        else
            this.initial();
    }

    initial = () => {
        this.prepareAPI();
        this.visualize();
    };

    prepareAPI = () => {
        //fix browser vender for AudioContext and requestAnimationFrame
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
        try {
            this.state.audioContext = new AudioContext();
        } catch (e) {
            console.log(e);
            console.log('贵浏览器不支持AudioContext，垃圾滚粗');
        }
    };

    visualize = () => {
        let mediaElementAudioSourceNode = this.state.audioContext.createMediaElementSource(this.state.mediaElement),
            analyser = this.state.audioContext.createAnalyser();

        //connect the source to the analyser
        mediaElementAudioSourceNode.connect(analyser);
        //connect the analyser to the destination(the speaker), or we won't hear the sound
        analyser.connect(this.state.audioContext.destination);
        //stop the previous sound if any
        if (this.state.animationId !== null) {
            window.cancelAnimationFrame(this.state.animationId);
        }

        this.state.status = 1;
        this.state.source = mediaElementAudioSourceNode;
        this.state.mediaElement.onended = () => this.audioEnd();
        this.drawSpectrum(analyser);
    };

    drawSpectrum = (analyser) => {
        let canvas = this.state.canvas,
            cwidth = canvas.width,
            cheight = canvas.height - 2,
            meterWidth = 10, //width of the meters in the spectrum
            capHeight = 2,
            capStyle = '#fff',
            meterNum = 800 / (2), //count of the meters
            capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
        const ctx = canvas.getContext('2d'),
            gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(1, '#0f0');
        gradient.addColorStop(0.5, '#ff0');
        gradient.addColorStop(0, '#f00');
        const drawMeter = () => {
            let array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            if (this.state.status === 0) {
                //fix when some sounds end the value still not back to zero
                for (let i = array.length - 1; i >= 0; i--) {
                    array[i] = 0;
                }
                let allCapsReachBottom = true;
                for (let i = capYPositionArray.length - 1; i >= 0; i--) {
                    allCapsReachBottom = allCapsReachBottom && (capYPositionArray[i] === 0);
                }
                if (allCapsReachBottom) {
                    window.cancelAnimationFrame(this.state.animationId); //since the sound is stoped and animation finished, stop the requestAnimation to prevent potential memory leak,THIS IS VERY IMPORTANT!
                    return;
                }
            }
            let step = Math.round(array.length / meterNum); //sample limited data from the total array
            ctx.clearRect(0, 0, cwidth, cheight);
            for (let i = 0; i < meterNum; i++) {
                let value = array[i * step];
                // console.log(JSON.stringify(array.slice(0, 50)));
                if (capYPositionArray.length < Math.round(meterNum)) {
                    capYPositionArray.push(value);
                }
                ctx.fillStyle = capStyle;
                //draw the cap, with transition effect
                if (value < capYPositionArray[i]) {
                    ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
                } else {
                    ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight);
                    capYPositionArray[i] = value;
                }
                ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
                ctx.fillRect(i * 12 /*meterWidth+gap*/ , cheight - value + capHeight, meterWidth, cheight); //the meter
            }
            this.state.animationId = window.requestAnimationFrame(drawMeter);
        };
        this.state.animationId = window.requestAnimationFrame(drawMeter);
    };

    audioEnd = () => {
        this.state.status = 0;
    };
}
