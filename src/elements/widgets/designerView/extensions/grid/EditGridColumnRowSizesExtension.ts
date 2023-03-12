import { EventNames } from "../../../../../enums/EventNames.js";
import { convertCssUnit, convertCssUnitToPixel, getCssUnit } from "../../../../helper/CssUnitConverter.js";
import { CalculateGridInformation } from "../../../../helper/GridHelper.js";
import { IDesignItem } from '../../../../item/IDesignItem.js';
import { IDesignerCanvas } from '../../IDesignerCanvas.js';
import { AbstractExtension } from '../AbstractExtension.js';
import { IExtensionManager } from '../IExtensionManger.js';
import { OverlayLayer } from "../OverlayLayer.js";

export class EditGridColumnRowSizesExtension extends AbstractExtension {

  gridInformation: ReturnType<typeof CalculateGridInformation>;

  private _resizers: SVGRectElement[] = [];
  private _initalPos: number;
  private _initialSizes: string;

  constructor(extensionManager: IExtensionManager, designerView: IDesignerCanvas, extendedItem: IDesignItem) {
    super(extensionManager, designerView, extendedItem);
  }

  override extend(event?: Event) {
    this.refresh(event);
  }

  override refresh(event?: Event) {
    this.gridInformation = CalculateGridInformation(this.extendedItem);

    this.gridInformation.gaps.forEach((gap, i) => {
      if (gap.width < 3) { gap.width = 3; gap.x--; }
      if (gap.height < 3) { gap.height = 3; gap.y--; }
      let rect = this._drawRect(gap.x, gap.y, gap.width, gap.height, 'svg-grid-resizer-' + gap.type, this._resizers[i], OverlayLayer.Normal);
      if (!this._resizers[i]) {
        this._resizers[i] = rect;
        rect.addEventListener(EventNames.PointerDown, event => this._pointerActionTypeResize(event, rect, gap));
        rect.addEventListener(EventNames.PointerMove, event => this._pointerActionTypeResize(event, rect, gap));
        rect.addEventListener(EventNames.PointerUp, event => this._pointerActionTypeResize(event, rect, gap));
      }
    });
  }

  private _pointerActionTypeResize(event: PointerEvent, rect: SVGRectElement, gap: ReturnType<typeof CalculateGridInformation>['gaps'][0]) {
    event.stopPropagation();

    const templatePropertyName = gap.type == 'h' ? 'gridTemplateRows' : 'gridTemplateColumns';
    const axisPropertyName = gap.type == 'h' ? 'Y' : 'X';
    const index = (gap.type == 'h' ? gap.row : gap.column) - 1;
    const sizeType = gap.type == 'h' ? 'height' : 'width';
    const pos = event['client' + axisPropertyName];
    switch (event.type) {
      case EventNames.PointerDown:
        rect.setPointerCapture(event.pointerId);
        this._initalPos = pos;
        this._initialSizes = getComputedStyle(this.extendedItem.element)[templatePropertyName];
        break;
      case EventNames.PointerMove:
        if (this._initialSizes) {
          const diff = this._initalPos - pos;
          let parts = this._initialSizes.split(' ');
          parts[index] = (parseFloat(parts[index]) - diff) + 'px';
          parts[index + 1] = (parseFloat(parts[index + 1]) + diff) + 'px';
          (<HTMLElement>this.extendedItem.element).style[templatePropertyName] = parts.join(' ');
          this.extensionManager.refreshExtensions([this.extendedItem], null, event);
        }
        break;
      case EventNames.PointerUp:
        rect.releasePointerCapture(event.pointerId);
        const diff = this._initalPos - pos;
        const realStyle = this.extendedItem.getStyleFromSheetOrLocalOrComputed(templatePropertyName);
        const initialParts = this._initialSizes.split(' ');
        const parts = realStyle.split(' ');
        let units = parts.map(x => getCssUnit(x));
        if (parts.length != initialParts.length) {
          units = initialParts.map(x => getCssUnit(x));
        }
        (<HTMLElement>this.extendedItem.element).style[templatePropertyName] = '';

        const targetPixelSizes = initialParts.map(x => parseFloat(x));
        targetPixelSizes[index] -= diff;
        targetPixelSizes[index + 1] += diff;
        const newSizes = this._convertCssUnits(targetPixelSizes, units, <HTMLElement>this.extendedItem.element, sizeType);

        this.extendedItem.updateStyleInSheetOrLocal(templatePropertyName, newSizes.join(' '));

        this._initalPos = null;
        this._initialSizes = null;
        this.extensionManager.refreshExtensions([this.extendedItem]);
        break;
    }
  }

  private _convertCssUnits(pixelSizes: number[], targetUnits: string[], target: HTMLElement, percentTarget: 'width' | 'height'): string[] {
    let cp = getComputedStyle(target);
    let bounding = target.getBoundingClientRect();
    let containerSize = bounding[percentTarget];
    let amountGaps = percentTarget == "height" ? this.gridInformation.cells.length - 1 : this.gridInformation.cells[0].length - 1;
    let gapValue = percentTarget == "width" ? cp.columnGap : cp.rowGap;
    if (gapValue == "normal")
      gapValue = '0px';
    let gapSize = convertCssUnitToPixel(gapValue, target, percentTarget) ?? 0;
    let containerSizeWithoutGaps = containerSize - gapSize * amountGaps;
    let sizeForFrs = containerSizeWithoutGaps;

    for (let i = 0; i < pixelSizes.length; i++) {
      if (targetUnits[i] != 'fr')
        sizeForFrs -= pixelSizes[i];
    }

    let result: string[] = [];
    for (let i = 0; i < pixelSizes.length; i++) {
      if (targetUnits[i] != 'fr') {
        result.push(convertCssUnit(pixelSizes[i], target, percentTarget, targetUnits[i]));
      } else {
        result.push(((pixelSizes[i] / sizeForFrs) * 10).toFixed(2) + 'fr');
      }
    }
    return result;
  }

  override dispose() {
    this._removeAllOverlays();
  }
}