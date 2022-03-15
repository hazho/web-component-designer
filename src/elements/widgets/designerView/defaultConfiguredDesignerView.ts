import { DesignerView } from "./designerView";

export class DefaultConfiguredDesignerView extends DesignerView {
  constructor(){
    super();
  }

  override async ready() {
    const createDefaultServiceContainer = await (await import('../../services/DefaultServiceBootstrap.js')).default;
    this.initialize(createDefaultServiceContainer());
  }
}

customElements.define('node-projects-default-configured-designer-view', DefaultConfiguredDesignerView);