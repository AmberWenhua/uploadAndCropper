<template>
    <div class="home">
        <Uploader
            type="file"
            v-model="img"
            :max-count="1"
            accept="image/*"
            :after-read="afterRead"
            :before-read="beforeRead"
            :preview-options="preOptions"
        >
            <img class="photo" :src="require('@imgs/upload.png')" alt="" />
        </Uploader>
        <Popup
            v-model="showCutImg"
            position="bottom"
            :style="{ height: '100%', background: '#000' }"
            get-container="#cutImg_box"
        >
            <CutImg
                v-if="showCutImg"
                :ratio="1 / 1"
                :img="imgWillCut"
                @cancel="onCutCancel"
                @ok="onCutOk"
            />
        </Popup>
    </div>
</template>

<script>
import { compressImg } from "@tools/handle.js";
import { Uploader, Popup, Toast } from "vant";
import CutImg from "@comp/CutImg";

export default {
    name: "Home",
    components: {
        Uploader,
        Popup,
        CutImg,
    },
    data() {
        return {
            showCutImg: false,
            imgWillCut: "",
            img: []
        };
    },
    computed: {
        preOptions() {
            return {
                showIndex: false,
                closeable: true,
            };
        },
    },
    methods: {
        // 读取图片数据
        afterRead(ctn) {
            this.showCutImg = true;
            console.log("读取图片数据", ctn);
            this.imgWillCut = ctn.content;
        },
        // 读取图片数据之前，检测图片大小
        beforeRead(file) {
            // 大于 2m 小于 10M 则压缩, 大于 10M 则提示图片过大
            return new Promise((resolve, reject) => {
                if (file.size > 10485760) {
                    Toast(`图片大小不得超过10M,请重新选择图片`);
                    return reject(false);
                }
                // 小于5M直接生成
                if (file.size < 2097152) return resolve(file);
                // 大于5M则压缩
                if (file.size >= 2097152) {
                    Toast.loading({
                        message: "图片加载中...",
                        forbidClick: true,
                    });
                    // 对图片进行压缩
                    compressImg(file)
                        .then((fs) => {
                            resolve(fs);
                        })
                        .catch((err) => {
                            console.log("压缩图片报错", err);
                        })
                        .finally(() => {
                            Toast.clear();
                        });
                }
            });
        },
        // 取消裁剪
        onCutCancel() {
            this.showCutImg = false;
        },
        // 裁剪成功
        onCutOk(result) {
            this.showCutImg = false;
            this.img[0].file = result.file;
            this.img[0].content = result.base64;
        },
    },
};
</script>

<style lang="scss">
.home {
    min-height: 100vh;
    font-size: 20px * $scale;
    background-color: rgba(138, 0, 11, 0.7);
    .van-uploader {
        display: block;
        width: 500px * $scale;
        height: 500px * $scale;
        margin: 0 auto;
    }
    .van-uploader__input-wrapper {
        margin: 0 auto;
    }
    .van-uploader__preview {
        margin: 0;
        width: 100%;
    }
    .van-uploader__preview-image {
        width: 100%;
        height: 100%;
    }
}
</style>