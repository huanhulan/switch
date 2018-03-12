import {Operational, StreamSink, Transaction} from "sodiumjs";
import frp from "./frp";
import generateNoise from "./noize";
import * as styles from "./style/index.scss";
import {Channels, Controller, OnOff} from "./types";
import * as modernizrConfig from "./../.modernizrrc.json";

const modernizr = modernizrConfig;
const features = ["cssvhunit", "cssgrid", "canvas",];
const $app = document.getElementById("viewport") as HTMLDivElement;

window.onload = () => {
    const supports = features.map(f => modernizr[f]);
    if (supports.filter(support => !support).length) {
        const notSupports = supports.reduce((tupple, support, index) => {
            if (!support) {
                tupple.push(features[index]);
            }
            return tupple;
        }, []).join(", ");
        $app.innerHTML = `Your browser does not support: ${notSupports}.`
            + "Please use modern browsers like Chrome to get the best user experience.";
        return;
    }
    console.log(styles)
    const $canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const $power = document.getElementById("power") as HTMLCanvasElement;
    const $chanel_plus = document.getElementById("ch-plus") as HTMLCanvasElement;
    const $chanel_minus = document.getElementById("ch-minus") as HTMLCanvasElement;
    const getNoizyPoints = generateNoise($canvas);

    Transaction.run(() => {
        const sControl: StreamSink<Controller> = new StreamSink();

        document.body.addEventListener('mousedown', e => {
            switch (e.target) {
                case $power:
                    sControl.send(Controller.power);
                    break;
                case $chanel_plus:
                    sControl.send(Controller.ch_plus);
                    break;
                case $chanel_minus:
                    sControl.send(Controller.ch_minus);
                    break;
                default:
                    break;
            }
        });

        const {cScreen, cPowerState} = frp(sControl);

        Operational.value(cPowerState).listen((p) => {
            p === OnOff.on ? $power.classList.add('active') : $power.classList.remove('active')
        });

        Operational.value(cScreen).listen((s) => {
            switch (s) {
                case Channels.fuzz:
                    $canvas.className = "canvas";
                    getNoizyPoints.run();
                    break;
                case Channels.one:
                    $canvas.className = "canvas ch ch-1";
                    getNoizyPoints.stop();
                    break;
                case Channels.two:
                    $canvas.className = "canvas ch ch-2";
                    getNoizyPoints.stop();
                    break;
                case Channels.three:
                    $canvas.className = "canvas ch ch-3";
                    getNoizyPoints.stop();
                    break;
                case Channels.four:
                    $canvas.className = "canvas ch ch-4";
                    getNoizyPoints.stop();
                    break;
                case null:
                default:
                    $canvas.className = "canvas";
                    getNoizyPoints.stop();
                    break;
            }
        });
    });
};
