import { IDesignerCanvas } from "../../widgets/designerView/IDesignerCanvas.js";

export interface IDragDropService {
  dragOver(event: DragEvent): 'none' | 'copy' | 'link' | 'move';
  drop(designerCanvas: IDesignerCanvas, event: DragEvent);
}