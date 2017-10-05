// 建立一個實例對象方法
function Visualizer() {
    var Myself = this;
    var lastAvarage = 0, particles = [];
    for (var i = 0; i < 100; i++) {
        particles[i] = {
            x: Math.random() * 1300,
            y: Math.random() * 860,
            r: Math.random() * 5,
            minR: Math.random() * 5 + 1,
            maxR: Math.random() * 12 + 5,
            d: Math.random() * 50,
            c: colors[util.intRandom(0, colorNum)]
        }
        particles[i].minO = particles[i].o = Math.random() * 0.8 + 0.2;
    }

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
                //dynamic_photo(analyser);
                break;
            default:
                // 條形
                bar(analyser);
                //dynamic_photo(analyser);
                break;
        }

    }
    /*
        function dynamic_photo(analyser) {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
    
        }
    */
    // 條形音譜效果
    function bar(analyser) {
        var canvas = document.getElementById(Myself.canvasId);
        canvas.width = document.getElementById("background").width - 60;
        canvas.height = document.getElementById("background").height - 64;
        var cwidth = canvas.width,
            cheight = canvas.height - 2,
            meterWidth = 8,
            gap = 14,
            capHeight = 3,
            capStyle = '#fff',
            // 頻譜條數量
            meterNum = canvas.width / (8 + 2),
            // 將上一個畫面的帽頭放到陣列儲存
            capYPositionArray = [],
            avarage = 0;
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
                var value = array[i * step] * 1.5;
                avarage += value;
                if (capYPositionArray.length < Math.round(meterNum)) {
                    // 初始化保存帽頭位置的陣列，將第一個畫面的資訊壓入
                    capYPositionArray.push(value);
                }
                ctx.fillStyle = capStyle;
                // 繪製帽頭
                if (value < capYPositionArray[i]) {
                    ctx.fillRect(i * gap, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
                } else {
                    ctx.fillRect(i * gap, cheight - value, meterWidth, capHeight);
                    capYPositionArray[i] = value;
                }
                // 繪製頻譜條
                ctx.fillRect(i * gap - 1, cheight - value + capHeight - 1, meterWidth + 2, cheight + 2);
                ctx.fillStyle = gradient;
                ctx.fillRect(i * gap + 1, cheight - value + capHeight + 1, meterWidth - 2, cheight - 2);
            }


            avarage /= array.length;
            var dif = avarage - lastAvarage,
                absDif = Math.abs(dif);
            for (var i = 0, len = particles.length; i < len; i = i + 2) {
                var p = particles[i];
                // 更新
                if (dif > 0) {
                    p.r += absDif / 10;
                    if (p.r > p.maxR) {
                        p.r -= (p.r - p.maxR) / 5;
                    }
                    p.o += 0.05;
                    if (p.o > 1) {
                        p.o = 1;
                    }
                } else {
                    p.r -= absDif / 5;
                    if (p.r < 0) {
                        p.r = 0.01;
                    }
                    if (p.r < p.minR) {
                        p.r += (p.minR - p.r) / 10;
                    }
                    p.o -= 0.05;
                    if (p.o < p.minO) {
                        p.o = p.minO;
                    }
                }
                angle += 0.0001;
                p.y += Math.cos(angle + p.d) - 2;
                p.x += Math.sin(angle + p.d);
                if (p.x > canvas.width + 5) {
                    p.x = -5;
                    p.d = Math.random() * 50;
                } else if (p.x < -5) {
                    p.x = canvas.width + 5;
                    p.d = Math.random() * 50;
                } else if (p.y < 0) {
                    p.y = canvas.height + 5;
                    p.d = Math.random() * 50;
                }
                // 描繪光點
                var grd = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r + 3);
                grd.addColorStop(0, 'rgba(255, 255, 255, ' + p.o + ')');
                grd.addColorStop(1, 'rgba(' + p.c + ', 0)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.arc(p.x, p.y, p.r + 3, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
            }






            requestAnimationFrame(drawMeter);
        }
        requestAnimationFrame(drawMeter);
    }
}