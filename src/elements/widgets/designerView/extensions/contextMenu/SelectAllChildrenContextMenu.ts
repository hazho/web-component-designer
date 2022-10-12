import { IContextMenuItem } from "../../../../helper/contextMenu/IContextMenuItem";
import { IDesignItem } from "../../../../item/IDesignItem";
import { NodeType } from "../../../../item/NodeType.js";
import { IDesignerCanvas } from "../../IDesignerCanvas";
import { ContextmenuInitiator, IContextMenuExtension } from "./IContextMenuExtension";

export class SelectAllChildrenContextMenu implements IContextMenuExtension {

  public shouldProvideContextmenu(event: MouseEvent, designerView: IDesignerCanvas, designItem: IDesignItem, initiator: ContextmenuInitiator) {
    return designItem.hasChildren;
  }

  public provideContextMenuItems(event: MouseEvent, designerCanvas: IDesignerCanvas, designItem: IDesignItem): IContextMenuItem[] {
    return [{
      title: 'select all Children', action: () => {
        designerCanvas.instanceServiceContainer.selectionService.setSelectedElements(Array.from(designItem.children()).filter(x => x.nodeType == NodeType.Element));
      }
    }];
  }
}