import { RegisterClass } from "@babylonjs/core/Misc/typeStore";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";

export class MyLabel extends Rectangle {
    override getClassName(): string {
        return "MyLabel";
    }

    _textBlock: TextBlock;
    get textBlock() {
        return this._textBlock;
    }

    constructor(name: string, text: string) {
        super(name);
        this.adaptWidthToChildren = true;
        this.adaptHeightToChildren = true;
        this._textBlock = new TextBlock("text", text);
        this._textBlock.resizeToFit = true;
        this._textBlock.textWrapping = false;
        this.addControl(this._textBlock);
    }
}

RegisterClass("BABYLON.GUI.MyLabel", MyLabel);
