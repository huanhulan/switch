import {Cell, CellLoop, StreamSink} from "sodiumjs";
import {Channels, Controller, OnOff} from "./types";

export default (sController: StreamSink<Controller>) => {
    const cPowerState = new CellLoop<OnOff>();
    const sPower = sController.filter(v => v === Controller.power).snapshot(cPowerState,
        (p, s) => s === OnOff.off ? OnOff.on : OnOff.off);
    cPowerState.loop(sPower.hold(OnOff.off));
    const sOn = sPower.filter(state => state === OnOff.on);

    const cChannelNum = new CellLoop<number>();
    const sChannel = sController.filter(v => v !== Controller.power)
        .snapshot(cChannelNum, (op, num) => {
            if (op === Controller.ch_minus) {
                const neu = num - 1;
                return neu === -1 || neu === 0 ? 4 : neu;
            } else {
                const neu = num + 1;
                return neu >= 5 ? 1 : neu;
            }
        })
        .orElse(sOn.map(u => 0));
    cChannelNum.loop(sChannel.hold(0));

    const cSignalNone = new Cell<Channels>(Channels.fuzz);
    const cSignalOne = new Cell<Channels>(Channels.one);
    const cSignalTwo = new Cell<Channels>(Channels.two);
    const cSignalThree = new Cell<Channels>(Channels.three);
    const cSignalFour = new Cell<Channels>(Channels.four);

    const cSelected: Cell<Cell<Channels>> = sOn.map(u => cSignalNone)
        .orElse(sChannel.filter(c => c === 1).map(u => cSignalOne))
        .orElse(sChannel.filter(c => c === 2).map(u => cSignalTwo))
        .orElse(sChannel.filter(c => c === 3).map(u => cSignalThree))
        .orElse(sChannel.filter(c => c === 4).map(u => cSignalFour))
        .hold(cSignalNone);

    const cScreen: Cell<Channels|null> = Cell.switchC(cSelected).lift(cPowerState,
        (selected, power) => power === OnOff.on ? selected : null);

    return {
        cScreen,
        cPowerState
    }
}