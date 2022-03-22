import { BaseCustomWebComponentConstructorAppend, css, html, TypedEvent } from "@node-projects/base-custom-webcomponent";
import { DesignerToolRenderer } from "./designerToolRenderer";
import { ToolPopupCategoryCollection } from "./designerToolsButtons";

export class DesignerToolbarPopupToolSelect extends BaseCustomWebComponentConstructorAppend {
  static override readonly style = css`
      .popup-tool-select {
          display: flex;
          flex-wrap: wrap;
      }

      .tool {
          height: 32px;
          width: 32px;
          background-color: rgb(255, 255, 255);
          background-size: 65%;
          background-repeat: no-repeat;
          background-position: center center;
          flex-shrink: 0;
          border-bottom: 1px solid black;
    }`;

  static override readonly template = html`
        <div id="popup-tool-select" class="popup-tool-select"></div>`;

  private _popupToolSelected: HTMLDivElement;

  //TODO: remove this element. it only contains a div, and binds events. 
  //  this could also be done by the user of this
  constructor() {
    super();
    this._popupToolSelected = this._getDomElement<HTMLDivElement>("popup-tool-select");
  }

  public readonly toolActivated = new TypedEvent<ToolPopupCategoryCollection>();

  public async insertToolContent(template: HTMLTemplateElement) {
    this._popupToolSelected.appendChild(template.content.cloneNode(true));
    await this._waitForChildrenReady();
    this._setupEventHandler();
  }

  private _setupEventHandler() {
    for (let tool of [...this._popupToolSelected.querySelectorAll("div.tool")]) {
      tool.addEventListener("click", () => this._toolSelected(<HTMLDivElement>tool));
    }
  }

  private _toolSelected(tool: HTMLDivElement) {
    this.toolActivated.emit(DesignerToolRenderer.createObjectFromTool(tool))
  }
}
customElements.define('node-projects-designer-tools-popup-select', DesignerToolbarPopupToolSelect);