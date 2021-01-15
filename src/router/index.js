import Vue from "vue";
import VueRouter from "vue-router";

const Home = () => import('../views/home.vue')

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'home',
        component: Home,
    },
    {
        path: '*',
        redirect: '/home'
    }];

const router = new VueRouter({
    routes,
});
export default router;
