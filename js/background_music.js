// 建立一個實例對象方法
function Visualizer() {
    var Myself = this;
    // 設定頻譜
    this.config = function (Object) {
        Myself.audioUrl = Object.audioUrl;
        Myself.canvasId = Object.canvasId;
        windowAudioContext();
    }
    // 實例化一個音頻類型 window.AudioContext
    function windowAudioContext() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
        try {
            Myself.audioContext = new AudioContext();
            // 加載音頻資訊
            loadSound();
        } catch (e) {
            console.log(e + ',您的瀏覽器不支援 AudioContext');
        }
    }

    // 加载音頻
    function loadSound() {
        // 建立一個請求
        var request = new XMLHttpRequest();
        // 設置請求類型，文件路徑、路徑不可跨域
        request.open('GET', Myself.audioUrl, true);
        // 設置回傳形式
        request.responseType = 'arraybuffer';
        request.onload = function () {
            // 設定重複撥放
            request.response.loop = true;
            // 讀取成功返回 ArrayBuffer 並播放
            play(request.response);
        }
        request.send();
    }

    // 解析音頻資訊並且播放
    function play(audioData) {
        var audioContext = Myself.audioContext;
        // 解析 ArrayBuffer 的資訊
        audioContext.decodeAudioData(audioData).then(function (decodedData) {
            var audioBufferSouceNode = audioContext.createBufferSource(),
                analyser = audioContext.createAnalyser();
            // 將音樂源碼丟入分析器
            audioBufferSouceNode.connect(analyser);
            // 將分析器與播放音源連接
            analyser.connect(audioContext.destination);
            // 將上面解碼得到的 decodedData 數據丟给 source
            audioBufferSouceNode.buffer = decodedData;
            // 播放
            audioBufferSouceNode.start(0);
            // 將分析器的資料傳出去建立頻譜
            drawSpectrum(analyser);
        }, function (e) {
            console.log(e + ",音樂解碼失敗!!");
        });

    }
    // 繪製頻譜
    function drawSpectrum(analyser) {
        // 效果隨機數
        var effectRandom = Math.floor(Math.random() * 1);
        switch (effectRandom) {
            case 0:
                // 條形
                bar(analyser);
                break;
            default:
                // 條形
                bar(analyser);
        }

    }
    // 條形音譜效果
    function bar(analyser) {
        var canvas = document.getElementById(Myself.canvasId);
        canvas.width = document.getElementById("background").width - 60;
        canvas.height = document.getElementById("background").height - 64;
        var cwidth = canvas.width,
            cheight = canvas.height - 2,
            meterWidth = 12,
            gap = 20,
            capHeight = 3,
            capStyle = '#fff',
            // 頻譜條數量
            meterNum = canvas.width / (12 + 2),
            // 將上一個畫面的帽頭放到陣列儲存
            capYPositionArray = [];
        // 獲取 canvas 內容繪製
        ctx = canvas.getContext('2d'),
            gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "#A60F38");
        gradient.addColorStop(1, '#A60F38');
        var drawMeter = function () {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            // 計算採樣步長
            var step = Math.round(array.length / meterNum);
            ctx.clearRect(0, 0, cwidth, cheight);
            for (var i = 0; i < meterNum; i++) {
                // 獲取當前的能量值
                var value = Math.sqrt(array[i * step] * array[i * step] * 1.5);
                if (capYPositionArray.length < Math.round(meterNum)) {
                    // 初始化保存帽頭位置的陣列，將第一個畫面的資訊壓入
                    capYPositionArray.push(value);
                }
                ;
                ctx.fillStyle = capStyle;
                // 繪製帽頭
                if (value < capYPositionArray[i]) {
                    ctx.fillRect(i * gap, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
                } else {
                    ctx.fillRect(i * gap, cheight - value, meterWidth, capHeight);
                    capYPositionArray[i] = value;
                }
                ;
                // 繪製頻譜條
                ctx.fillRect(i * gap - 1, cheight - value + capHeight - 1, meterWidth + 2, cheight + 2);
                ctx.fillStyle = gradient;
                ctx.fillRect(i * gap + 1, cheight - value + capHeight + 1, meterWidth - 2, cheight - 2);
            }
            requestAnimationFrame(drawMeter);
        }
        requestAnimationFrame(drawMeter);
    }
}