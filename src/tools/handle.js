const base64ToFile = (dataurl, fileName) => {
    // global atob Uint8Array File
    let arr = dataurl.split(',')
    let imgType = arr[0].match(/:(.*?);/)[1]
    let bstr = atob(arr[1])
    let n = bstr.length
    let u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], fileName, { type: imgType })
}

function fileToBase64(file) {
    // 创建 FileReader 解析为 base64 格式
    let fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    return new Promise((resolve, reject) => {
        // 解析成功
        fileReader.onload = function () {
            resolve(fileReader.result)
        }
        // 发生错误
        fileReader.onerror = function (err) {
            reject('error: 文件讀取發生錯誤', JSON.stringify(err))
        }
    })
}

// 压缩图片
const compressImg = (file) => {
    return new Promise((resolve, reject) => {
        fileToBase64(file)
            .then(src => {
                // 根據 src 渲染圖像
                let img = new Image()
                img.src = src
                // 等待圖片加載完畢
                img.onload = () => {
                    // 根據圖片, 繪製 canvas
                    let canvas = document.createElement('canvas')
                    let ctx = canvas.getContext('2d')
                    let maxWidth = 1024;
                    let scale = Math.min(1, maxWidth / Math.max(img.width, img.height));
                    canvas.width = img.width * scale
                    canvas.height = img.height * scale
                    ctx.fillStyle = '#fff'
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                    // 進行壓縮, 獲取 base64
                    let base64 = canvas.toDataURL('image/jpeg', 0.5)
                    // 響應結果
                    let nfile = base64ToFile(base64, file.name)
                    resolve(nfile)
                }
                img.onerror = (err) => {
                    reject(err)
                }
            }).catch(err => {
                reject(err)
            })
    })
}

export {
    base64ToFile,
    compressImg
};

