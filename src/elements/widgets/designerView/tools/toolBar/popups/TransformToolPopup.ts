import { html, BaseCustomWebComponentConstructorAppend, css } from '@node-projects/base-custom-webcomponent';
import { DesignerToolbar } from '../DesignerToolbar';
import { filterChildPlaceItems } from '../../../../../helper/LayoutHelper';
import { IRect } from '../../../../../../interfaces/IRect';
import { IDesignItem } from '../../../../../item/IDesignItem';
import { IPoint } from '../../../../../../interfaces/IPoint';
import { DesignerView } from '../../../designerView';
import { IDesignerCanvas } from '../../../IDesignerCanvas';

export class TransformToolPopup extends BaseCustomWebComponentConstructorAppend {
  private _designerView: DesignerView;
  private _previousSelectionRect: IRect;
  private _selectionChanged: boolean;

  private _relativeButton: HTMLButtonElement;
  private _absoluteButton: HTMLButtonElement;
  private _applyButton: HTMLButtonElement;

  private _inputX: HTMLInputElement;
  private _inputY: HTMLInputElement;
  private _inputR: HTMLInputElement;

  private _originTopLeft: HTMLInputElement;
  private _originTopMid: HTMLInputElement;
  private _originTopRight: HTMLInputElement;
  private _originMidLeft: HTMLInputElement;
  private _originMidMid: HTMLInputElement;
  private _originMidRight: HTMLInputElement;
  private _originBotLeft: HTMLInputElement;
  private _originBotMid: HTMLInputElement;
  private _originBotRight: HTMLInputElement;

  private _transformMode: "relative" | "absolute";
  private _transformOrigin: "topLeft" | "topMid" | "topRight" | "midLeft" | "midMid" | "midRight" | "botLeft" | "botMid" | "botRight";

  static override style = css`
      .container {
          width: 220px;
          min-height: 200px;
          color: white;
          background-color: rgb(64, 64, 64);
          border: 1px solid black;
      }
      header {
          text-align: center;
      }
      .inputs{
        float: left;
        margin-top: 5px;
        align-items: center;
      }
      .input {
        display: flex;
        align-items: center; 
        margin-top: 5px;
      }
      .text {
        margin-left: 5px;
        font-size: 14px;
      }
      .strokecolor{ 
        float: both;
      }
      .fillbrush{
        float: both;
      }
      .strokethickness{
        float: both;
      }
      #input-div{
        display: grid;
        grid-template-columns: 1fr 9fr;
        grid-template-rows: 25px 25px 25px;
        grid-row-gap: 2px;
        font-size: small;
        margin: 10px;
      }
      #button-div{
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 25px;
        font-size: small;
        margin: 10px;
        grid-column-gap: 5px
      }
      #apply-div{
        font-size: small;
        justify-content: center;
        width: 100%;
        margin-top: 10px;
        margin-bottom: 10px;
        display: flex;
      }
      #cube{
        display: grid;
        grid-template-columns: 20px 20px 20px;
        grid-template-rows: 20px 20px 20px;
        grid-gap: 10px;
        padding: 10px;
        top: -80px;
        position: relative;
      }
      #cube-background{
        width: 60px;
        height: 60px;
        background: gray;
        margin-top: 20px;
        margin-left: 20px;
      }
      `

  static override template = html`
        <div class="container">
          <header>
            <h2 id="title" style="margin:0px;">Transform</h2>
          </header>
          <main id="content-area">
            <div id="input-div">
              <span>X:</span>
              <input type="number" id="transform-input-x">
              <span>Y:</span>
              <input type="number" id="transform-input-y">
              <span>R:</span>
              <input type="number" id="transform-input-r">
            </div>
            <div id="button-div">
              <button id="transform-button-absolute">absolute</button>
              <button id="transform-button-relative">relative</button>
            </div>

            <div style="justify-content: center; display: grid; height: 100px">
              <div id="cube-background"></div>
                <div id="cube">
                  <input id="origin-top-left" type="radio" name="origin-radio">
                  <input id="origin-top-mid" type="radio" name="origin-radio">
                  <input id="origin-top-right" type="radio" name="origin-radio">
                  <input id="origin-mid-left" type="radio" name="origin-radio">
                  <input id="origin-mid-mid" type="radio" name="origin-radio" checked>
                  <input id="origin-mid-right" type="radio" name="origin-radio">
                  <input id="origin-bot-left" type="radio" name="origin-radio">
                  <input id="origin-bot-mid" type="radio" name="origin-radio">
                  <input id="origin-bot-right" type="radio" name="origin-radio">
                </div>
            </div>

            <div id="apply-div">
              <button id="transform-button-apply" style="width:100px;">apply</button>
            </div>
          </main>
        </div>`;

