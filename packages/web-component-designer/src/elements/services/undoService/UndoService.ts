import { ITransactionItem } from './ITransactionItem.js';
import { ChangeGroup } from "./ChangeGroup.js";
import { IUndoService } from './IUndoService.js';
import { IDesignerCanvas } from '../../widgets/designerView/IDesignerCanvas.js';

/*
 * Manages a stack of available undo/redo actions
 */
export class UndoService implements IUndoService {
  private _undoStack: ITransactionItem[] = [];
  private _redoStack: ITransactionItem[] = [];
  private _transactionStack: ChangeGroup[] = [];
  private _designerCanvas: IDesignerCanvas;

  constructor(designerCanvas: IDesignerCanvas) {
    this._designerCanvas = designerCanvas;
  }

  openGroup(title: string): ChangeGroup {
    let t = new ChangeGroup(title, (t) => this.commitTransactionItem(t), (t) => this.abortTransactionItem(t));
    this._transactionStack.push(t);
    return t;
  }

  private commitTransactionItem(transactionItem: ITransactionItem) {
    let itm = this._transactionStack.pop();
    if (itm !== transactionItem) {
      this.clear();
      throw "UndoService - Commited Transaction was not the last";
    }
    if (itm.undoStack.length) {
      if (this._transactionStack.length > 0) {
        this._transactionStack[this._transactionStack.length - 1].addCommitedSubchangeGroup(itm);
      } else {
        this._undoStack.push(itm);
        this._redoStack = [];
      }
    }
    if (this._transactionStack.length == 0) {
      this._designerCanvas.extensionManager.refreshAllExtensions(transactionItem.affectedItems);
      this._designerCanvas.onContentChanged.emit();
    }
  }

  private abortTransactionItem(transactionItem: ITransactionItem) {
    if (this._transactionStack.length > 0) {
      let itm = this._transactionStack.pop();
      if (itm !== transactionItem) {
        this.clear();
        throw "UndoService - Aborted Transaction was not the last";
      }
      itm.undo();
    }
  }

  execute(item: ITransactionItem) {
    if (this._transactionStack.length == 0) {
      item.do();
      this._undoStack.push(item);
      this._redoStack = [];
    } else {
      this._transactionStack[this._transactionStack.length - 1].execute(item);
    }
    if (this._transactionStack.length == 0) {
      this._designerCanvas.extensionManager.refreshAllExtensions(item.affectedItems);
      this._designerCanvas.onContentChanged.emit();
    }
  }

  clear() {
    this._undoStack = [];
    this._redoStack = [];
    this._transactionStack = [];
  }

  clearTransactionstackIfNotEmpty() {
    if (this._transactionStack.length) {
      console.error("transactionStack was not empty, but should be", this._transactionStack);
      this._transactionStack = [];
    }
  }

  undo() {
    if (!this.canUndo())
      return;
    if (this._transactionStack.length != 0)
      throw "Cannot Undo while transaction is running";

    let item = this._undoStack.pop();
    try {
      item.undo();
      this._redoStack.push(item);
    } catch (err) {
      this.clear();
      throw err;
    }
    this._designerCanvas.extensionManager.refreshAllExtensions(item.affectedItems);
    this._designerCanvas.onContentChanged.emit();
  }

  redo() {
    if (!this.canRedo())
      return;
    if (this._transactionStack.length != 0)
      throw "Cannot Redo while transaction is running";

    let item = this._redoStack.pop();
    try {
      item.do();
      this._undoStack.push(item);
    } catch (err) {
      this.clear();
      throw err;
    }
    this._designerCanvas.extensionManager.refreshAllExtensions(item.affectedItems);
    this._designerCanvas.onContentChanged.emit();
  }

  canUndo(): boolean {
    return this._undoStack.length > 0;
  }

  canRedo(): boolean {
    return this._redoStack.length > 0;
  }

  *getUndoEntries(count: number = 999): Generator<string, void, unknown> {
    for (let i = Math.min(this._undoStack.length, count) - 1; i >= 0; i--)
      yield this._undoStack[i].title;
  }

  *getRedoEntries(count: number = 999): Generator<string, void, unknown> {
    for (let i = Math.min(this._redoStack.length, count) - 1; i >= 0; i--)
      yield this._redoStack[i].title;
  }
}
