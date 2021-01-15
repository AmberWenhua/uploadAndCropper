<template>
    <div class="cut_img">
        <div class="top_panel">
            <span @click="$emit('cancel')">取消</span>
            <span @click="save">完成</span>
        </div>
        <div class="container">
            <div class="img-container">
                <img :src="img" ref="image" />
            </div>
        </div>
        <div class="bottom_panel">
            <div @click="rotate">
                <VantIcon :name="require('@imgs/icon/rotate.png')" />
                <span>旋转</span>
            </div>
            <div @click="resetRotate">
                <VantIcon :name="require('@imgs/icon/reset.png')" />
                <span>还原</span>
            </div>
        </div>
    </div>
</template>

<script>
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { base64ToFile } from "@tools/handle.js";
import { Icon as VantIcon } from "vant";

export default {
    name: "CutImg",
    props: {
        width: {
            type: Number,
            default: window.innerWidth * 0.8,
        },
        height: {
            type: Number,
            default: window.innerWidth * 0.8 * 0.5625,
        },
        img: String,
        ratio: {
            type: Number,
            default: 1,
        },
    },
    components: { VantIcon },
    data() {
        return {
            myCropper: null,
            cropperInstance: null,
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            let vm = this;
            this.myCropper = new Cropper(this.$refs.image, {
                aspectRatio: this.ratio,
                dragMode: "move",
                background: false,
                ready() {
                    vm.cropperInstance = this.cropper;
                },
            });
        },
        rotate() {
            this.cropperInstance.rotate(-90);
        },
        resetRotate() {
            this.cropperInstance.reset();
        },
        save() {
            let base64 = this.myCropper
                .getCroppedCanvas({
                    imageSmoothingQuality: "medium",
                })
                .toDataURL("image/jpeg");
            let file = base64ToFile(
                base64,
                `${new Date().getTime().toString()}.jpg`
            );
            this.$emit("ok", { base64, file });
        },
    },
};
</script>

<style lang="scss" scoped>
.cut_img {
    display: flex;
    display: -webkit-flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 90vh;
    background-color: #000;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    .top_panel,
    .bottom_panel {
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        position: absolute;
        top: 130px * $scale;
        width: 100vw;
        color: white;
        font-size: 40px * $scale;
    }
    .top_panel {
        top: 0;
        font-size: 32px * $scale;
        width: 100%;
        > span {
            margin: 30px * $scale;
        }
    }
    .container {
        width: 100vw;
        height: 75%;
        display: flex;
        .img-container {
            width: 100%;
        }
    }
    .bottom_panel {
        top: unset;
        bottom: 0;
        padding: 0 50px * $scale;
        box-sizing: border-box;
        > div {
            display: flex;
            display: -webkit-flex;
            flex-direction: column;
            align-items: center;
            justify-items: center;
            > .van-icon {
                font-size: 50px * $scale;
                margin-bottom: 40px * $scale;
            }
            > span {
                font-size: 28px * $scale;
            }
        }
    }
}
</style>