  constructor() {
    super();

    this._relativeButton = this._getDomElement<HTMLButtonElement>("transform-button-relative");
    this._absoluteButton = this._getDomElement<HTMLButtonElement>("transform-button-absolute");
    this._applyButton = this._getDomElement<HTMLButtonElement>("transform-button-apply");

    this._inputX = this._getDomElement<HTMLInputElement>("transform-input-x");
    this._inputY = this._getDomElement<HTMLInputElement>("transform-input-y");
    this._inputR = this._getDomElement<HTMLInputElement>("transform-input-r");

    this._originTopLeft = this._getDomElement<HTMLInputElement>("origin-top-left");
    this._originTopMid = this._getDomElement<HTMLInputElement>("origin-top-mid");
    this._originTopRight = this._getDomElement<HTMLInputElement>("origin-top-right");
    this._originMidLeft = this._getDomElement<HTMLInputElement>("origin-mid-left");
    this._originMidMid = this._getDomElement<HTMLInputElement>("origin-mid-mid");
    this._originMidRight = this._getDomElement<HTMLInputElement>("origin-mid-right");
    this._originBotLeft = this._getDomElement<HTMLInputElement>("origin-bot-left");
    this._originBotMid = this._getDomElement<HTMLInputElement>("origin-bot-mid");
    this._originBotRight = this._getDomElement<HTMLInputElement>("origin-bot-right");

    this._relativeButton.onclick = () => this._changePositionMode("relative");
    this._absoluteButton.onclick = () => this._changePositionMode("absolute");
    this._applyButton.onclick = () => this._applyTransform();

    this._transformMode = "relative";
    this._changePositionMode(this._transformMode);
  }

  private _changePositionMode(mode: "relative" | "absolute") {
    if (mode == "relative") {
      this._relativeButton.style.backgroundColor = "#6F8A9D";
      this._relativeButton.style.color = "black"
      this._absoluteButton.style.backgroundColor = "#A4B5C1";
      this._absoluteButton.style.color = "#77716E"
    }
    else {
      this._absoluteButton.style.backgroundColor = "#6F8A9D";
      this._absoluteButton.style.color = "black"
      this._relativeButton.style.backgroundColor = "#A4B5C1";
      this._relativeButton.style.color = "#77716E"
    }
    this._transformMode = mode;
  }

  private _applyTransform() {
    this._checkOrigin();
    this._designerView = (<DesignerToolbar>(<ShadowRoot>this.getRootNode()).host).designerView;
    let selection = this._designerView.instanceServiceContainer.selectionService.selectedElements;
    selection = filterChildPlaceItems(selection);

    this._selectionChanged = false;
    this._designerView.instanceServiceContainer.selectionService.onSelectionChanged.once(() => {
      this._selectionChanged = true;
      this._previousSelectionRect = null;
    });


    if (selection) {
      let inputPos: IPoint = {
        x: this._inputX.valueAsNumber ? this._inputX.valueAsNumber : 0,
        y: this._inputY.valueAsNumber ? this._inputY.valueAsNumber : 0
      }
      let inputRotation = this._inputR.valueAsNumber ? this._inputR.valueAsNumber : 0;

      let grp = selection[0].openGroup("Transform selection")
      if (!this._previousSelectionRect || this._selectionChanged)
        this._previousSelectionRect = TransformToolPopup.calculateSelectionRect(selection, this._designerView.designerCanvas);
      let origin = this._calculateTransformOriginPosition(this._previousSelectionRect);
      for (let item of selection) {
        let itemPos: IRect = {
          x: parseFloat(item.getStyle("left")),
          y: parseFloat(item.getStyle("top")),
          width: parseFloat(item.getStyle("width")),
          height: parseFloat(item.getStyle("height"))
        }
        let itemRotStyle = item.getStyle("transform")
        let itemRotation = 0;
        if (itemRotStyle)
          itemRotation = parseFloat(item.getStyle("transform").replaceAll("rotate(", "").replaceAll("deg)", ""));
        let newPos = this._calculateTransform(this._previousSelectionRect, origin, itemPos, inputRotation, inputPos, this._transformMode)

        item.setStyle("left", newPos.x.toString() + "px");
        item.setStyle("top", newPos.y.toString() + "px");

        let rotation: number;
        if (this._transformMode == 'relative')
          rotation = itemRotation + inputRotation;
        else
          rotation = inputRotation;

        while (rotation >= 360)
          rotation -= 360;
        if (rotation != 0)
          item.setStyle("transform", "rotate(" + rotation + "deg)");
        else
          item.removeStyle("transform");
      }
      grp.commit();
    }
  }

