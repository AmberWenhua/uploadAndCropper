/* eslint-disable */
import axios from 'axios';

const drawImgCache = {};

class Draw {
    constructor(w, h) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx = this.canvas.getContext('2d');
    }

    init(w, h) {
        this.ctx.clearRect(0, 0, this.canvas.w, this.canvas.h);
        this.canvas.width = w;
        this.canvas.height = h;
    }

    clear(x, y, w, h, options) {
        const _options = Object.assign({
            rotate: 0,
            fillColor: null
        }, options);
        if (_options.rotate) {
            this.ctx.save();
            const rotate = _options.rotate * Math.PI / 180;
            this.ctx.translate(x, y);
            this.ctx.rotate(rotate);
            this.ctx.clearRect(0, 0, w, h);
            if (_options.fillColor) {
                this.ctx.fillStyle = _options.fillColor;
                this.ctx.fillRect(0, 0, w, h);
            }
            this.ctx.translate(-x, -y);
            this.ctx.restore();
        } else {
            this.ctx.clearRect(x, y, w, h);
            if (_options.fillColor) {
                this.ctx.fillStyle = _options.fillColor;
                this.ctx.fillRect(x, y, w, h);
            }
        }
    }

    fillBg(color) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fill();
        this.ctx.restore();
    }

    getImg(source) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject('getImg err');
            this.getImgUrl(source)
                .then(url => {
                    if (url.indexOf('http') >= 0) {
                        img.crossOrigin = '';
                    }
                    img.src = url;
                })
                .catch(err => reject(err));
        });
    }

    getImgUrl(source = '') {
        return new Promise((resolve, reject) => {
            if (source.indexOf('data:image/') >= 0) {
                resolve(source);
            } else if (drawImgCache[source]) {
                console.log('从缓存获取图片');
                resolve(drawImgCache[source]);
            } else {
                axios.get(source, { responseType: 'blob' })
                    .then(data => {
                        let reader = new FileReader();
                        reader.onload = (e) => {
                            drawImgCache[source] = e.currentTarget.result;
                            resolve(e.currentTarget.result);
                        };
                        reader.onerror = (e) => reject(e);
                        reader.readAsDataURL(data.data);
                    })
                    .catch(err => reject(err));
            }
        });
    }

    drawImg(source, x = 0, y = 0, w = -1, h = -1, options) {
        return new Promise((resolve, reject) => {
            const _options = Object.assign({
                isCircle: false,
                rotate: 0,
                fit: '',
                position: 'top-left',
                radius: 0
            }, options);
            this.getImg(source)
                .then(img => {
                    const sw = img.width;
                    const sh = img.height;
                    if (w === -1) {
                        w = sw;
                    }
                    if (h === -1) {
                        h = sh;
                    }
                    const offset = {
                        x: 0,
                        y: 0,
                        w,
                        h
                    };
                    let clip = false;
                    if (_options.fit === 'cover') {
                        const scale = Math.max(w / sw, h / sh);
                        offset.w = sw * scale;
                        offset.h = sh * scale;
                        const cx = -(offset.w - w) / 2;
                        const cy = -(offset.h - h) / 2;
                        switch (_options.position) {
                            case 'top-left':
                                offset.x = 0;
                                offset.y = 0;
                                break;
                            case 'top-center':
                                offset.x = cx;
                                offset.y = 0;
                                break;
                            case 'top-right':
                                offset.x = cx * 2;
                                offset.y = 0;
                                break;
                            case 'center-left':
                                offset.x = 0;
                                offset.y = cy;
                                break;
                            case 'center-center':
                                offset.x = cx;
                                offset.y = cy;
                                break;
                            case 'center-right':
                                offset.x = cx * 2;
                                offset.y = cy;
                                break;
                            case 'bottom-left':
                                offset.x = 0;
                                offset.y = cy * 2;
                                break;
                            case 'bottom-center':
                                offset.x = cx;
                                offset.y = cy * 2;
                                break;
                            case 'bottom-right':
                                offset.x = cx * 2;
                                offset.y = cy * 2;
                                break;
                        }
                        if (scale !== 1) {
                            clip = true;
                        }
                    }
                    if (_options.isCircle) {
                        this.ctx.save();
                        this.ctx.beginPath();
                        this.ctx.arc(x + w / 2, y + w / 2, w / 2, 0, 2 * Math.PI, false);
                        this.ctx.clip();
                        this.ctx.drawImage(img, x, y, w, w);
                        this.ctx.closePath();
                        this.ctx.restore();
                    } else {
                        if (_options.rotate) {
                            this.ctx.save();
                            const rotate = _options.rotate * Math.PI / 180;
                            this.ctx.translate(x, y);
                            this.ctx.rotate(rotate);
                            if (clip) {
                                this.ctx.rect(0, 0, w, h);
                                this.ctx.clip();
                            }
                            this.ctx.drawImage(img, offset.x, offset.y, offset.w, offset.h);
                            this.ctx.translate(-x, -y);
                            this.ctx.restore();
                        } else {
                            if (clip) {
                                this.ctx.save();
                                this.ctx.rect(x, y, w, h);
                                this.ctx.clip();
                            }
                            this.ctx.drawImage(img, x + offset.x, y + offset.y, offset.w, offset.h);
                            if (clip) {
                                this.ctx.restore();
                            }
                        }
                    }
                    // if (_options.radius) {
                    //     const radius = _options.radius;
                    //     console.log(radius);
                    //     this.ctx.save();
                    //     this.ctx.beginPath();
                    //     this.ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2, false);
                    //     this.ctx.lineTo(w - radius + x, y);
                    //     this.ctx.arc(w - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2, false);
                    //     this.ctx.lineTo(w + x, h + y - radius);
                    //     this.ctx.arc(w - radius + x, h - radius + y, radius, 0, Math.PI * 1 / 2, false);
                    //     this.ctx.lineTo(radius + x, h + y);
                    //     this.ctx.arc(radius + x, h - radius + y, radius, Math.PI * 1 / 2, Math.PI, false);
                    //     this.ctx.clip();
                    //     this.ctx.drawImage(img, x, y, w, w);
                    //     this.ctx.closePath();
                    //     this.ctx.restore();
                    // }
                    resolve(this);
                })
                .catch(e => {
                    console.log(e);
                    resolve(this);
                });
        });
    }

    drawCircle(x, y, r, color) {
        return new Promise((resolve, reject) => {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(x + r, y + r, r, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.closePath();
            this.ctx.restore();
            resolve(this);
        });
    }

    drawText(text, x, y, options) {
        if (text === undefined) {
            text = '';
        }
        return new Promise((resolve, reject) => {
            const _options = Object.assign({
                fontWeight: 'normal',
                fontSize: 28,
                fontFamily: 'Arial',
                color: '#000000',
                center: false,
                rotate: 0,
                maxLine: 1,
                maxWidth: 0,
                lineSpace: 0,
                textLine: false,
                textBaseline: 'top',
            }, options);
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.font = `${_options.fontWeight} ${_options.fontSize}px ${_options.fontFamily}`;
            this.ctx.fillStyle = _options.color;
            this.ctx.textBaseline = _options.textBaseline;
            let dText = `${text}`.split('');
            let textList = [];
            let textWidth = this.ctx.measureText(dText.join('')).width;
            let line = _options.maxLine;
            if (_options.maxWidth > 0 && textWidth > _options.maxWidth) {
                while (line > 1) {
                    line--;
                    let text = dText.shift();
                    while (this.ctx.measureText(text).width < _options.maxWidth) {
                        const w = dText.shift();
                        if (this.ctx.measureText(text + w).width > _options.maxWidth) {
                            dText.unshift(w);
                            break;
                        }
                        if(w === undefined) {
                            break;
                        }else {
                            text += w;
                        }
                    }
                    textList.push(text);
                }
                dText = dText.join('');
                if (this.ctx.measureText(dText).width > _options.maxWidth) {
                    const ellipsis = '...';
                    const eWidth = this.ctx.measureText(ellipsis).width;
                    while (eWidth <= _options.maxWidth) {
                        dText = dText.slice(0, -1);
                        if (dText === '' || this.ctx.measureText(dText).width + eWidth <= _options.maxWidth) {
                            break;
                        }
                    }
                    textWidth = this.ctx.measureText(dText).width + eWidth;
                    dText += ellipsis;
                }
                textList.push(dText);
            } else {
                textList.push(dText.join(''));
            }
            if(_options.textLine) {
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = _options.color;
                this.ctx.moveTo(x, y)
                this.ctx.lineTo(x + textWidth, y)
                this.ctx.stroke();
            }
            if (_options.center) {
                x -= textWidth / 2;
            }
            if (_options.rotate) {
                this.ctx.save();
                const rotate = _options.rotate * Math.PI / 180;
                if (options.center) {
                    y += -1 * Math.sin(rotate) * textWidth / 2;
                }
                this.ctx.translate(x, y);
                this.ctx.rotate(rotate);
                textList.forEach((text, index) => {
                    this.ctx.fillText(text, 0, index * _options.fontSize * _options.lineSpace);
                });
                this.ctx.translate(-x, -y);
                this.ctx.restore();
            } else {
                textList.forEach((text, index) => {
                    this.ctx.fillText(text, x, y + index * _options.fontSize + index * _options.lineSpace);
                });
            }
            this.ctx.closePath();
            this.ctx.restore();
            resolve(this);
        });
    }

    export() {
        return this.canvas.toDataURL('image/png');
    }
}

export default Draw;