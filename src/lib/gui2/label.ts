import { ICanvasRenderingContext } from "@babylonjs/core/Engines/ICanvas";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Measure } from "@babylonjs/gui/2D/measure";

import { Anchor } from "./anchor";

export class MyLabel extends Rectangle {
    _textBlock: TextBlock;

    get text(): string {
        return this._textBlock.text;
    }
    set text(val: string) {
        if (this._textBlock.text != val) this._textBlock.text = val;
    }

    constructor(name: string, text: string) {
        super(name);
        this.verticalAlignment = Rectangle.VERTICAL_ALIGNMENT_TOP;
        this.horizontalAlignment = Rectangle.HORIZONTAL_ALIGNMENT_LEFT;
        this.adaptWidthToChildren = true;
        this.adaptHeightToChildren = true;
        this.descendantsOnlyPadding = true;
        this.useBitmapCache = true;
        this._textBlock = new TextBlock("text", text);
        this._textBlock.resizeToFit = true;
        this._textBlock.textWrapping = false;
        this.addControl(this._textBlock);
    }

    anchor = new Anchor(this);

    override _computeAlignment(_parentMeasure: Measure, _context: ICanvasRenderingContext): void {
        if (this.anchor.isLinked) {
            this._currentMeasure.left = this.anchor.x! - this._currentMeasure.width / 2;
            this._currentMeasure.top = this.anchor.y! - this._currentMeasure.height / 2;
        }
    }
}
