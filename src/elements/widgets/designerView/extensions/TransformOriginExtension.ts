import { EventNames } from "../../../../enums/EventNames";
import { IPoint } from "../../../../interfaces/IPoint";
import { IDesignItem } from "../../../item/IDesignItem";
import { IDesignerCanvas } from "../IDesignerCanvas";
import { AbstractExtension } from './AbstractExtension';
import { IExtensionManager } from "./IExtensionManger";

export class TransformOriginExtension extends AbstractExtension {
  private _startPos: IPoint;
  private _circle: SVGCircleElement;
  private _circle2: SVGCircleElement;

  constructor(extensionManager: IExtensionManager, designerView: IDesignerCanvas, extendedItem: IDesignItem) {
    super(extensionManager, designerView, extendedItem);
  }

  override extend() {
    const rect = this.extendedItem.element.getBoundingClientRect();
    const computed = getComputedStyle(this.extendedItem.element);
    const to = computed.transformOrigin.split(' ');
    this._circle = this._drawCircle((rect.x - this.designerCanvas.containerBoundingRect.x) / this.designerCanvas.scaleFactor + Number.parseFloat(to[0].replace('px', '')), (rect.y - this.designerCanvas.containerBoundingRect.y) / this.designerCanvas.scaleFactor + Number.parseFloat(to[1].replace('px', '')), 5 / this.designerCanvas.scaleFactor, 'svg-transform-origin');
    this._circle.style.strokeWidth = (1 / this.designerCanvas.zoomFactor).toString();
    this._circle.style.cursor = 'pointer';
    this._circle2 = this._drawCircle((rect.x - this.designerCanvas.containerBoundingRect.x) / this.designerCanvas.scaleFactor + Number.parseFloat(to[0].replace('px', '')), (rect.y - this.designerCanvas.containerBoundingRect.y) / this.designerCanvas.scaleFactor + Number.parseFloat(to[1].replace('px', '')), 1 / this.designerCanvas.scaleFactor, 'svg-transform-origin');
    this._circle2.style.strokeWidth = (1 / this.designerCanvas.zoomFactor).toString();
    this._circle2.style.pointerEvents = 'none';
+++ Check this after merge +++
    const toInPercentage = [];
    toInPercentage[0] = parseInt(to[0].replaceAll('px', '')) / parseInt(computed.width);
    toInPercentage[1] = parseInt(to[1].replaceAll('px', '')) / parseInt(computed.height);
    this._circle = this._drawCircle((rect.x - this.designerCanvas.containerBoundingRect.x) / this.designerCanvas.scaleFactor + toInPercentage[0] * rect.width, (rect.y - this.designerCanvas.containerBoundingRect.y) / this.designerCanvas.scaleFactor + toInPercentage[1] * rect.height, 5, 'svg-transform-origin');
    this._circle.setAttribute('style', 'cursor: pointer');
    this._circle2 = this._drawCircle((rect.x - this.designerCanvas.containerBoundingRect.x) / this.designerCanvas.scaleFactor + toInPercentage[0] * rect.width, (rect.y - this.designerCanvas.containerBoundingRect.y) / this.designerCanvas.scaleFactor + toInPercentage[1] * rect.height, 1, 'svg-transform-origin');
    this._circle2.setAttribute('style', 'pointer-events: none');
+++ Check this after merge +++
    this._circle.addEventListener(EventNames.PointerDown, event => this.pointerEvent(event));
    this._circle.addEventListener(EventNames.PointerMove, event => this.pointerEvent(event));
    this._circle.addEventListener(EventNames.PointerUp, event => this.pointerEvent(event)); //TODO: -> assign to window
+++ Check this after merge +++
    if (this.extendedItem.styles.get('transform-origin') == null || this.extendedItem.styles.get('transform-origin') == '') {
      this.extendedItem.setStyle('transform-origin', this._circle.getAttribute('cx') + ' ' + this._circle.getAttribute('cy'));
    }
+++ Check this after merge +++
  }

  pointerEvent(event: PointerEvent) {
    event.stopPropagation();

    const rect = this.extendedItem.element.getBoundingClientRect();
    const rectNr = this.designerCanvas.getNormalizedElementCoordinates(this.extendedItem.element); //.getBoundingClientRect();
    const computed = getComputedStyle(this.extendedItem.element);
    const to = computed.transformOrigin.split(' ');

    const normalized = this.designerCanvas.getNormalizedEventCoordinates(event);
    switch (event.type) {
      case EventNames.PointerDown:
        (<Element>event.target).setPointerCapture(event.pointerId);
        this._startPos = { x: normalized.x, y: normalized.y };
        break;
      case EventNames.PointerMove:
        if (this._startPos && event.buttons > 0) {
          const dx = normalized.x - this._startPos.x;
          const dy = normalized.y - this._startPos.y;
          this._circle.setAttribute('cx', <any>((rect.x - this.designerCanvas.containerBoundingRect.x) / this.designerCanvas.scaleFactor + Number.parseFloat(to[0].replace('px', '')) + dx));
          this._circle.setAttribute('cy', <any>((rect.y - this.designerCanvas.containerBoundingRect.y) / this.designerCanvas.scaleFactor + Number.parseFloat(to[1].replace('px', '')) + dy));
          this._circle2.setAttribute('cx', <any>((rect.x - this.designerCanvas.containerBoundingRect.x) / this.designerCanvas.scaleFactor + Number.parseFloat(to[0].replace('px', '')) + dx));
          this._circle2.setAttribute('cy', <any>((rect.y - this.designerCanvas.containerBoundingRect.y) / this.designerCanvas.scaleFactor + Number.parseFloat(to[1].replace('px', '')) + dy));
        }
        break;
      case EventNames.PointerUp:
        (<Element>event.target).releasePointerCapture(event.pointerId);
        
        if (this._startPos) {
          const dx = normalized.x - this._startPos.x;
          const dy = normalized.y - this._startPos.y;
          const x = Number.parseFloat(to[0].replace('px', ''));
          const y = Number.parseFloat(to[1].replace('px', ''));
          const newX = (dx + x);
          const newY = (dy + y);
          const przX = Math.round(newX / rectNr.width * 10000) / 100;
          const przY = Math.round(newY / rectNr.height * 10000) / 100;
          this.extendedItem.setStyle('transform-origin', przX + '% ' + przY + '%');
          // this.extendedItem.setStyle('transform-origin', this._circle.getAttribute('cx') + ' ' + this._circle.getAttribute('cy'), true);
          this.refresh();
          this._startPos = null;
        }
        break;
    }
  }

  override refresh() {
    this._removeAllOverlays();
    this.extend();
  }

  override dispose() {
    this._removeAllOverlays();
  }
}