  public static calculateSelectionRect(selection: IDesignItem[], designerCanvas: IDesignerCanvas): IRect {
    let min: IPoint = { x: Number.MAX_VALUE, y: Number.MAX_VALUE };
    let max: IPoint = { x: Number.MIN_VALUE, y: Number.MIN_VALUE };
    let elementRect: IRect;

    for (let s of selection) {
      elementRect = {
        x: designerCanvas.getNormalizedElementCoordinates(s.element).x,
        y: designerCanvas.getNormalizedElementCoordinates(s.element).y,
        width: designerCanvas.getNormalizedElementCoordinates(s.element).width,
        height: designerCanvas.getNormalizedElementCoordinates(s.element).height
      }

      // calculate min and max of selection
      if (elementRect.x < min.x)
        min.x = elementRect.x;
      if (elementRect.y < min.y)
        min.y = elementRect.y;
      if (elementRect.x + elementRect.width > max.x)
        max.x = elementRect.x + elementRect.width;
      if (elementRect.y + elementRect.height > max.y)
        max.y = elementRect.y + elementRect.height;
    }

    // calculate reckt around selection
    return {
      x: min.x,
      y: min.y,
      width: max.x - min.x,
      height: max.y - min.y
    }
  }

  private _calculateTransformOriginPosition(selectionRect: IRect): IPoint {
    switch (this._transformOrigin) {
      case "topLeft":
        return { x: selectionRect.x, y: selectionRect.y }
      case "topMid":
        return { x: selectionRect.x + selectionRect.width / 2, y: selectionRect.y }
      case "topRight":
        return { x: selectionRect.x + selectionRect.width, y: selectionRect.y }
      case "midLeft":
        return { x: selectionRect.x, y: selectionRect.y + selectionRect.height / 2 }
      case "midMid":
        return { x: selectionRect.x + selectionRect.width / 2, y: selectionRect.y + selectionRect.height / 2 }
      case "midRight":
        return { x: selectionRect.x + selectionRect.width, y: selectionRect.y + selectionRect.height / 2 }
      case "botLeft":
        return { x: selectionRect.x, y: selectionRect.y + selectionRect.height }
      case "botMid":
        return { x: selectionRect.x + selectionRect.width / 2, y: selectionRect.y + selectionRect.height }
      case "botRight":
        return { x: selectionRect.x + selectionRect.width, y: selectionRect.y + selectionRect.height }
    }
  }

  private _checkOrigin() {
    if (this._originTopLeft.checked)
      this._transformOrigin = "topLeft";
    else if (this._originTopMid.checked)
      this._transformOrigin = "topMid";
    else if (this._originTopRight.checked)
      this._transformOrigin = "topRight";
    else if (this._originMidLeft.checked)
      this._transformOrigin = "midLeft";
    else if (this._originMidMid.checked)
      this._transformOrigin = "midMid";
    else if (this._originMidRight.checked)
      this._transformOrigin = "midRight";
    else if (this._originBotLeft.checked)
      this._transformOrigin = "botLeft";
    else if (this._originBotMid.checked)
      this._transformOrigin = "botMid";
    else if (this._originBotRight.checked)
      this._transformOrigin = "botRight";
  }


  private _calculateTransform(selectionRect: IRect, origin: IPoint, itemRect: IRect, rotation: number, inputPos: IPoint, transformMode: 'relative' | 'absolute'): IPoint {
    let newPoint: IPoint;
    // convert deg in rad
    rotation = rotation * (Math.PI / 180);
    if (transformMode == 'absolute') {
      inputPos = {
        x: inputPos.x - selectionRect.x,
        y: inputPos.y - selectionRect.y
      }
    }
    origin = {
      x: origin.x - itemRect.width / 2,
      y: origin.y - itemRect.height / 2
    }
    let diffItemPosToOrigin: IPoint = {
      x: itemRect.x - origin.x,
      y: itemRect.y - origin.y
    }

    newPoint = {
      x: Math.cos(rotation) * diffItemPosToOrigin.x - Math.sin(rotation) * diffItemPosToOrigin.y + origin.x + inputPos.x,
      y: Math.sin(rotation) * diffItemPosToOrigin.x + Math.cos(rotation) * diffItemPosToOrigin.y + origin.y + inputPos.y
    }

    return newPoint;
  }
}


customElements.define('node-projects-designer-transformtool-popup', TransformToolPopup);